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
  Key,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Power,
  MousePointerClick,
  MoreHorizontal
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */
interface Permission {
  id: number;
  name: string;
  deleted_at: string | null;
}
type Props = {
  permissions: Permission[];
  isSuperAdmin: boolean;
  flash?: { success?: string; error?: string };
  filters?: {
    search?: string;
    name?: string;
    status?: string;
    per_page?: number;
  };
};
type SortDirection = 'asc' | 'desc';
type FilterType = { field: 'name' | 'status'; value: string };

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */
export default function PermissionsIndex({
  permissions,
  isSuperAdmin,
  flash,
  filters
}: Props) {
  // Valeurs par défaut pour les filtres
  const defaultFilters = filters || {};

  /* ------------------------------- STATES -------------------------------- */
  const [rowsPerPage, setRowsPerPage] = useState(defaultFilters.per_page || 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'name' | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentFilterField, setCurrentFilterField] = useState<FilterType['field']>('name');
  const [currentFilterValue, setCurrentFilterValue] = useState('');

  // États pour les flash messages
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
  const filteredPermissions = useMemo(() => {
    return permissions.filter((permission) =>
      activeFilters.every((f) => {
        if (f.field === 'name')
          return permission.name.toLowerCase().includes(f.value.toLowerCase());
        if (f.field === 'status')
          return f.value.toLowerCase() === 'active'
            ? !permission.deleted_at
            : !!permission.deleted_at;
        return true;
      }),
    );
  }, [permissions, activeFilters]);

  const sortedPermissions = useMemo(() => {
    return [...filteredPermissions].sort((a, b) => {
      if (sortField === 'status') {
        const cmp =
          !a.deleted_at === !b.deleted_at ? 0 : !a.deleted_at ? -1 : 1;
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      const cmp = a.name.localeCompare(b.name);
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [filteredPermissions, sortField, sortDirection]);

  const paginatedPermissions = useMemo(() => {
    if (rowsPerPage === -1) return sortedPermissions;
    const start = (currentPage - 1) * rowsPerPage;
    return sortedPermissions.slice(start, start + rowsPerPage);
  }, [sortedPermissions, currentPage, rowsPerPage]);

  const totalPages = useMemo(
    () => (rowsPerPage === -1 ? 1 : Math.ceil(filteredPermissions.length / rowsPerPage)),
    [filteredPermissions.length, rowsPerPage],
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

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette permission ?')) return;
    try {
      await router.delete(route('permissions.destroy', { id }), { preserveScroll: true });
      setSelectedPermissionIds((p) => p.filter((pid) => pid !== id));
    } catch {
      alert('Une erreur est survenue lors de la suppression.');
    }
  };

  const restorePermission = (id: number) => {
    if (!confirm('Voulez-vous restaurer cette permission ?')) return;
    router.post(route('permissions.restore', { id }), {}, { preserveScroll: true });
  };

  const deleteSelectedPermissions = () => {
    if (!selectedPermissionIds.length) return;
    if (!confirm(`Supprimer ${selectedPermissionIds.length} permission(s) ?`)) return;
    Promise.all(
      selectedPermissionIds.map((id) =>
        router.delete(route('permissions.destroy', { id }), { preserveScroll: true }),
      ),
    )
      .then(() => setSelectedPermissionIds([]))
      .catch(() =>
        alert('Une erreur est survenue lors de la suppression de certaines permissions.'),
      );
  };

  const restoreSelectedPermissions = () => {
    if (!selectedPermissionIds.length) return;
    if (!confirm(`Restaurer ${selectedPermissionIds.length} permission(s) ?`)) return;
    Promise.all(
      selectedPermissionIds.map((id) =>
        router.post(route('permissions.restore', { id }), {}, { preserveScroll: true }),
      ),
    )
      .then(() => setSelectedPermissionIds([]))
      .catch(() =>
        alert('Une erreur est survenue lors de la restauration de certaines permissions.'),
      );
  };

  /* ------------------------- SELECTION HELPERS -------------------------- */
  const toggleSelectPermission = (id: number) =>
    setSelectedPermissionIds((p) => (p.includes(id) ? p.filter((r) => r !== id) : [...p, id]));

  const toggleSelectAll = () => {
    if (!paginatedPermissions.length) return;
    setSelectedPermissionIds((p) =>
      p.length === paginatedPermissions.length ? [] : paginatedPermissions.map((r) => r.id),
    );
  };

  const allSelected =
    selectedPermissionIds.length && paginatedPermissions.every((r) => selectedPermissionIds.includes(r.id));

  const anySelectedInactive = selectedPermissionIds.some(
    (id) => permissions.find((r) => r.id === id)?.deleted_at,
  );
  const anySelectedActive = selectedPermissionIds.some(
    (id) => !permissions.find((r) => r.id === id)?.deleted_at,
  );

  /* ---------------------------------------------------------------------- */
  /*                                 RENDER                                 */
  /* ---------------------------------------------------------------------- */
  return (
    <>
      <Head title="Permissions" />
      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Permissions', href: '/permissions' },
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
                  Gestion des permissions
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Administration et gestion des permissions système
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

                    {selectedPermissionIds.length > 0 && (
                      <>
                        {anySelectedInactive && (
                          <Button variant="secondary" onClick={restoreSelectedPermissions}>
                            <RotateCcw className="w-4 h-4 mr-1" /> Restaurer (
                            {selectedPermissionIds.length})
                          </Button>
                        )}
                        {anySelectedActive && (
                          <Button variant="destructive" onClick={deleteSelectedPermissions}>
                            <Trash2 className="w-4 h-4 mr-1" /> Supprimer (
                            {selectedPermissionIds.length})
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {/* FILTER PANEL */}
                  {showFilterPanel && (
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 w-full lg:max-w-xl">
                      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4" /> Filtrer les permissions
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
                              <option value="active">Active</option>
                              <option value="désactivée">Désactivée</option>
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

                  <Link href="/permissions/create">
                    <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-600 shadow-md">
                      <Plus className="w-4 h-4 mr-1" /> Ajouter une permission
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
                        <Key className="w-4 h-4" />
                        Nom {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
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
                        <MoreHorizontal className="w-4 h-4" />
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {paginatedPermissions.length ? (
                    paginatedPermissions.map((permission) => (
                      <tr
                        key={permission.id}
                        className={`${
                          permission.deleted_at ? 'bg-red-50 dark:bg-red-900/10' : ''
                        } hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}
                      >
                        {/* checkbox */}
                        <td className="text-center px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedPermissionIds.includes(permission.id)}
                            onChange={() => toggleSelectPermission(permission.id)}
                            className="rounded border-slate-300 text-red-600"
                          />
                        </td>

                        {/* name */}
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          {permission.name}
                        </td>

                        {/* status */}
                        <td className="px-6 py-4 text-center min-w-[100px]">
                          {permission.deleted_at ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Désactivée
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Active
                            </span>
                          )}
                        </td>

                        {/* actions */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            {permission.deleted_at ? (
                              isSuperAdmin && (
                                <button
                                  onClick={() => restorePermission(permission.id)}
                                  className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                                  aria-label="Restaurer"
                                >
                                  <RotateCcw className="w-5 h-5" />
                                </button>
                              )
                            ) : (
                              <>
                                <Link
                                  href={route('permissions.show', permission.id)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-800/30"
                                  aria-label="Voir"
                                >
                                  <Eye className="w-5 h-5" />
                                </Link>
                                <Link
                                  href={route('permissions.edit', permission.id)}
                                  className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 p-1 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-800/30"
                                  aria-label="Éditer"
                                >
                                  <Pencil className="w-5 h-5" />
                                </Link>
                                <button
                                  onClick={() => handleDelete(permission.id)}
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
                        colSpan={4}
                        className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <Key className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                          <div>
                            <p className="font-medium">Aucune permission trouvée</p>
                            <p className="text-xs">Aucune permission ne correspond aux critères de recherche</p>
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
                      ? `Affichage de toutes les ${filteredPermissions.length} permissions`
                      : `Affichage de ${Math.min(
                          (currentPage - 1) * rowsPerPage + 1,
                          filteredPermissions.length,
                        )} à ${Math.min(
                          currentPage * rowsPerPage,
                          filteredPermissions.length,
                        )} sur ${filteredPermissions.length} permissions`}
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
