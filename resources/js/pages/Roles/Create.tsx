import React, { useMemo, useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
  Check, CheckSquare, Square, Layers,
  ChevronDown, ChevronUp, Expand, Minimize,
  Shield, ArrowLeft, Plus,
} from 'lucide-react';

import AppLayout           from '@/layouts/app-layout';
import ParticlesBackground from '@/components/ParticlesBackground';
import { Button }          from '@/components/ui/button';

interface Permission { id: number; name: string }
interface Props        { permissions: Permission[] }

export default function CreateRole({ permissions }: Props) {
  /* ─── Inertia form ─── */
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    permissions: [] as string[],
  });

  /* ─── Helpers ─── */
  const toggle = (perm: string) =>
    setData('permissions',
      data.permissions.includes(perm)
        ? data.permissions.filter(p => p !== perm)
        : [...data.permissions, perm]);

  const toggleAll = () =>
    setData('permissions',
      data.permissions.length === permissions.length
        ? []
        : permissions.map(p => p.name));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('roles.store'));
  };

  /* ─── Groupement domaine (singularisé + alias) ─── */
  const grouped = useMemo(() => {
    const alias = (d: string) => {
      const singular = d.endsWith('s') ? d.slice(0, -1) : d; // naïve singular
      if ([ 'login', 'audit' ].includes(singular)) return 'journal';
      return singular;
    };

    const map: Record<string, Permission[]> = {};
    permissions.forEach(p => {
      const raw = p.name.split(/[-_]/)[0] || 'divers';
      const domain = alias(raw);
      (map[domain] ||= []).push(p);
    });

    /* ordre : user, role, permission d'abord, puis alphabétique */
    const priority = [ 'user', 'role', 'permission' ];
    return Object.entries(map).sort(([a], [b]) => {
      const ia = priority.indexOf(a);
      const ib = priority.indexOf(b);
      if (ia !== -1 || ib !== -1) {
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      }
      return a.localeCompare(b);
    });
  }, [permissions]);

  /* ─── Ouverture / fermeture domaines ─── */
  const [openDomains, setOpenDomains] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const add: Record<string, boolean> = {};
    grouped.forEach(([d]) => {
      if (openDomains[d] === undefined) add[d] = true; // ouvert par défaut
    });
    if (Object.keys(add).length) setOpenDomains(prev => ({ ...prev, ...add }));
  }, [grouped]);

  const allOpen = Object.values(openDomains).every(Boolean);

  const setAllDomains = (value: boolean) => {
    const obj: Record<string, boolean> = {};
    grouped.forEach(([d]) => { obj[d] = value; });
    setOpenDomains(obj);
  };

  /* ───────────────────────────── */
  return (
    <>
      <Head title="Créer un rôle" />

      <div className="relative min-h-screen bg-gradient-to-br
                      from-white via-slate-100 to-slate-200
                      dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749]
                      transition-colors duration-500">
        <ParticlesBackground />

        <AppLayout breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Rôles',     href: '/roles'     },
          { title: 'Créer',     href: '/roles/create' },
        ]}>
          <div className="grid grid-cols-12 gap-6 p-6">

            {/* ────────── Formulaire ────────── */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-7">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                              dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8">

                <h1 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
                  Créer un nouveau rôle
                </h1>

                <form onSubmit={submit} className="space-y-6">

                  {/* Nom rôle */}
                  <FieldText
                    id="name"
                    label="Nom du rôle"
                    value={data.name}
                    onChange={v => setData('name', v)}
                    error={errors.name}
                  />

                  {/* Permissions */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Permissions <span className="text-red-500">*</span>
                      </label>

                      <div className="flex items-center gap-4">
                        {/* Toggle all permissions */}
                        <button type="button" onClick={toggleAll}
                                className="flex items-center text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition">
                          {data.permissions.length === permissions.length ? (
                            <><Square className="w-4 h-4 mr-2" />Tout désélectionner</>
                          ) : (
                            <><CheckSquare className="w-4 h-4 mr-2" />Sélectionner tout</>
                          )}
                        </button>

                        {/* Expand / collapse all */}
                        <button type="button"
                                onClick={() => setAllDomains(!allOpen)}
                                className="flex items-center text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition">
                          {allOpen ? (
                            <><Minimize className="w-4 h-4 mr-1" />Plier tout</>
                          ) : (
                            <><Expand className="w-4 h-4 mr-1" />Déplier tout</>
                          )}
                        </button>
                      </div>
                    </div>

                    {errors.permissions && (
                      <p className="text-sm text-red-500 mb-2">{errors.permissions}</p>
                    )}

                    <div className="space-y-4">
                      {grouped.map(([domain, perms]) => (
                        <DomainCard
                          key={domain}
                          domain={domain}
                          perms={perms}
                          open={openDomains[domain]}
                          toggleOpen={() => setOpenDomains(prev => ({ ...prev, [domain]: !prev[domain] }))}
                          selected={data.permissions}
                          togglePerm={toggle}
                          setDomainAll={(selectAll: boolean) => {
                            const names = perms.map(p => p.name);
                            setData('permissions', selectAll
                              ? [...data.permissions, ...names.filter(n => !data.permissions.includes(n))]
                              : data.permissions.filter(p => !names.includes(p))
                            );
                          }}
                        />
                      ))}
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="ghost" onClick={() => window.history.back()}
                            className="bg-muted hover:bg-muted/80 text-slate-700 dark:text-slate-300">
                      <ArrowLeft className="w-4 h-4 mr-2" />Annuler
                    </Button>

                    <Button type="submit" disabled={processing}
                            className="group relative flex items-center justify-center
                                       rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-6 py-3
                                       text-sm font-semibold text-white shadow-md transition-all
                                       hover:from-red-500 hover:to-red-600 focus:ring-2 focus:ring-red-500">
                      {processing
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        : <Plus className="w-4 h-4 mr-2" />}
                      {processing ? 'Création…' : 'Créer le rôle'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* ────────── Panneau aide ────────── */}
            <div className="col-span-12 lg:col-span-4 xl:col-span-5">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                              dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8">
                <h2 className="text-lg font-medium mb-4 text-slate-900 dark:text-white">
                  À propos des rôles
                </h2>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                  <li>Domaines « user, role, permission » toujours affichés en premier.</li>
                  <li>Les permissions « login_* » et « audit_* » sont fusionnées dans « journal ».</li>
                  <li>Utilise les boutons pour sélectionner ou plier en un clic.</li>
                </ul>
              </div>
            </div>

          </div>
        </AppLayout>
      </div>
    </>
  );
}

