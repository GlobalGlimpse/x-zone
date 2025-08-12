import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
  ArrowLeft, Pencil, Users,
} from 'lucide-react';

import AppLayout           from '@/layouts/app-layout';
import ParticlesBackground from '@/components/ParticlesBackground';
import { Button }          from '@/components/ui/button';

interface Role        { id:number; name:string }
interface Permission  { id:number; name:string; roles:Role[] }
interface Props       { permission:Permission }

export default function ShowPermission({ permission }:Props){
  return (
    <>
      <Head title={`Permission – ${permission.name}`}/>

      <div className="relative min-h-screen bg-gradient-to-br
                      from-white via-slate-100 to-slate-200
                      dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749]
                      transition-colors duration-500">
        <ParticlesBackground/>

        <AppLayout breadcrumbs={[
          { title:'Dashboard',     href:'/dashboard' },
          { title:'Permissions',   href:'/permissions' },
          { title:permission.name, href:route('permissions.show', permission.id) },
        ]}>

          <div className="p-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-0">
                Détails de la permission
              </h1>
              <div className="flex space-x-3">
                <Link href={route('permissions.index')}>
                  <Button variant="ghost"
                          className="bg-muted hover:bg-muted/80 text-slate-700 dark:text-slate-300">
                    <ArrowLeft className="w-4 h-4 mr-2"/>Retour
                  </Button>
                </Link>

                <Link href={route('permissions.edit', permission.id)}>
                  <Button className="group relative flex items-center justify-center
                                     rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-5 py-3
                                     text-sm font-semibold text-white shadow-md transition-all
                                     hover:from-red-500 hover:to-red-600 focus:ring-2 focus:ring-red-500">
                    <Pencil className="w-4 h-4 mr-2"/>Modifier
                  </Button>
                </Link>
              </div>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Infos permission */}
              <div className="lg:col-span-1">
                <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                                dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
                  <h2 className="text-lg font-medium mb-4 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                    Informations
                  </h2>

                  <Info label="Nom" value={permission.name}/>
                  <Info label="Nombre de rôles utilisant cette permission" value={permission.roles.length}/>
                </div>
              </div>

              {/* Rôles utilisant cette permission */}
              <div className="lg:col-span-2">
                <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                                dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
                  <h2 className="text-lg font-medium mb-4 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                    Rôles concernés
                  </h2>

                  {permission.roles.length===0 ? (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                      Aucun rôle n’utilise actuellement cette permission.
                    </p>
                  ):(
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {permission.roles.map(r=>(
                        <div key={r.id}
                             className="flex items-center p-3 rounded-md border
                                        bg-blue-50 border-blue-100 dark:bg-blue-900/30 dark:border-blue-600/40">
                          <div className="w-5 h-5 rounded bg-blue-600 border-blue-600
                                          flex items-center justify-center mr-3">
                            <Users className="w-3.5 h-3.5 text-white"/>
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                            {r.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </AppLayout>
      </div>
    </>
  );
}

/* ---------- Sous-composant simple ---------- */
function Info({label,value}:{
  label:string; value:React.ReactNode|string|number;
}){
  return(
    <div className="mb-4">
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</h3>
      <p  className="mt-1 text-lg font-medium text-slate-800 dark:text-white">{value}</p>
    </div>
  );
}
