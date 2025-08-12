import React, { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import ParticlesBackground from '@/components/ParticlesBackground';
import ModernDatePicker from '@/components/ModernDatePicker';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Clock,
  User,
  Database,
  Filter,
  X,
  Search,
  Plus,
  Minus,
  FileDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  Eye,
  Send,
  Download,
  Check,
  Tag,
} from 'lucide-react';
import {
  translateActionDescription,
  getActionColor,
  getActionIcon,
  getSubjectTypeName
} from '@/utils/activity-translations';

/* -------------------------------------------------------------------------- */
/* TYPES */
/* -------------------------------------------------------------------------- */
interface ActivityLog {
  id: number;
  description: string;
  subject_type: string;
  subject_id: string;
  causer: { name: string; email: string } | null;
  properties: Record<string, any> | null;
  created_at: string;
}

interface Props {
  logs: {
    data: ActivityLog[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
  };
  filters?: {
    user?: string;
    action?: string;
    subject_type?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
    sort?: string;
    direction?: string;
    per_page?: number;
  };
}

type FilterType = { field: 'user' | 'action' | 'subject_type' | 'search' | 'date'; value: string };

/* -------------------------------------------------------------------------- */
/* COMPONENTS */
/* -------------------------------------------------------------------------- */
// Composant pour l'icône d'action
const ActionIcon = ({ iconName, className = "w-4 h-4" }: { iconName: string; className?: string }) => {
  const icons = {
    Plus, Edit, Trash2, LogIn, LogOut, Eye, Send, Download, Check, X, Activity
  };

  const IconComponent = icons[iconName as keyof typeof icons] || Activity;
  return <IconComponent className={className} />;
};

// Composant pour afficher une action avec style
const ActionDisplay = ({ log }: { log: ActivityLog }) => {
  const translatedAction = translateActionDescription(log.description, log.subject_type);
  const actionColor = getActionColor(translatedAction);
  const actionIcon = getActionIcon(translatedAction);
  const subjectName = getSubjectTypeName(log.subject_type);

  return (
    <div className="flex flex-col gap-1">
      <div className={`flex items-center gap-2 font-medium text-sm ${actionColor}`}>
        <ActionIcon iconName={actionIcon} className="w-4 h-4" />
        {translatedAction}
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Tag className="w-3 h-3" />
        <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
          {subjectName}
        </span>
        <span className="text-slate-400">#{log.subject_id}</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* COMPONENT */
/* -------------------------------------------------------------------------- */
export default function AuditLogsIndex({ logs, filters = {} }: Props) {
  /* ------------------------------ STATES -------------------------------- */
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentFilterField, setCurrentFilterField] =
    useState<FilterType['field']>('search');
  const [currentFilterValue, setCurrentFilterValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(
    filters.start_date ? new Date(filters.start_date) : null,
  );
  const [endDate, setEndDate] = useState<Date | null>(
    filters.end_date ? new Date(filters.end_date) : null,
  );
  const [expanded, setExpanded] = useState<number[]>([]);

  /* ------------------------------ FILTERS -------------------------------- */
  const filterOptions = [
    { value: 'search', label: 'Recherche globale' },
    { value: 'user', label: 'Utilisateur' },
    { value: 'action', label: 'Action' },
    { value: 'subject_type', label: 'Type d\'objet' },
    { value: 'date', label: 'Plage de dates' },
  ];

  // Helper to build payload from current filters
  const buildPayloadFromFilters = (filters: FilterType[]) => {
    const payload: Record<string, any> = {
      page: 1,
      per_page: logs.per_page,
    };

    filters.forEach((filter) => {
      if (filter.field === 'date') {
        if (startDate) payload.start_date = startDate.toISOString().split('T')[0];
        if (endDate) payload.end_date = endDate.toISOString().split('T')[0];
      } else {
        payload[filter.field] = filter.value;
      }
    });

    return payload;
  };

  const addFilter = () => {
    let newFilters: FilterType[];

    if (currentFilterField === 'date') {
      if (startDate && endDate) {
        const dateRange = `${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')}`;
        newFilters = [
          ...activeFilters.filter((f) => f.field !== 'date'), // Remove existing date filter
          { field: 'date', value: dateRange },
        ];
        setActiveFilters(newFilters);
        applyFiltersWithData(newFilters);
      }
    } else if (currentFilterValue.trim()) {
      newFilters = [
        ...activeFilters.filter((f) => f.field !== currentFilterField), // Remove existing filter for this field
        { field: currentFilterField, value: currentFilterValue.trim() },
      ];
      setActiveFilters(newFilters);
      setCurrentFilterValue('');
      applyFiltersWithData(newFilters);
    }
  };

  const removeFilter = (i: number) => {
    const filterToRemove = activeFilters[i];
    if (filterToRemove.field === 'date') {
      setStartDate(null);
      setEndDate(null);
    }
    const newFilters = activeFilters.filter((_, idx) => idx !== i);
    setActiveFilters(newFilters);
    applyFiltersWithRemovedFilter(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setStartDate(null);
    setEndDate(null);
    setCurrentFilterValue('');
    resetFilters();
  };

  /* -------------------------- MEMO HELPERS ------------------------------ */
  const hasFilter = useMemo(() => activeFilters.length > 0, [activeFilters]);

  const windowPages = useMemo(() => {
    const win = 5;
    const { current_page: c, last_page: l } = logs;
    const out: (number | '…')[] = [];
    const push = (v: number | '…') => out.push(v);

    if (l <= win + 2) {
      for (let i = 1; i <= l; i++) push(i);
    } else {
      push(1);
      const s = Math.max(2, c - 1);
      const e = Math.min(l - 1, c + 1);
      if (s > 2) push('…');
      for (let i = s; i <= e; i++) push(i);
      if (e < l - 1) push('…');
      push(l);
    }
    return out;
  }, [logs]);

  const inertiaOpts = {
    preserveScroll: true,
    preserveState: true,
    only: ['logs', 'filters'],
  } as const;

  /* ------------------------------ ACTIONS ------------------------------- */
  const applyFiltersWithData = (filters: FilterType[]) => {
    const payload = buildPayloadFromFilters(filters);
    router.get(route('audit-logs.index'), payload, inertiaOpts);
  };

  const applyFiltersWithRemovedFilter = (filters: FilterType[]) => {
    const payload = buildPayloadFromFilters(filters);
    router.get(route('audit-logs.index'), payload, inertiaOpts);
  };

  const applyFilters = () => {
    const payload: Record<string, any> = {
      page: 1,
      per_page: logs.per_page,
    };

    // Apply active filters
    activeFilters.forEach((filter) => {
      if (filter.field === 'date') {
        if (startDate) payload.start_date = startDate.toISOString().split('T')[0];
        if (endDate) payload.end_date = endDate.toISOString().split('T')[0];
      } else {
        payload[filter.field] = filter.value;
      }
    });

    // Apply current filter being added
    if (currentFilterField === 'date') {
      if (startDate) payload.start_date = startDate.toISOString().split('T')[0];
      if (endDate) payload.end_date = endDate.toISOString().split('T')[0];
    } else if (currentFilterValue.trim()) {
      payload[currentFilterField] = currentFilterValue.trim();
    }

    router.get(route('audit-logs.index'), payload, inertiaOpts);
  };

  const resetFilters = () => {
    router.get(
      route('audit-logs.index'),
      { per_page: logs.per_page, page: 1 },
      inertiaOpts,
    );
  };

  const changePage = (p: number) => {
    const payload = buildPayloadFromFilters(activeFilters);
    payload.page = p;
    router.get(route('audit-logs.index'), payload, inertiaOpts);
  };

  const changePer = (n: number) => {
    const payload = buildPayloadFromFilters(activeFilters);
    payload.per_page = n;
    payload.page = 1;
    router.get(route('audit-logs.index'), payload, inertiaOpts);
  };

  const exportCsv = () => {
    const payload = buildPayloadFromFilters(activeFilters);
    delete payload.page;
    delete payload.per_page;
    window.open(route('audit-logs.export', payload), '_blank');
  };

  const toggleRow = (id: number) =>
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  /* ---------------------------------------------------------------------- */
  /* RENDER */
  /* ---------------------------------------------------------------------- */
  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Journaux d\'activité', href: '/audit-logs' },
      ]}
    >
      <Head title="Journal d'activités" />

      {/* BACKGROUND + PARTICLES */}
      <div className="relative">
        <ParticlesBackground />
        <div className="relative z-10 w-full py-6 px-4">
          {/* ------------------------ TITLE ------------------------ */}
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Journal d'activités
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Suivi et traçabilité de toutes les actions du système
              </p>
            </div>
          </div>

          {/* ------------------- FILTER / TOOLS ------------------- */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 backdrop-blur-md rounded-xl shadow-xl p-6 mb-6 relative z-40">
            <div className="flex flex-wrap justify-between gap-4">
              {/* LEFT BLOCK */}
              <div className="flex flex-col gap-4 w-full lg:w-auto">
                <div className="flex items-center gap-3">
                  <Button onClick={() => setShowFilterPanel(!showFilterPanel)}>
                    <Filter className="w-4 h-4" />
                    {showFilterPanel ? 'Masquer les filtres' : 'Afficher les filtres'}
                  </Button>
                  {hasFilter && (
                    <Button variant="outline" onClick={clearAllFilters} className="gap-1.5">
                      <X className="w-4 h-4" />
                      Effacer filtres
                    </Button>
                  )}
                </div>

                {/* FILTER PANEL */}
                {showFilterPanel && (
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 w-full lg:max-w-xl relative z-50">
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" />
                      Filtrer les journaux
                    </h3>

                    {/* FILTER TYPE SELECTOR - Always visible */}
                    <div className="mb-3">
                      <select
                        value={currentFilterField}
                        onChange={(e) =>
                          setCurrentFilterField(
                            e.target.value as FilterType['field'],
                          )
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                      >
                        {filterOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* FILTER INPUT BASED ON TYPE */}
                    {currentFilterField !== 'date' ? (
                      <div className="mb-3">
                        {currentFilterField === 'action' ? (
                          <div className="flex gap-2">
                            <select
                              value={currentFilterValue}
                              onChange={(e) => setCurrentFilterValue(e.target.value)}
                              className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                            >
                              <option value="">Sélectionner une action</option>
                              <option value="created">Création</option>
                              <option value="updated">Modification</option>
                              <option value="deleted">Suppression</option>
                              <option value="login">Connexion</option>
                              <option value="logout">Déconnexion</option>
                              <option value="viewed">Consultation</option>
                              <option value="sent">Envoi</option>
                              <option value="downloaded">Téléchargement</option>
                              <option value="approved">Approbation</option>
                            </select>
                            <Button
                              onClick={addFilter}
                              disabled={!currentFilterValue}
                            >
                              Ajouter
                            </Button>
                          </div>
                        ) : currentFilterField === 'subject_type' ? (
                          <div className="flex gap-2">
                            <select
                              value={currentFilterValue}
                              onChange={(e) => setCurrentFilterValue(e.target.value)}
                              className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                            >
                              <option value="">Sélectionner un type d'objet</option>
                              <option value="App\Models\User">Utilisateur</option>
                              <option value="App\Models\Product">Produit</option>
                              <option value="App\Models\Order">Commande</option>
                              <option value="App\Models\Category">Catégorie</option>
                              <option value="App\Models\Setting">Paramètre</option>
                            </select>
                            <Button
                              onClick={addFilter}
                              disabled={!currentFilterValue}
                            >
                              Ajouter
                            </Button>
                          </div>
                        ) : currentFilterField === 'user' ? (
                          <div className="flex gap-2">
                            <select
                              value={currentFilterValue}
                              onChange={(e) => setCurrentFilterValue(e.target.value)}
                              className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                            >
                              <option value="">Sélectionner un utilisateur</option>
                              <option value="__system__">Système (actions automatiques)</option>
                            </select>
                            <input
                              value={currentFilterValue !== '__system__' ? currentFilterValue : ''}
                              onChange={(e) => setCurrentFilterValue(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && addFilter()}
                              placeholder="Ou saisir nom/email utilisateur"
                              className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                            />
                            <Button
                              onClick={addFilter}
                              disabled={!currentFilterValue}
                            >
                              Ajouter
                            </Button>
                          </div>
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
                            <Button
                              onClick={addFilter}
                              disabled={!currentFilterValue}
                              className="ml-2"
                            >
                              Ajouter
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3 mb-3 relative">
                        <div className="flex-1 min-w-[180px]">
                          <ModernDatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            placeholder="Date de début"
                            showTimeSelect={true}
                            selectsStart={true}
                            startDate={startDate}
                            endDate={endDate}
                            className="w-full text-xs"
                          />
                        </div>

                        <div className="flex items-center px-2">
                          <span className="text-slate-500 dark:text-slate-400 font-medium text-xs">à</span>
                        </div>

                        <div className="flex-1 min-w-[180px]">
                          <ModernDatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            placeholder="Date de fin"
                            showTimeSelect={true}
                            selectsEnd={true}
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            className="w-full text-xs"
                          />
                        </div>

                        <Button
                          disabled={!startDate || !endDate}
                          onClick={addFilter}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-xs px-3 py-1.5"
                        >
                          Ajouter
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map((f, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-200 px-3 py-1.5 rounded-lg text-sm border border-indigo-200 dark:border-indigo-700 shadow-sm"
                      >
                        <span className="font-medium">
                          {filterOptions.find((o) => o.value === f.field)?.label}:
                        </span>
                        {f.value}
                        <button
                          onClick={() => removeFilter(i)}
                          className="ml-1 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5 transition-colors"
                        >
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
                    value={logs.per_page}
                    onChange={(e) => changePer(Number(e.target.value))}
                    className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-4 pr-10 py-2.5 text-sm text-slate-600 dark:text-slate-100 focus:outline-none"
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n} lignes par page
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                <Button
                  onClick={exportCsv}
                  className="bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-600 shadow-md flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Exporter
                </Button>
              </div>
            </div>
          </div>

          {/* -------------------------- TABLE -------------------------- */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 backdrop-blur-md rounded-xl shadow-xl overflow-hidden relative z-10">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Date & Heure
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Utilisateur
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Action & Objet
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Détails
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {logs.data.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                        <div>
                          <p className="font-medium">Aucune activité trouvée</p>
                          <p className="text-xs">
                            Aucun journal ne correspond aux critères de recherche
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {logs.data.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* DATE */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {new Date(log.created_at).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(log.created_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>

                    {/* USER */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.causer ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {log.causer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {log.causer.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {log.causer.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white text-xs">
                            <Database className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                              Système
                            </span>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Action automatique
                            </div>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-4">
                      <ActionDisplay log={log} />
                    </td>

                    {/* DETAILS */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.properties && Object.keys(log.properties).length > 0 ? (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => toggleRow(log.id)}
                            className="text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white flex items-center gap-1 text-sm font-medium transition-colors"
                          >
                            {expanded.includes(log.id) ? (
                              <>
                                <Minus className="w-4 h-4" />
                                Masquer les détails
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                Voir les détails
                              </>
                            )}
                          </button>
                          {expanded.includes(log.id) && (
                            <div className="mt-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                              <pre className="px-3 py-2 text-xs whitespace-pre-wrap text-slate-700 dark:text-slate-200 font-mono max-h-48 overflow-y-auto">
                                {JSON.stringify(log.properties, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                          Aucun détail disponible
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ----------------------- FOOTER ----------------------- */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-300">
                  Affichage de <span className="font-medium">{logs.from}</span> à{' '}
                  <span className="font-medium">{logs.to}</span> sur{' '}
                  <span className="font-medium">{logs.total}</span> résultats
                </span>
              </div>

              {logs.last_page > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={logs.current_page === 1}
                    onClick={() => changePage(1)}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={logs.current_page === 1}
                    onClick={() => changePage(logs.current_page - 1)}
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
                        variant={p === logs.current_page ? 'default' : 'outline'}
                        onClick={() => changePage(p as number)}
                      >
                        {p}
                      </Button>
                    ),
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={logs.current_page === logs.last_page}
                    onClick={() => changePage(logs.current_page + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={logs.current_page === logs.last_page}
                    onClick={() => changePage(logs.last_page)}
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
  );
}
