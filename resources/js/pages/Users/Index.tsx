import React, { useMemo, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps, User } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { route } from 'ziggy-js';
import ParticlesBackground from '@/components/ParticlesBackground';
import {
  Eye, Pencil, Trash2, RotateCcw, UserPlus, FileDown, ChevronDown, Power,MousePointerClick,
  Filter, X, SlidersHorizontal, Search, Users, Shield, Mail, UserCog,Circle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, User as UserIcon, MoreHorizontal
} from 'lucide-react';

type Props = PageProps<{
  users: User[];
  roles: string[];
  flash?: string;
  filters?: {
    search?: string;
    name?: string;
    email?: string;
    role?: string;
    status?: string;
    per_page?: number;
  };
}>;

type SortDirection = 'asc' | 'desc';

export default function UsersIndex({ users = [], roles, flash, filters }: Props) {
  const { delete: destroy, post } = useForm({});

  // Valeurs par défaut pour les filtres pour éviter l'erreur null
  const defaultFilters = filters || {};

  // États pour les filtres et pagination
  const [showFilters, setShowFilters] = useState(false);
  const [field, setField] = useState<'search' | 'name' | 'email' | 'role' | 'status'>('search');
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultFilters.per_page || 10);

  // États pour le tri
  const [sortField, setSortField] = useState<keyof User | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // États pour la sélection
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  /* -------------------------- FILTRES & TRI ------------------------------ */
  const hasFilter = useMemo(
    () => Boolean(defaultFilters.search || defaultFilters.name || defaultFilters.email || defaultFilters.role || defaultFilters.status),
    [defaultFilters]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Filtres depuis l'URL
      if (defaultFilters.search && !user.name.toLowerCase().includes(defaultFilters.search.toLowerCase()) &&
          !user.email.toLowerCase().includes(defaultFilters.search.toLowerCase())) {
        return false;
      }
      if (defaultFilters.name && !user.name.toLowerCase().includes(defaultFilters.name.toLowerCase())) {
        return false;
      }
      if (defaultFilters.email && !user.email.toLowerCase().includes(defaultFilters.email.toLowerCase())) {
        return false;
      }
      if (defaultFilters.role && !user.roles?.some(role => role.name.toLowerCase() === defaultFilters.role?.toLowerCase())) {
        return false;
      }
      if (defaultFilters.status) {
        const isActive = !user.deleted_at;
        if (defaultFilters.status.toLowerCase() === 'actif' && !isActive) return false;
        if (defaultFilters.status.toLowerCase() === 'désactivé' && isActive) return false;
      }

      return true;
    });
  }, [users, defaultFilters]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      if (sortField === 'status') {
        const aIsActive = !a.deleted_at;
        const bIsActive = !b.deleted_at;
        const compare = aIsActive === bIsActive ? 0 : aIsActive ? -1 : 1;
        return sortDirection === 'asc' ? compare : -compare;
      }

      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];

      if (aValue === undefined || bValue === undefined) return 0;

      const compare = typeof aValue === 'string'
        ? aValue.localeCompare(bValue as string)
        : aValue > bValue ? 1 : -1;

      return sortDirection === 'asc' ? compare : -compare;
    });
  }, [filteredUsers, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedUsers.length / perPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage;
    return sortedUsers.slice(startIndex, startIndex + perPage);
  }, [sortedUsers, currentPage, perPage]);

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

  /* ------------------------------ ACTIONS ------------------------------- */
  const applyFilters = () => {
    const payload: Record<string, any> = {
      ...defaultFilters,
      per_page: perPage
    };

    if (query.trim()) {
      payload[field] = query.trim();
    }

    router.get(route('users.index'), payload, {
      preserveScroll: true,
      preserveState: true,
      only: ['users', 'filters']
    });
  };

  const resetFilters = () => {
    setQuery('');
    router.get(route('users.index'), { per_page: perPage }, {
      preserveScroll: true,
      preserveState: true,
      only: ['users', 'filters']
    });
  };

   const changePer = (n: number) => {
    setPerPage(n);
    setCurrentPage(1);

    router.get(route('users.index'), { ...defaultFilters, per_page: n }, {
      preserveScroll: true,
      preserveState: true,
      only: ['users', 'filters']
    });
  };

  const changePage = (p: number) => {
    setCurrentPage(p);
  };

  const exportUsers = () => {
    window.open(route('users.export', defaultFilters), '_blank');
  };

  const changeSort = (field: keyof User | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  /* -------------------------- ACTIONS UTILISATEURS ---------------------- */
  const deleteUser = (id: number) => {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      destroy(route('users.destroy', { id }), { method: 'delete' });
    }
  };

  const restoreUser = (id: number) => {
    if (confirm('Voulez-vous restaurer cet utilisateur ?')) {
      post(route('users.restore', { id }), { preserveScroll: true });
    }
  };

  const deleteSelectedUsers = () => {
    if (selectedUserIds.length === 0) return;
    if (confirm(`Voulez-vous vraiment supprimer ${selectedUserIds.length} utilisateur(s) ?`)) {
      selectedUserIds.forEach((id) => {
        destroy(route('users.destroy', { id }), {
          method: 'delete',
          preserveScroll: true,
        });
      });
      setSelectedUserIds([]);
    }
  };

  const restoreSelectedUsers = () => {
    if (selectedUserIds.length === 0) return;
    if (confirm(`Voulez-vous vraiment restaurer ${selectedUserIds.length} utilisateur(s) ?`)) {
      selectedUserIds.forEach((id) => {
        post(route('users.restore', { id }), { preserveScroll: true });
      });
      setSelectedUserIds([]);
    }
  };

  const toggleSelectUser = (id: number) => {
    const user = users.find((u) => u.id === id);
    const isActive = !user?.deleted_at;

    if (isActive) {
      if (selectedUserIds.some((selectedId) =>
        users.find((u) => u.id === selectedId)?.deleted_at)) {
        alert('Vous ne pouvez pas sélectionner des utilisateurs actifs avec des désactivés');
        return;
      }
    } else {
      if (selectedUserIds.some((selectedId) =>
        !users.find((u) => u.id === selectedId)?.deleted_at)) {
        alert('Vous ne pouvez pas sélectionner des désactivés avec des actifs');
        return;
      }
    }

    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === paginatedUsers.length) {
      setSelectedUserIds([]);
    } else {
      const firstSelectedUser = paginatedUsers[0];
      const firstUserActive = !firstSelectedUser?.deleted_at;
      const newSelected = paginatedUsers
        .filter((user) => (!user.deleted_at) === firstUserActive)
        .map((user) => user.id);
      setSelectedUserIds(newSelected);
    }
  };

  const allSelected = selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0;
  const anySelectedInactive = selectedUserIds.some((id) => users.find((u) => u.id === id)?.deleted_at);
  const anySelectedActive = selectedUserIds.some((id) => !users.find((u) => u.id === id)?.deleted_at);

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Utilisateurs', href: '/users' }
      ]}
    >
      <Head title="Utilisateurs" />

      {/* BACKGROUND + PARTICLES */}
      <div className="relative">
        <ParticlesBackground />

        <div className="relative z-10 w-full py-6 px-4">
          {flash && (
            <div className="mb-4 p-3 rounded bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-100 dark:border-green-700">
              {flash}
            </div>
          )}

          {/* ------------------------ TITLE ------------------------ */}
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Gestion des utilisateurs
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Administration et gestion des comptes utilisateurs
              </p>
            </div>
          </div>

          {/* ------------------- FILTER / TOOLS ------------------- */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 backdrop-blur-md rounded-xl shadow-xl p-6 mb-6">
            <div className="flex flex-wrap justify-between gap-4">
              {/* LEFT BLOCK */}
              <div className="flex flex-col gap-4 w-full lg:w-auto">
                <div className="flex items-center gap-3">
                  <Button onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="w-4 h-4" />
                    {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
                  </Button>

                  {hasFilter && (
                    <Button variant="outline" onClick={resetFilters} className="gap-1.5">
                      <X className="w-4 h-4" /> Effacer
                    </Button>
                  )}

                  {selectedUserIds.length > 0 && (
                    <>
                      {anySelectedInactive && (
                        <Button variant="secondary" onClick={restoreSelectedUsers}>
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Restaurer sélection ({selectedUserIds.length})
                        </Button>
                      )}
                      {anySelectedActive && (
                        <Button variant="destructive" onClick={deleteSelectedUsers}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer sélection ({selectedUserIds.length})
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* FILTER PANEL */}
                {showFilters && (
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 w-full lg:max-w-xl">
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" /> Filtrer les utilisateurs
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="relative">
                        <select
                          value={field}
                          onChange={(e) => setField(e.target.value as any)}
                          className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-4 pr-10 py-2 text-sm text-slate-700 dark:text-slate-100"
                        >
                          <option value="search">Recherche globale</option>
                          <option value="name">Nom</option>
                          <option value="email">Email</option>
                          <option value="role">Rôle</option>
                          <option value="status">Statut</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>

                      <div className="sm:col-span-2 flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            placeholder={`Filtrer par ${field === 'status' ? 'statut (actif/désactivé)' : field}`}
                            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                          />
                        </div>
                        <Button disabled={!query.trim()} onClick={applyFilters}>
                          Appliquer
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT BLOCK */}
              <div className="flex items-center gap-3 ml-auto">
                <div className="relative min-w-[220px]">
                  <select
                    value={perPage}
                    onChange={(e) => changePer(Number(e.target.value))}
                    className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-4 pr-10 py-2.5 text-sm text-slate-600 dark:text-slate-100 focus:outline-none"
                  >
                    {[10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n} lignes par page
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                <Button
                  onClick={exportUsers}
                  className="bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-600 shadow-md flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Exporter
                </Button>

                <Link href="/users/create">
                  <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-600 shadow-md">
                    <UserPlus className="w-4 h-4 mr-2" /> Ajouter un utilisateur
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
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-red-600"
                    />
                    </th>
                  <th className="px-6 py-3 text-left">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => changeSort('name')}>
                      <Users className="w-4 h-4" />
                      Utilisateur
                      {sortField === 'name' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                    </div>
                  </th>
                 <th className="w-[200px] px-3 py-3 text-center">
  <div className="flex items-center justify-center gap-2">
    <UserCog className="w-4 h-4" />
    Rôle
  </div>
</th>

                   <th className="w-[120px] px-3 py-3 text-center">
  <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => changeSort('status')}>
    <Power className="w-4 h-4" />
    Statut
    {sortField === 'status' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
  </div>
</th>

    {/* Actions (fixe à 120px par exemple, aligné droite) */}
  <th className="w-[120px] px-3 py-3 text-center">
  <div className="flex items-center justify-center gap-2">
    <MoreHorizontal className="w-4 h-4" />
    Actions
  </div>
</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                        <div>
                          <p className="font-medium">Aucun utilisateur trouvé</p>
                          <p className="text-xs">Aucun utilisateur ne correspond aux critères de recherche</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`${user.deleted_at ? 'bg-red-50 dark:bg-red-900/10' : ''} hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}
                  >
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                        className="rounded border-gray-300 text-red-600"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
  <div className="flex justify-center flex-wrap gap-1">
    {user.roles && user.roles.length > 0 ? (
      user.roles.map((role, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
        >
          {role.name}
        </span>
      ))
    ) : (
      <span className="text-xs text-slate-400 dark:text-slate-500 italic">
        Aucun rôle
      </span>
    )}
  </div>
</td>


                    <td className="px-6 py-4 text-center">
                      {user.deleted_at ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                          Désactivé
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          Actif
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {user.deleted_at ? (
                          <button
                            onClick={() => restoreUser(user.id)}
                            className="text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                            title="Restaurer"
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>
                        ) : (
                          <>
                            <Link
                              href={route('users.show', user.id)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              title="Voir"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                            <Link
                              href={route('users.edit', user.id)}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                              title="Modifier"
                            >
                              <Pencil className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ----------------------- FOOTER ----------------------- */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-300">
                  Affichage de{' '}
                  <span className="font-medium">
                    {Math.min((currentPage - 1) * perPage + 1, sortedUsers.length)}
                  </span>{' '}
                  à{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * perPage, sortedUsers.length)}
                  </span>{' '}
                  sur <span className="font-medium">{sortedUsers.length}</span> résultats
                </span>
              </div>

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
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