/* ─────── Champ texte ─────── */
function FieldText({ id, label, value, onChange, error }: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <label htmlFor={id}
             className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        className={`block w-full rounded-lg border py-3 px-4 bg-white dark:bg-slate-800
                    ${error ? 'border-red-500 text-red-500'
                            : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'}
                    focus:border-red-500 focus:ring-1 focus:ring-red-500`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

/* ─────── Carte Domaine ─────── */
function DomainCard({
  domain, perms, open, toggleOpen,
  selected, togglePerm, setDomainAll,
}: {
  domain: string;
  perms: Permission[];
  open: boolean | undefined;
  toggleOpen: () => void;
  selected: string[];
  togglePerm: (p: string) => void;
  setDomainAll: (selectAll: boolean) => void;
}) {
  const allSelected = perms.every(p => selected.includes(p.name));
  const someSelected = !allSelected && perms.some(p => selected.includes(p.name));

  return (
    <div className="border rounded-lg dark:border-slate-700">
      {/* Header */}
      <div onClick={toggleOpen}
           className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50
                      rounded-t-lg cursor-pointer select-none">
        <div className="flex items-center space-x-3">
          <Layers className="h-4 w-4 text-slate-400" />
          <span className="capitalize font-medium text-slate-800 dark:text-slate-100">
            {domain}
          </span>
          {someSelected && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
              partiel
            </span>
          )}
          {allSelected && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
              tout
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button type="button"
                  onClick={e => { e.stopPropagation(); setDomainAll(!allSelected); }}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            {allSelected ? 'Désélectionner' : 'Tout sélectionner'}
          </button>
          {open ? <ChevronUp className="h-4 w-4 text-slate-400" />
                 : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </div>

      {/* Permissions */}
      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 p-3">
          {perms.map(p => {
            const checked = selected.includes(p.name);
            return (
              <label key={p.id} className="inline-flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={checked}
                       onChange={() => togglePerm(p.name)}
                       className="form-checkbox h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                <span className="text-sm text-slate-800 dark:text-slate-200 truncate">
                  {p.name}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
