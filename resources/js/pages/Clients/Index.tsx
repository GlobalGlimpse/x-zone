import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { PageProps, Pagination } from '@/types';
import AppLayout from '@/layouts/app-layout';
import ParticlesBackground from '@/components/ParticlesBackground';
import ModernDatePicker from '@/components/ModernDatePicker';
import { Button } from '@/components/ui/button';
import {
  Eye,
  MoreHorizontal,
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
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Building2,
  User,
  MapPin,
  Tag,
  FileText,
  Clock,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */
interface Client {
  id: string;
  company_name: string;
  contact_name?: string;
  email: string;
  phone?: string;
  ice?: string;
  tax_regime: 'normal' | 'auto_entrepreneur' | 'exonere';
  is_tva_subject: boolean;
  is_active: boolean;
  deleted_at?: string;
  quotes_count: number;
  orders_count: number;
  created_at: string;
}

interface ClientFilterType {
  field: 'search' | 'company_name' | 'contact_name' | 'email'| 'ice' | 'tax_regime' | 'status' | 'date';
  value: string;
  value2?: string;
  operator: 'contains' | 'equals' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'date_range';
}

interface ClientFilters {
  search?: string;
  company_name?: string;
  contact_name?: string;
  email?: string;
  ice?: string;
  tax_regime?: string;
  status?: string;
  date_start?: string;
  date_end?: string;
}

interface Flash {
  success?: string;
  error?: string;
}

interface Props extends PageProps<{
  clients: Pagination<Client>;
  filters: ClientFilters;
  sort: 'company_name' | 'contact_name' | 'email' | 'created_at' | 'quotes_count' | 'orders_count';
  dir: 'asc' | 'desc';
  flash?: Flash;
}> {}

/* -------------------------------------------------------------------------- */
/*                            UTILITY FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

/**
 * Convertit une date en string au format YYYY-MM-DD sans conversion UTC
 */
const formatDateToYMD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse une date string YYYY-MM-DD en objet Date local
 */
const parseDateFromYMD = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */
export default function ClientsIndex({
  clients,
  filters,
  sort,
  dir,
  flash,
}: Props) {
  /* ------------------------------ UI STATE ------------------------------ */
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentFilterField, setCurrentFilterField] =
    useState<ClientFilterType['field']>('search');
  const [currentFilterValue, setCurrentFilterValue] = useState('');
  const [currentFilterOperator, setCurrentFilterOperator] =
    useState<ClientFilterType['operator']>('contains');
  const [currentFilterValue2, setCurrentFilterValue2] = useState('');

  const [activeFilters, setActiveFilters] = useState<ClientFilterType[]>(() => {
    const arr: ClientFilterType[] = [];

    // Reconstruction des filtres depuis les props
    if (filters.search) {
      filters.search.split(/\s+/).forEach((v) =>
        arr.push({ field: 'search', value: v, operator: 'contains' })
      );
    }
    if (filters.company_name) {
      arr.push({ field: 'company_name', value: filters.company_name, operator: 'contains' });
    }
    if (filters.contact_name) {
      arr.push({ field: 'contact_name', value: filters.contact_name, operator: 'contains' });
    }
    if (filters.email) {
      arr.push({ field: 'email', value: filters.email, operator: 'contains' });
    }
    if (filters.ice) {
      arr.push({ field: 'ice', value: filters.ice, operator: 'contains' });
    }
    if (filters.tax_regime) {
      arr.push({ field: 'tax_regime', value: filters.tax_regime, operator: 'equals' });
    }
    if (filters.status) {
      arr.push({ field: 'status', value: filters.status, operator: 'equals' });
    }
    if (filters.date_start && filters.date_end) {
      arr.push({
        field: 'date',
        value: filters.date_start,
        value2: filters.date_end,
        operator: 'date_range'
      });
    }

    return arr;
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(!!flash?.success);
  const [showError, setShowError] = useState(!!flash?.error);

  const [startDate, setStartDate] = useState<Date | null>(
    filters.date_start ? parseDateFromYMD(filters.date_start) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    filters.date_end ? parseDateFromYMD(filters.date_end) : null
  );

  /* -------------------------- Flash auto-dismiss ------------------------ */
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

  /* ------------------------- Inertia helpers --------------------------- */
  const inertiaOpts = {
    preserveScroll: true,
    preserveState: true,
    only: ['clients', 'filters', 'sort', 'dir', 'flash'],
  } as const;

  const buildQueryPayload = (filtersList: ClientFilterType[], extra: Record<string, any> = {}) => {
    const payload: Record<string, any> = { ...extra };

    // Gestion du per_page
    if (payload.per_page === -1) {
      delete payload.per_page; // Laravel gérera sans limite
    }

    // Gestion des filtres
    filtersList.forEach(filter => {
      switch (filter.field) {
        case 'search':
          const searchTerms = filtersList
            .filter(f => f.field === 'search')
            .map(f => f.value)
            .join(' ');
          if (searchTerms) payload.search = searchTerms;
          break;

        case 'company_name':
          payload.company_name = filter.value;
          break;

        case 'contact_name':
          payload.contact_name = filter.value;
          break;

        case 'email':
          payload.email = filter.value;
          break;

        case 'ice':
          payload.ice = filter.value;
          break;

        case 'tax_regime':
          payload.tax_regime = filter.value;
          break;

        case 'status':
          payload.status = filter.value;
          break;

        case 'date':
          if (filter.operator === 'date_range' && filter.value2) {
            payload.date_start = filter.value;
            payload.date_end = filter.value2;
          }
          break;
      }
    });

    return payload;
  };

  const go = (filtersList: ClientFilterType[], extra: Record<string, any> = {}) => {
    const payload = buildQueryPayload(filtersList, extra);
    router.get(route('clients.index'), payload, inertiaOpts);
  };

  /* --------------------------- Filters CRUD ---------------------------- */
  const addFilter = () => {
    if (currentFilterField === 'date') {
      if (startDate && endDate) {
        const newFilter: ClientFilterType = {
          field: 'date',
          value: formatDateToYMD(startDate),
          value2: formatDateToYMD(endDate),
          operator: 'date_range'
        };

        const next = [
          ...activeFilters.filter(f => f.field !== 'date'),
          newFilter
        ];
        setActiveFilters(next);
        go(next, { page: 1, per_page: clients.per_page, sort, dir });
      }
    } else if (currentFilterValue) {
      const newFilter: ClientFilterType = {
        field: currentFilterField,
        value: currentFilterValue,
        operator: currentFilterOperator
      };

      const next = [
        ...activeFilters.filter(f => f.field !== currentFilterField),
        newFilter
      ];
      setActiveFilters(next);
      setCurrentFilterValue('');
      go(next, { page: 1, per_page: clients.per_page, sort, dir });
    }
  };

  const removeFilter = (idx: number) => {
    const filterToRemove = activeFilters[idx];
    if (filterToRemove.field === 'date') {
      setStartDate(null);
      setEndDate(null);
    }
    const next = activeFilters.filter((_, i) => i !== idx);
    setActiveFilters(next);
    go(next, { page: 1, per_page: clients.per_page, sort, dir });
  };

  const resetFilters = () => {
    setActiveFilters([]);
    setStartDate(null);
    setEndDate(null);
    setCurrentFilterValue('');
    setCurrentFilterValue2('');
    router.get(
      route('clients.index'),
      { page: 1, per_page: clients.per_page || 15 },
      inertiaOpts,
    );
  };

  /* ----------------------- Pagination & Tri --------------------------- */
  const changePage = (p: number) =>
    go(activeFilters, { page: p, per_page: clients.per_page || 15, sort, dir });

  const changePer = (n: number) =>
    go(activeFilters, { page: 1, per_page: n, sort, dir });

  const changeSort = (field: 'company_name' | 'contact_name' | 'email' | 'created_at' | 'quotes_count' | 'orders_count') => {
    const newDir = sort === field ? (dir === 'asc' ? 'desc' : 'asc') : 'asc';
    go(activeFilters, { page: 1, per_page: clients.per_page || 15, sort: field, dir: newDir });
  };

  /* ---------------------------- Selection ----------------------------- */
  const toggleSelect = (id: string) =>
    setSelectedIds((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id]));

  const toggleSelectAll = () => {
    const ids = clients.data.map((c) => c.id);
    setSelectedIds((p) => (p.length === ids.length ? [] : ids));
  };

  const anyInactive = selectedIds.some(
    (id) => clients.data.find((c) => c.id === id)?.deleted_at,
  );
  const anyActive = selectedIds.some(
    (id) => !clients.data.find((c) => c.id === id)?.deleted_at,
  );

  /* ---------------------- Bulk actions ---------------------- */
  const restoreSelected = () => {
    if (!selectedIds.length) return;
    if (!confirm(`Restaurer ${selectedIds.length} client(s) ?`)) return;
    Promise.all(
      selectedIds.map((id) =>
        router.post(route('clients.restore', { id }), {}, inertiaOpts),
      ),
    ).then(() => setSelectedIds([]));
  };

  const deleteSelected = () => {
    if (!selectedIds.length) return;
    if (!confirm(`Supprimer ${selectedIds.length} client(s) ?`)) return;
    Promise.all(
      selectedIds.map((id) =>
        router.delete(route('clients.destroy', { id }), inertiaOpts),
      ),
    ).then(() => setSelectedIds([]));
  };

  /* -------------------- Pagination window -------------------- */
  const windowPages = useMemo<(number | '…')[]>(() => {
    const pages: (number | '…')[] = [];
    const MAX = 5;
    const c = clients.current_page || 1;
    const l = clients.last_page || 1;

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
  }, [clients.current_page, clients.last_page]);

  /* -------------------------------------------------------------------- */
  const filterOptions = [
    { value: 'search', label: 'Recherche globale' },
    { value: 'company_name', label: 'Nom de l\'entreprise' },
    { value: 'contact_name', label: 'Nom du contact' },
    { value: 'email', label: 'Email' },
    { value: 'ice', label: 'ICE' },
    { value: 'tax_regime', label: 'Régime fiscal' },
    { value: 'status', label: 'Statut' },
    { value: 'date', label: 'Date de création' },
  ];

  const operatorOptions = {
    text: [
      { value: 'contains', label: 'Contient' },
      { value: 'equals', label: 'Égal à' },
    ],
  };

  const getFilterDisplayValue = (filter: ClientFilterType) => {
    if (filter.operator === 'date_range' && filter.value2) {
      const start = parseDateFromYMD(filter.value).toLocaleDateString('fr-FR');
      const end = parseDateFromYMD(filter.value2).toLocaleDateString('fr-FR');
      return `${start} - ${end}`;
    }
    return filter.value;
  };

  const getOperatorLabel = (operator?: ClientFilterType['operator']) => {
    if (!operator) return '';

    const allOperators = [...operatorOptions.text];
    const found = allOperators.find(op => op.value === operator);
    return found ? found.label : operator;
  };

  const getTaxRegimeLabel = (regime: string) =>
    ({
      normal: 'Normal',
      auto_entrepreneur: 'Auto-entrepreneur',
      exonere: 'Exonéré',
    }[regime as 'normal' | 'auto_entrepreneur' | 'exonere'] ?? regime);

  /* -------------------------------------------------------------------- */
  /*                                RENDER                                */
  /* -------------------------------------------------------------------- */
  return (
    <>
      <Head title="Clients" />
      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Clients', href: '/clients' },
        ]}
      >
        <div className="relative">
          <ParticlesBackground />

          <div className="relative z-10 w-full py-6 px-4">
            {/* ----------------------- Flash ----------------------- */}
            {flash?.success && showSuccess && (
              <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-start gap-3 dark:bg-green-900 dark:border-green-700 dark:text-green-100">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 font-medium">{flash.success}</span>
                <button onClick={() => setShowSuccess(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {flash?.error && showError && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 font-medium">{flash.error}</span>
                <button onClick={() => setShowError(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ----------------------- Header ----------------------- */}
            <div className="flex items-center gap-3 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Gestion des clients
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Gérez vos clients et leurs informations fiscales
                </p>
              </div>
            </div>

            {/* ----------------------- Tools ----------------------- */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 backdrop-blur-md rounded-xl shadow-xl p-6 mb-6 relative z-50">
              <div className="flex flex-wrap gap-4 justify-between">
                {/* Filter block */}
                <div className="flex flex-col gap-4 w-full lg:w-auto">
                  <div className="flex items-center gap-3">
                    <Button onClick={() => setShowFilterPanel(!showFilterPanel)}>
                      <Filter className="w-4 h-4" />
                      {showFilterPanel ? 'Masquer les filtres' : 'Afficher les filtres'}
                    </Button>

                    {activeFilters.length > 0 && (
                      <Button variant="outline" onClick={resetFilters} className="gap-1.5">
                        <X className="w-4 h-4" /> Effacer
                      </Button>
                    )}

                    {selectedIds.length > 0 && (
                      <>
                        {anyInactive && (
                          <Button variant="secondary" onClick={restoreSelected}>
                            <RotateCcw className="w-4 h-4 mr-1" /> Restaurer (
                            {selectedIds.length})
                          </Button>
                        )}
                        {anyActive && (
                          <Button variant="destructive" onClick={deleteSelected}>
                            <Trash2 className="w-4 h-4 mr-1" /> Supprimer (
                            {selectedIds.length})
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {showFilterPanel && (
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 w-full lg:max-w-2xl relative z-[60]">
                      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4" /> Filtrer les clients
                      </h3>

                      {/* Sélection du type de filtre */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <select
                          value={currentFilterField}
                          onChange={(e) => {
                            setCurrentFilterField(e.target.value as ClientFilterType['field']);
                            setCurrentFilterValue('');
                            setCurrentFilterValue2('');
                            setCurrentFilterOperator('contains');
                          }}
                          className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                        >
                          {filterOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Saisie des valeurs selon le type de filtre */}
                      <div className="mb-3">
                        {currentFilterField === 'date' ? (
                          <div className="flex flex-wrap items-center gap-3 relative z-[70]">
                            <div className="flex-1 min-w-[180px]">
                              <ModernDatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                placeholder="Date de début"
                                selectsStart={true}
                                startDate={startDate}
                                endDate={endDate}
                                className="w-full relative z-[80]"
                                popperClassName="z-[90]"
                              />
                            </div>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">à</span>
                            <div className="flex-1 min-w-[180px]">
                              <ModernDatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                placeholder="Date de fin"
                                selectsEnd={true}
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                className="w-full relative z-[80]"
                                popperClassName="z-[90]"
                              />
                            </div>
                          </div>
                        ) : currentFilterField === 'tax_regime' ? (
                          <select
                            value={currentFilterValue}
                            onChange={(e) => setCurrentFilterValue(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                          >
                            <option value="">Sélectionner un régime</option>
                            <option value="normal">Normal</option>
                            <option value="auto_entrepreneur">Auto-entrepreneur</option>
                            <option value="exonere">Exonéré</option>
                          </select>
                        ) : currentFilterField === 'status' ? (
                          <select
                            value={currentFilterValue}
                            onChange={(e) => setCurrentFilterValue(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                          >
                            <option value="">Sélectionner un statut</option>
                            <option value="active">Actif</option>
                            <option value="inactive">Inactif</option>
                          </select>
                        ) : (
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              value={currentFilterValue}
                              onChange={(e) => setCurrentFilterValue(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && addFilter()}
                              placeholder={`Filtrer par ${
                                filterOptions.find((o) => o.value === currentFilterField)?.label.toLowerCase() || ''
                              }`}
                              className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                            />
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={addFilter}
                        disabled={
                          currentFilterField === 'date'
                            ? !startDate || !endDate
                            : !currentFilterValue
                        }
                        className="w-full"
                      >
                        Ajouter le filtre
                      </Button>
                    </div>
                  )}

                  {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeFilters.map((f, i) => (
                        <span
                          key={`${f.field}-${f.value}-${i}`}
                          className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200 px-3 py-1.5 rounded-lg text-sm"
                        >
                          <span className="font-medium">
                            {filterOptions.find((o) => o.value === f.field)?.label}
                          </span>
                          <span className="text-xs opacity-75">
                            ({getOperatorLabel(f.operator)})
                          </span>
                          :
                          <span>{getFilterDisplayValue(f)}</span>
                          <button onClick={() => removeFilter(i)}>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right block - Rows per page + Add button */}
                <div className="flex items-center gap-3 ml-auto">
                  <div className="relative min-w-[220px]">
                    <select
                      value={clients.per_page || 15}
                      onChange={(e) => changePer(Number(e.target.value))}
                      className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-4 pr-10 py-2.5 text-sm text-slate-600 dark:text-slate-100"
                    >
                      {[5, 10, 20, 50].map((n) => (
                        <option key={n} value={n}>
                          {n} lignes par page
                        </option>
                      ))}
                      <option value={-1}>Tous</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <Link href={route('clients.create')}>
                    <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-600 shadow-md">
                      <Plus className="w-4 h-4 mr-1" /> Nouveau client
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* ----------------------- Table ----------------------- */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 backdrop-blur-md rounded-xl shadow-xl overflow-hidden relative z-10">
              <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === clients.data.length}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-red-600"
                      />
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => changeSort('company_name')}
                    >
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        Entreprise {sort === 'company_name' && (dir === 'asc' ? '▲' : '▼')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 cursor-pointer"
                      onClick={() => changeSort('contact_name')}
                    >
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Contact {sort === 'contact_name' && (dir === 'asc' ? '▲' : '▼')}
                      </div>
                    </th>
                    <th className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        ICE / Régime
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-center cursor-pointer"
                      onClick={() => changeSort('quotes_count')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <FileText className="w-4 h-4" />
                        Devis/Commandes {sort === 'quotes_count' && (dir === 'asc' ? '▲' : '▼')}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Statut
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-center cursor-pointer"
                      onClick={() => changeSort('created_at')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4" />
                        Créé {sort === 'created_at' && (dir === 'asc' ? '▲' : '▼')}
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
                  {clients.data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                      >
                        Aucun client trouvé.
                      </td>
                    </tr>
                  ) : (
                    clients.data.map((client) => (
                      <tr
                        key={client.id}
                        className={`${
                          client.deleted_at ? 'bg-red-50 dark:bg-red-900/10' : ''
                        } hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors`}
                      >
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(client.id)}
                            onChange={() => toggleSelect(client.id)}
                            className="rounded border-slate-300 text-red-600"
                          />
                        </td>

                        {/* Entreprise */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-slate-400" />
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {client.company_name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {client.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {client.contact_name || '—'}
                            </div>
                            {client.phone && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {client.phone}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* ICE / Régime */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded block">
                              {client.ice || 'Pas d\'ICE'}
                            </code>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {getTaxRegimeLabel(client.tax_regime)}
                            </span>
                          </div>
                        </td>

                        {/* Devis / Commandes */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                              {client.quotes_count}
                            </span>
                            <span className="text-slate-400">/</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                              {client.orders_count}
                            </span>
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="px-6 py-4 text-center">
                          {client.deleted_at ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Supprimé
                            </span>
                          ) : client.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                              Inactif
                            </span>
                          )}
                        </td>

                        {/* Date de création */}
                        <td className="px-6 py-4 text-center">
                          <div className="text-sm text-slate-900 dark:text-white">
                            {new Date(client.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            {client.deleted_at ? (
                              <button
                                onClick={() =>
                                  router.post(
                                    route('clients.restore', { id: client.id }),
                                    {},
                                    inertiaOpts,
                                  )
                                }
                                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                                aria-label="Restaurer"
                              >
                                <RotateCcw className="w-5 h-5" />
                              </button>
                            ) : (
                              <>
                                <Link
                                  href={route('clients.show', client.id)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-800/30"
                                  aria-label="Voir"
                                >
                                  <Eye className="w-5 h-5" />
                                </Link>
                                <Link
                                  href={route('clients.edit', client.id)}
                                  className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 p-1 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-800/30"
                                  aria-label="Modifier"
                                >
                                  <Pencil className="w-5 h-5" />
                                </Link>
                                <button
                                  onClick={() =>
                                    router.delete(
                                      route('clients.destroy', { id: client.id }),
                                      inertiaOpts,
                                    )
                                  }
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
                  )}
                </tbody>
              </table>
            </div>

            {/* --------------------- Pagination --------------------- */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 backdrop-blur-md rounded-xl shadow-xl mt-4 text-sm text-slate-700 dark:text-slate-200">
              <span>
                Affichage de {clients.from || 0} à {clients.to || 0} sur {clients.total || 0}{' '}
                résultats
              </span>

              {(clients.last_page || 1) > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={(clients.current_page || 1) === 1}
                    onClick={() => changePage(1)}
                    aria-label="Première page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={(clients.current_page || 1) === 1}
                    onClick={() => changePage(clients.current_page - 1)}
                    aria-label="Page précédente"
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
                        variant={p === (clients.current_page || 1) ? 'default' : 'outline'}
                        onClick={() => changePage(p as number)}
                      >
                        {p}
                      </Button>
                    ),
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={(clients.current_page || 1) === (clients.last_page || 1)}
                    onClick={() => changePage(clients.current_page + 1)}
                    aria-label="Page suivante"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={(clients.current_page || 1) === (clients.last_page || 1)}
                    onClick={() => changePage(clients.last_page)}
                    aria-label="Dernière page"
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
