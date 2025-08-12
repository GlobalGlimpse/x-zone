import React, { useMemo, useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import ParticlesBackground from '@/components/ParticlesBackground';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  RotateCcw,
  ChevronDown,
  Filter,
  X,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle,
  Search,
  DollarSign,
  Globe,
  Hash,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Power,
  MousePointerClick
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */
interface Currency {
  code: string;
  symbol: string;
  name: string;
  deleted_at: string | null;
}

interface Pagination<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

type Props = {
  currencies: Pagination<Currency>;
  flash?: { success?: string; error?: string };
};

type SortDirection = 'asc' | 'desc';
type FilterType = { field: 'name' | 'status'; value: string };

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */
export default function CurrenciesIndex({ currencies, flash }: Props) {
  const currenciesArray = currencies.data;

  /* ------------------------------- STATES -------------------------------- */
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'name' | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedCurrencyCodes, setSelectedCurrencyCodes] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentFilterField, setCurrentFilterField] = useState<FilterType['field']>('name');
  const [currentFilterValue, setCurrentFilterValue] = useState('');
  const [showSuccess, setShowSuccess] = useState(!!flash?.success);
  const [showError, setShowError] = useState(!!flash?.error);

  /* ---------------------------- FLASH EFFECTS ---------------------------- */
  useEffect(() => {
    if (flash?.success) {
      setShowSuccess(true);
      const t = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(t);
    }
  }, [flash?.success]);

  useEffect(() => {
    if (flash?.error) {
      setShowError(true);
      const t = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(t);
    }
  }, [flash?.error]);

  /* ------------------------------ FILTERS -------------------------------- */
  const filterOptions = [
    { value: 'name', label: 'Nom' },
    { value: 'status', label: 'Statut' },
  ];

  const addFilter = () => {
    if (!currentFilterValue) return;
    setActiveFilters((p) => [
      ...p,
      { field: currentFilterField, value: currentFilterValue },
    ]);
    setCurrentFilterValue('');
  };

  const removeFilter = (i: number) =>
    setActiveFilters((p) => p.filter((_, idx) => idx !== i));

  const clearAllFilters = () => setActiveFilters([]);

  /* --------------------------- DATA DERIVATION --------------------------- */
  const filteredCurrencies = useMemo(() => {
    return currenciesArray.filter((currency) =>
      activeFilters.every((f) => {
        if (f.field === 'name')
          return currency.name.toLowerCase().includes(f.value.toLowerCase());
        if (f.field === 'status')
          return f.value.toLowerCase() === 'actif'
            ? !currency.deleted_at
            : !!currency.deleted_at;
        return true;
      }),
    );
  }, [currenciesArray, activeFilters]);

  const sortedCurrencies = useMemo(() => {
    return [...filteredCurrencies].sort((a, b) => {
      if (sortField === 'status') {
        const cmp =
          !a.deleted_at === !b.deleted_at ? 0 : !a.deleted_at ? -1 : 1;
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      const cmp = a.name.localeCompare(b.name);
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [filteredCurrencies, sortField, sortDirection]);

  const paginatedCurrencies = useMemo(() => {
    if (rowsPerPage === -1) return sortedCurrencies;
    const start = (currentPage - 1) * rowsPerPage;
    return sortedCurrencies.slice(start, start + rowsPerPage);
  }, [sortedCurrencies, currentPage, rowsPerPage]);

  const totalPages = useMemo(
    () => (rowsPerPage === -1 ? 1 : Math.ceil(filteredCurrencies.length / rowsPerPage)),
    [filteredCurrencies.length, rowsPerPage],
  );

  const windowPages = useMemo(() => {
    const win = 5;
    const out: (number | '…')[] = [];

    if (totalPages <= win + 2) {
      for (let i = 1; i <= totalPages; i++) out.push(i);
    } else {
      out.push(1);
      const s = Math.max(2, currentPage - 1);
      const e = Math.min(totalPages - 1, currentPage + 1);
      if (s > 2) out.push('…');
      for (let i = s; i <= e; i++) out.push(i);
      if (e < totalPages - 1) out.push('…');
      out.push(totalPages);
    }
    return out;
  }, [currentPage, totalPages]);

  /* ------------------------------- CRUD --------------------------------- */
  const changeSort = (f: 'name' | 'status') => {
    if (sortField === f) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else {
      setSortField(f);
      setSortDirection('asc');
    }
  };

  const changePage = (p: number) => setCurrentPage(p);

  const handleDelete = async (code: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette devise ?')) return;
    try {
      await router.delete(route('currencies.destroy', { currency: code }), { preserveScroll: true });
      setSelectedCurrencyCodes((p) => p.filter((c) => c !== code));
    } catch {
      alert('Une erreur est survenue lors de la suppression.');
    }
  };

  const restoreCurrency = (code: string) => {
    if (!confirm('Voulez-vous restaurer cette devise ?')) return;
    router.post(route('currencies.restore', { id: code }), {}, { preserveScroll: true });
  };

  const deleteSelectedCurrencies = () => {
    if (!selectedCurrencyCodes.length) return;
    if (!confirm(`Supprimer ${selectedCurrencyCodes.length} devise(s) ?`)) return;
    Promise.all(
      selectedCurrencyCodes.map((code) =>
        router.delete(route('currencies.destroy', { currency: code }), { preserveScroll: true }),
      ),
    )
      .then(() => setSelectedCurrencyCodes([]))
      .catch(() =>
        alert('Une erreur est survenue lors de la suppression de certaines devises.'),
      );
  };

  const restoreSelectedCurrencies = () => {
    if (!selectedCurrencyCodes.length) return;
    if (!confirm(`Restaurer ${selectedCurrencyCodes.length} devise(s) ?`)) return;
    Promise.all(
      selectedCurrencyCodes.map((code) =>
        router.post(route('currencies.restore', { id: code }), {}, { preserveScroll: true }),
      ),
    )
      .then(() => setSelectedCurrencyCodes([]))
      .catch(() =>
        alert('Une erreur est survenue lors de la restauration de certaines devises.'),
      );
  };

  /* ------------------------- SELECTION HELPERS -------------------------- */
  const toggleSelectCurrency = (code: string) =>
    setSelectedCurrencyCodes((p) => (p.includes(code) ? p.filter((c) => c !== code) : [...p, code]));

  const toggleSelectAll = () => {
    if (!paginatedCurrencies.length) return;
    setSelectedCurrencyCodes((p) =>
      p.length === paginatedCurrencies.length ? [] : paginatedCurrencies.map((c) => c.code),
    );
  };

  const allSelected =
    selectedCurrencyCodes.length && paginatedCurrencies.every((c) => selectedCurrencyCodes.includes(c.code));

  const anySelectedInactive = selectedCurrencyCodes.some(
    (code) => currenciesArray.find((c) => c.code === code)?.deleted_at,
  );
  const anySelectedActive = selectedCurrencyCodes.some(
    (code) => !currenciesArray.find((c) => c.code === code)?.deleted_at,
  );

  /* ---------------------------------------------------------------------- */
  /*                                 RENDER                                 */
  /* ---------------------------------------------------------------------- */
  return (
    <>
      <Head title="Devises" />
      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Devises', href: '/currencies' },
        ]}
      >
        {/* BACKGROUND + PARTICLES */}
        <div className="relative">
          <ParticlesBackground />

          <div className="relative z-10 w-full py-6 px-4">
            {/* --------------------------- FLASH --------------------------- */}
            {flash?.success && showSuccess && (
              <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-start gap-3 dark:bg-green-900 dark:border-green-700 dark:text-green-100 animate-fade-in">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p className="flex-1 font-medium">{flash.success}</p>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="text-green-500 hover:text-green-700 dark:text-green-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            {flash?.error && showError && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 dark:bg-red-900 dark:border-red-700 dark:text-red-100 animate-fade-in">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="flex-1 font-medium">{flash.error}</p>
                <button
                  onClick={() => setShowError(false)}
                  className="text-red-500 hover:text-red-700 dark:text-red-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* ------------------------ TITLE ------------------------ */}
            <div className="flex items-center gap-3 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Gestion des devises
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Administration et gestion des devises monétaires
                </p>
              </div>
            </div>

            {/* ------------------- FILTER / TOOLS ------------------- */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 backdrop-blur-md rounded-xl shadow-xl p-6 mb-6">
              <div className="flex flex-wrap justify-between gap-4">
                {/* LEFT BLOCK */}
                <div className="flex flex-col gap-4 w-full lg:w-auto">
                  <div className="flex items-center gap-3">
                    <Button onClick={() => setShowFilterPanel(!showFilterPanel)}>
                      <Filter className="w-4 h-4" />
                      {showFilterPanel ? 'Masquer les filtres' : 'Afficher les filtres'}
                    </Button>

                    {activeFilters.length > 0 && (
                      <Button variant="outline" onClick={clearAllFilters} className="gap-1.5">
                        <X className="w-4 h-4" /> Effacer filtres
                      </Button>
                    )}

                    {selectedCurrencyCodes.length > 0 && (
                      <>
                        {anySelectedInactive && (
                          <Button variant="secondary" onClick={restoreSelectedCurrencies}>
                            <RotateCcw className="w-4 h-4 mr-1" /> Restaurer (
                            {selectedCurrencyCodes.length})
                          </Button>
                        )}
                        {anySelectedActive && (
                          <Button variant="destructive" onClick={deleteSelectedCurrencies}>
                            <Trash2 className="w-4 h-4 mr-1" /> Supprimer (
                            {selectedCurrencyCodes.length})
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {/* FILTER PANEL */}
                  {showFilterPanel && (
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 w-full lg:max-w-xl">
                      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4" /> Filtrer les devises
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                        <select
                          value={currentFilterField}
                          onChange={(e) =>
                            setCurrentFilterField(e.target.value as FilterType['field'])
                          }
                          className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                        >
                          {filterOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>

                        <div className="sm:col-span-2">
                          {currentFilterField === 'status' ? (
                            <select
                              value={currentFilterValue}
                              onChange={(e) => setCurrentFilterValue(e.target.value)}
                              className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                            >
                              <option value="">Sélectionner un statut</option>
                              <option value="actif">Actif</option>
                              <option value="désactivé">Désactivé</option>
                            </select>
                          ) : (
                            <div className="relative flex">
                              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                              <input
                                value={currentFilterValue}
                                onChange={(e) => setCurrentFilterValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addFilter()}
                                placeholder={`Filtrer par ${currentFilterField}`}
                                className="flex-1 border rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                              />
                              <Button onClick={addFilter} disabled={!currentFilterValue} className="ml-2">
                                Ajouter
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {currentFilterField === 'status' && (
                        <Button onClick={addFilter} disabled={!currentFilterValue}>
                          Ajouter le filtre
                        </Button>
                      )}
                    </div>
                  )}

                  {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeFilters.map((f, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200 px-3 py-1.5 rounded-lg text-sm"
                        >
                          <span className="font-medium">
                            {filterOptions.find((o) => o.value === f.field)?.label}:
                          </span>
                          {f.value}
                          <button onClick={() => removeFilter(i)}>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT BLOCK */}
                <div className="flex items-center gap-3 ml-auto">
                  <div className="relative min-w-[220px]">
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-4 pr-10 py-2.5 text-sm text-slate-600 dark:text-slate-100 focus:outline-none"
                    >
                      {[5, 10, 20, 50].map((n) => (
                        <option key={n} value={n}>
                          {n} lignes par page
                        </option>
                      ))}
                      <option value={-1}>Tous les enregistrements</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <Link href="/currencies/create">
                    <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-600 shadow-md">
                      <Plus className="w-4 h-4 mr-1" /> Ajouter une devise
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* -------------------------- TABLE -------------------------- */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 backdrop-blur-md rounded-xl shadow-xl overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase text-xs">
                  <tr>
                    <th className="w-[50px] px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!allSelected}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-red-600"
                      />
                    </th>
                    <th className="px-6 py-3 text-left cursor-pointer" onClick={() => changeSort('name')}>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Nom {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Symbole
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Hash className="w-4 h-4" />
                        Code
                      </div>
                    </th>
                    <th className="w-[120px] px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => changeSort('status')}>
                        <Power className="w-4 h-4" />
                        Statut
                        {sortField === 'status' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                      </div>
                    </th>
                    <th className="w-[120px] px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <MousePointerClick className="w-4 h-4" />
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {paginatedCurrencies.length ? (
                    paginatedCurrencies.map((currency) => (
                      <tr
                        key={currency.code}
                        className={`${
                          currency.deleted_at ? 'bg-red-50 dark:bg-red-900/10' : ''
                        } hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}
                      >
                        {/* checkbox */}
                        <td className="text-center px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedCurrencyCodes.includes(currency.code)}
                            onChange={() => toggleSelectCurrency(currency.code)}
                            className="rounded border-slate-300 text-red-600"
                          />
                        </td>

                        {/* name */}
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          {currency.name}
                        </td>

                        {/* symbol */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                            {currency.symbol}
                          </span>
                        </td>

                        {/* code */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200">
                            {currency.code}
                          </span>
                        </td>

                        {/* status */}
                        <td className="px-6 py-4 text-center min-w-[100px]">
                          {currency.deleted_at ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Désactivé
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Actif
                            </span>
                          )}
                        </td>

                        {/* actions */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            {currency.deleted_at ? (
                              <button
                                onClick={() => restoreCurrency(currency.code)}
                                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                                aria-label="Restaurer"
                              >
                                <RotateCcw className="w-5 h-5" />
                              </button>
                            ) : (
                              <>
                                <Link
                                  href={route('currencies.show', currency.code)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-800/30"
                                  aria-label="Voir"
                                >
                                  <Eye className="w-5 h-5" />
                                </Link>
                                <Link
                                  href={route('currencies.edit', currency.code)}
                                  className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 p-1 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-800/30"
                                  aria-label="Éditer"
                                >
                                  <Pencil className="w-5 h-5" />
                                </Link>
                                <button
                                  onClick={() => handleDelete(currency.code)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-800/30"
                                  aria-label="Supprimer"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    /* empty state */
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <Globe className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                          <div>
                            <p className="font-medium">Aucune devise trouvée</p>
                            <p className="text-xs">Aucune devise ne correspond aux critères de recherche</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* ----------------------- FOOTER ----------------------- */}
              <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 dark:text-slate-300">
                    {rowsPerPage === -1
                      ? `Affichage de toutes les ${filteredCurrencies.length} devises`
                      : `Affichage de ${Math.min(
                          (currentPage - 1) * rowsPerPage + 1,
                          filteredCurrencies.length,
                        )} à ${Math.min(
                          currentPage * rowsPerPage,
                          filteredCurrencies.length,
                        )} sur ${filteredCurrencies.length} devises`}
                  </span>
                </div>

                {rowsPerPage !== -1 && totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => changePage(1)}
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => changePage(currentPage - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    {windowPages.map((p, idx) =>
                      p === '…' ? (
                        <span key={idx} className="px-2 select-none text-slate-400">
                          …
                        </span>
                      ) : (
                        <Button
                          key={p}
                          size="sm"
                          variant={p === currentPage ? 'default' : 'outline'}
                          onClick={() => changePage(p as number)}
                        >
                          {p}
                        </Button>
                      ),
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => changePage(currentPage + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => changePage(totalPages)}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
