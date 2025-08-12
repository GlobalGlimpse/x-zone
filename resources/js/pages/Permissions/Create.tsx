import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Shield, ArrowLeft, Plus } from 'lucide-react';

import AppLayout           from '@/layouts/app-layout';
import ParticlesBackground from '@/components/ParticlesBackground';
import { Button }          from '@/components/ui/button';

export default function CreatePermission() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('permissions.store'));
  };

  return (
    <>
      <Head title="Créer une permission" />

      <div className="relative min-h-screen bg-gradient-to-br
                      from-white via-slate-100 to-slate-200
                      dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749]
                      transition-colors duration-500">
        <ParticlesBackground />

        <AppLayout breadcrumbs={[
          { title: 'Dashboard',     href: '/dashboard' },
          { title: 'Permissions',   href: '/permissions' },
          { title: 'Créer',         href: '/permissions/create' },
        ]}>

          <div className="grid grid-cols-12 gap-6 p-6">

            {/* ─────── Formulaire ─────── */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-6">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                              dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8">
                <h1 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
                  Créer une nouvelle permission
                </h1>

                <form onSubmit={submit} className="space-y-6">

                  {/* Nom de la permission */}
                  <FieldText
                    id="name"
                    label="Nom de la permission"
                    value={data.name}
                    onChange={v => setData('name', v)}
                    error={errors.name}
                    placeholder="Ex : create_users, edit_products, view_reports"
                  />

                  {/* Actions */}
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => window.history.back()}
                      className="bg-muted hover:bg-muted/80 text-slate-700 dark:text-slate-300"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Annuler
                    </Button>

                    <Button
                      type="submit"
                      disabled={processing}
                      className="group relative flex items-center justify-center
                                 rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-6 py-3
                                 text-sm font-semibold text-white shadow-md transition-all
                                 hover:from-red-500 hover:to-red-600 focus:ring-2 focus:ring-red-500"
                    >
                      {processing
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        : <Plus className="w-4 h-4 mr-2" />}
                      {processing ? 'Création…' : 'Créer la permission'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* ─────── Panneau bonnes pratiques ─────── */}
            <div className="col-span-12 lg:col-span-5 xl:col-span-6">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                              dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8">
                <h2 className="text-lg font-medium mb-4 text-slate-900 dark:text-white">
                  Bonnes pratiques
                </h2>

                <p className="text-slate-600 dark:text-slate-300">
                  Les permissions définissent des actions précises qu’un utilisateur peut réaliser.
                  Utilise un nommage cohérent :
                </p>

                <ul className="mt-4 space-y-1 list-disc list-inside text-slate-600 dark:text-slate-300 text-sm">
                  {['create', 'read', 'update', 'delete'].map(action => (
                    <li key={action}>
                      <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sm">
                        {action}_[ressource]
                      </code>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 p-4 rounded-md border
                                bg-blue-50 border-blue-100 dark:bg-blue-900/30 dark:border-blue-600/40">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Conseil
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Préfère des permissions granulaires que tu pourras combiner,
                    plutôt qu’une seule permission trop large à découper plus tard.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </AppLayout>
      </div>
    </>
  );
}

/* ─────── Champ texte réutilisable ─────── */
function FieldText({
  id, label, value, onChange, error, placeholder,
}:{
  id:string; label:string; value:string;
  onChange:(v:string)=>void; error?:string; placeholder?:string;
}){
  return (
    <div>
      <label htmlFor={id}
             className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"/>
        <input
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={e=>onChange(e.target.value)}
          required
          className={`block w-full rounded-lg border py-3 pl-10 pr-3 bg-white dark:bg-slate-800
                      ${error
                        ? 'border-red-500 text-red-500'
                        : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'}
                      focus:border-red-500 focus:ring-1 focus:ring-red-500`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
