import React, { useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';

import AppLayout from '@/layouts/app-layout';
import ParticlesBackground from '@/components/ParticlesBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Search,
  Filter,
  Building2,
  Calendar,
  DollarSign,
  Package,
  CheckCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  Eye,
  Download,
  ChevronDown,
  Receipt,
} from 'lucide-react';

import { Pagination } from '@/types';

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */
interface Invoice {
  id: string;
  invoice_number: string;
  status: 'draft' | 'sent' | 'issued' | 'paid' | 'partially_paid' | 'cancelled' | 'refunded';
  invoice_date: string;
  subtotal_ht: number;
  total_tax: number;
  total_ttc: number;
  currency: {
    code: string;
    symbol: string;
  };
  client: {
    id: number;
    company_name: string;
    contact_name?: string;
  };
  user?: { name: string };
  items_count: number;
  deleted_at?: string;
  created_at: string;
}

interface Client {
  id: number;
  company_name: string;
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */
export default function InvoicesIndex() {
  const { props } = usePage() as any;

  // props avec défauts sûrs
  const raw     = (props.invoices ?? {
    data: [] as Invoice[],
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
    total: 0,
    per_page: 15,
  }) as Pagination<Invoice>;

  const clients = (props.clients ?? []) as Client[];
  const filters = (props.filters ?? {}) as {
    search?: string;
    status?: string;
    client_id?: string;
  };

  /* ----------------------- Pagination safe destructuring ---------------------- */
  const {
    data: rows = [],
    current_page = 1,
    last_page = 1,
    from = 0,
    to = 0,
    total = 0,
    per_page = 15,
  } = raw ?? { data: [] };

  /* ------------------------------ UI STATE ----------------------------------- */
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [searchVal,   setSearchVal]   = useState<string>(filters.search    ?? '');
  const [statusVal,   setStatusVal]   = useState<string>(filters.status    ?? '');
  const [clientIdVal, setClientIdVal] = useState<string>(filters.client_id ?? '');

  /* ------------------------------ Helpers ------------------------------------ */
  const go = (extra: Record<string, any> = {}) =>
    router.get(
      route('invoices.index'),
      {
        search: searchVal || undefined,
        status: statusVal || undefined,
        client_id: clientIdVal || undefined,
        per_page: per_page,
        ...extra,
      },
      { preserveScroll: true, preserveState: true },
    );

  const changePage = (p: number) => go({ page: p });
  const changePer  = (n: number)  => go({ page: 1, per_page: n });

  const windowPages = useMemo<(number | '…')[]>(() => {
    const pages: (number | '…')[] = [];
    const MAX = 5;
    const c = current_page;
    const l = last_page;

    if (l <= MAX + 2) {
      for (let i = 1; i <= l; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    let start = Math.max(2, c - Math.floor(MAX / 2));
    let end = start + MAX - 1;

    if (end >= l) {
      end = l - 1;
      start = end - MAX + 1;
    }

    if (start > 2) pages.push('…');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < l - 1) pages.push('…');
    pages.push(l);

    return pages;
  }, [current_page, last_page]);

  // Badge aligné sur Show.tsx (mêmes couleurs/labels)
  const getStatusBadge = (status: Invoice['status']) => {
    const variants: Record<Invoice['status'], { label: string; class: string }> = {
      draft:          { label: 'Brouillon',              class: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400' },
      sent:           { label: 'Envoyée',                class: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400' },
      issued:         { label: 'Émise',                  class: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400' },
      partially_paid: { label: 'Partiellement payée',    class: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' },
      paid:           { label: 'Payée',                  class: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' },
      cancelled:      { label: 'Annulée',                class: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400' },
      refunded:       { label: 'Remboursée',             class: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' },
    };
    return variants[status];
  };

  const formatCurrency = (amount: number, currency: { symbol: string }) =>
    `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency.symbol}`;

  const handleDelete = (inv: Invoice) => {
    if (confirm(`Supprimer la facture « ${inv.invoice_number} » ?`)) {
      router.delete(route('invoices.destroy', inv.id), {
        onSuccess: () => toast.success('Facture supprimée avec succès'),
        onError:   () => toast.error('Erreur lors de la suppression'),
      });
    }
  };

  /* -------------------------------------------------------------------- */
  /*                                 RENDER                               */
  /* -------------------------------------------------------------------- */
  return (
    <>
      <Head title="Factures" />

      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Factures', href: '/invoices' },
        ]}
      >
        <div className="relative">
          <ParticlesBackground />

          <div className="relative z-10 w-full py-6 px-4">
            {/* -------------------------------- Header -------------------------------- */}
            <div className="flex items-center gap-3 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Gestion des factures
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Liste et suivi de la facturation client
                </p>
              </div>
            </div>

            {/* -------------------------------- Tools --------------------------------- */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 backdrop-blur-md rounded-xl shadow-xl p-6 mb-6">
              <div className="flex flex-wrap gap-4 justify-between">
                {/* Bloc gauche : filtres */}
                <div className="flex flex-col gap-4 w-full lg:w-auto">
                  <div className="flex items-center gap-3">
                    <Button onClick={() => setShowFilterPanel((v) => !v)}>
                      <Filter className="w-4 h-4" />
                      {showFilterPanel ? 'Masquer les filtres' : 'Afficher les filtres'}
                    </Button>
                  </div>

                  {showFilterPanel && (
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 w-full lg:max-w-3xl relative z-[60]">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        {/* Recherche */}
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            className="pl-9"
                            placeholder="Rechercher par numéro, client..."
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && go({ page: 1 })}
                          />
                        </div>

                        {/* Statut */}
                        <Select value={statusVal} onValueChange={setStatusVal}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Tous</SelectItem>
                            <SelectItem value="draft">Brouillon</SelectItem>
                            <SelectItem value="sent">Envoyée</SelectItem>
                            <SelectItem value="issued">Émise</SelectItem>
                            <SelectItem value="paid">Payée</SelectItem>
                            <SelectItem value="partially_paid">Partiellement payée</SelectItem>
                            <SelectItem value="cancelled">Annulée</SelectItem>
                            <SelectItem value="refunded">Remboursée</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Client */}
                        <Select value={clientIdVal} onValueChange={setClientIdVal}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Client" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Tous les clients</SelectItem>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.company_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button onClick={() => go({ page: 1 })} className="w-full sm:w-auto">
                        Appliquer les filtres
                      </Button>
                    </div>
                  )}
                </div>

                {/* Bloc droit : rows per page */}
                <div className="flex items-center gap-3 ml-auto">
                  <div className="relative min-w-[220px]">
                    <select
                      value={per_page}
                      onChange={(e) => changePer(Number(e.target.value))}
                      className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-4 pr-10 py-2.5 text-sm text-slate-600 dark:text-slate-100"
                    >
                      {[5, 10, 15, 25, 50].map((n) => (
                        <option key={n} value={n}>
                          {n} lignes par page
                        </option>
                      ))}
                      <option value={-1}>Tous</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------- Table --------------------------------- */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 backdrop-blur-md rounded-xl shadow-xl overflow-auto">
              <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Receipt className="w-4 h-4" />
                        Numéro
                      </div>
                    </th>
                    <th className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        Client
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Statut
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Date
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Montant TTC
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Package className="w-4 h-4" />
                        Articles
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MoreHorizontal className="w-4 h-4" />
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-slate-500 dark:text-slate-400"
                      >
                        Aucune facture trouvée.
                      </td>
                    </tr>
                  ) : (
                    rows.map((inv) => (
                      <tr
                        key={inv.id}
                        className={`${inv.deleted_at ? 'bg-red-50 dark:bg-red-900/10' : ''} hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors`}
                      >
                        {/* Numéro */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Receipt className="w-5 h-5 text-slate-400" />
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {inv.invoice_number}
                              </div>
                              {inv.user?.name && (
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  Par {inv.user.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Client */}
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {inv.client.company_name}
                            </div>
                            {inv.client.contact_name && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {inv.client.contact_name}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(inv.status).class}`}>
                            {getStatusBadge(inv.status).label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-center">
                          <div className="text-xs">
                            <div className="font-medium">
                              {new Date(inv.invoice_date).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </td>

                        {/* Montant */}
                        <td className="px-6 py-4 text-center">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {formatCurrency(inv.total_ttc, inv.currency)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            HT: {formatCurrency(inv.subtotal_ht, inv.currency)}
                          </div>
                        </td>

                        {/* Articles */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                            {inv.items_count} article{inv.items_count > 1 ? 's' : ''}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            {inv.deleted_at ? (
                              <span className="text-slate-400 text-xs">Supprimée</span>
                            ) : (
                              <>
                                <Link
                                  href={route('invoices.show', inv.id)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-800/30"
                                  aria-label="Voir"
                                >
                                  <Eye className="w-5 h-5" />
                                </Link>

                                <a
                                  href={route('invoices.export-pdf', inv.id)}
                                  className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1 rounded-full hover:bg-purple-50 dark:hover:bg-purple-800/30"
                                  aria-label="Télécharger PDF"
                                >
                                  <Download className="w-5 h-5" />
                                </a>

                                {inv.status === 'draft' && (
                                  <button
                                    onClick={() => handleDelete(inv)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-800/30"
                                    aria-label="Supprimer"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ------------------------------ Pagination ------------------------------ */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 backdrop-blur-md rounded-xl shadow-xl mt-4 text-sm text-slate-700 dark:text-slate-200">
              <span>
                Affichage de {from} à {to} sur {total} factures
              </span>

              {last_page > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={current_page === 1}
                    onClick={() => changePage(1)}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={current_page === 1}
                    onClick={() => changePage(current_page - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {windowPages.map((p, idx) =>
                    p === '…' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 select-none">
                        …
                      </span>
                    ) : (
                      <Button
                        key={`page-${p}`}
                        size="sm"
                        variant={p === current_page ? 'default' : 'outline'}
                        onClick={() => changePage(p as number)}
                      >
                        {p}
                      </Button>
                    ),
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={current_page === last_page}
                    onClick={() => changePage(current_page + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={current_page === last_page}
                    onClick={() => changePage(last_page)}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
