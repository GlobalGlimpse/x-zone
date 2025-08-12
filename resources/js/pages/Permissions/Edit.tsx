import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Shield, ArrowLeft, Save } from 'lucide-react';

import AppLayout           from '@/layouts/app-layout';
import ParticlesBackground from '@/components/ParticlesBackground';
import { Button }          from '@/components/ui/button';

interface Permission { id:number; name:string }
interface Props       { permission:Permission }

export default function EditPermission({ permission }:Props){
  const { data, setData, patch, processing, errors } = useForm({
    name: permission.name,
  });

  const submit = (e:React.FormEvent)=>{
    e.preventDefault();
    patch(route('permissions.update', permission.id));
  };

  return (
    <>
      <Head title={`Modifier la permission – ${permission.name}`}/>

      <div className="relative min-h-screen bg-gradient-to-br
                      from-white via-slate-100 to-slate-200
                      dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749]
                      transition-colors duration-500">
        <ParticlesBackground/>

        <AppLayout breadcrumbs={[
          { title:'Dashboard',     href:'/dashboard' },
          { title:'Permissions',   href:'/permissions' },
          { title:`Modifier – ${permission.name}`, href:route('permissions.edit', permission.id) },
        ]}>

          <div className="grid grid-cols-12 gap-6 p-6">

            {/* ─────── Formulaire ─────── */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-6">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                              dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8">

                <h1 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
                  Modifier la permission
                </h1>

                <form onSubmit={submit} className="space-y-6">

                  {/* Nom */}
                  <FieldText
                    id="name"
                    label="Nom de la permission"
                    value={data.name}
                    onChange={v=>setData('name', v)}
                    error={errors.name}
                  />

                  {/* Actions */}
                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="ghost"
                            onClick={()=>window.history.back()}
                            className="bg-muted hover:bg-muted/80 text-slate-700 dark:text-slate-300">
                      <ArrowLeft className="w-4 h-4 mr-2"/>
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
                                            ? (<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />)
                                            : (<Save className="w-4 h-4 mr-2" />)}
                                          {processing ? 'Mise à jour…' : 'Mettre à jour'}
                                        </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* ─────── Panneau impacts ─────── */}
            <div className="col-span-12 lg:col-span-5 xl:col-span-6">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                              dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8">

                <h2 className="text-lg font-medium mb-4 text-slate-900 dark:text-white">
                  Impacts de la modification
                </h2>

                <p className="text-slate-600 dark:text-slate-300">
                  Changer le nom d’une permission impacte les rôles et le code qui l’utilisent.
                </p>

                <div className="mt-4 p-4 rounded-md border
                                bg-amber-50 border-amber-100 dark:bg-amber-900/30 dark:border-amber-600/40">
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                    Attention
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-200">
                    Mets aussi à jour les vérifications (policies, middleware…) si tu renomme
                    cette permission.
                  </p>
                </div>

                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-6">
                  Points à vérifier après modification
                </h3>
                <ul className="mt-2 space-y-1 list-disc list-inside text-slate-600 dark:text-slate-300 text-sm">
                  <li>Les rôles utilisant cette permission fonctionnent toujours.</li>
                  <li>Les contrôles d’accès liés à cette permission sont à jour.</li>
                  <li>Informe l’équipe dev si nécessaire.</li>
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
function FieldText({
  id, label, value, onChange, error,
}:{
  id:string; label:string; value:string;
  onChange:(v:string)=>void; error?:string;
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
