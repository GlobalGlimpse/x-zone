import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  ArrowLeft, Pencil, Layers,
} from 'lucide-react';

import AppLayout           from '@/layouts/app-layout';
import ParticlesBackground from '@/components/ParticlesBackground';
import { Button }          from '@/components/ui/button';

interface Permission { id:number; name:string }
interface Role        { id:number; name:string; permissions:Permission[] }
interface Props       { role:Role }

export default function ShowRole({ role }:Props){
  /* ---------- Groupement domaines ---------- */
  const grouped = useMemo(()=>{
    const alias=(d:string)=>{
      const s = d.endsWith('s') ? d.slice(0,-1) : d;
      return ['login','audit'].includes(s) ? 'journal' : s;
    };
    const map:Record<string,Permission[]>={};
    role.permissions.forEach(p=>{
      const raw = p.name.split(/[-_]/)[0] || 'divers';
      const dom = alias(raw);
      (map[dom] ||= []).push(p);
    });
    const priority=['user','role','permission'];
    return Object.entries(map).sort(([a],[b])=>{
      const ia=priority.indexOf(a), ib=priority.indexOf(b);
      if(ia!==-1 || ib!==-1) return (ia===-1?999:ia)-(ib===-1?999:ib);
      return a.localeCompare(b);
    });
  },[role.permissions]);

  /* ----------------------------------------- */
  return(
    <>
      <Head title={`Rôle – ${role.name}`}/>

      <div className="relative min-h-screen bg-gradient-to-br
                      from-white via-slate-100 to-slate-200
                      dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749]
                      transition-colors duration-500">
        <ParticlesBackground/>

        <AppLayout breadcrumbs={[
          {title:'Dashboard',href:'/dashboard'},
          {title:'Rôles',    href:'/roles'},
          {title:role.name,  href:route('roles.show',role.id)},
        ]}>

          <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-0">
                Détails du rôle
              </h1>
              <div className="flex space-x-3">
                <Link href={route('roles.index')}>
                  <Button variant="ghost"
                          className="bg-muted hover:bg-muted/80 text-slate-700 dark:text-slate-300">
                    <ArrowLeft className="w-4 h-4 mr-2"/>Retour
                  </Button>
                </Link>
                {role.name!=='SuperAdmin' && (
                  <Link href={route('roles.edit',role.id)}>
                    <Button className="group relative flex items-center justify-center
                                       rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-5 py-3
                                       text-sm font-semibold text-white shadow-md transition-all
                                       hover:from-red-500 hover:to-red-600 focus:ring-2 focus:ring-red-500">
                      <Pencil className="w-4 h-4 mr-2"/>Modifier
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Infos */}
              <div className="lg:col-span-1">
                <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                                dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
                  <h2 className="text-lg font-medium mb-4 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                    Informations
                  </h2>

                  <Info label="Nom du rôle" value={role.name}/>
                  <Info label="Type" value={
                    role.name==='SuperAdmin'
                      ? <Badge color="amber">Rôle système</Badge>
                      : <Badge>Rôle personnalisé</Badge>
                  }/>
                  <Info label="Nombre de permissions" value={role.permissions.length}/>

                  {role.name==='SuperAdmin' && (
                    <div className="mt-6 p-4 rounded-lg border
                                    bg-amber-50 border-amber-100 dark:bg-amber-900/30 dark:border-amber-600/40">
                      <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                        Rôle système protégé
                      </h3>
                      <p className="text-sm text-amber-700 dark:text-amber-200">
                        Ce rôle ne peut être ni supprimé ni renommé.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Permissions */}
              <div className="lg:col-span-2">
                <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                                dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
                  <h2 className="text-lg font-medium mb-4 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                    Permissions accordées
                  </h2>

                  {role.permissions.length===0 ? (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                      Aucune permission n’est attribuée à ce rôle.
                    </p>
                  ):(
                    <div className="space-y-6">
                      {grouped.map(([domain,perms])=>(
                        <div key={domain}>
                          <div className="flex items-center space-x-2 mb-3">
                            <Layers className="h-4 w-4 text-slate-400"/>
                            <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">
                              {domain}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              ({perms.length})
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {perms.map(p=>(
                              <div key={p.id}
                                   className="flex items-center p-3 rounded-md border
                                              bg-blue-50 border-blue-100 dark:bg-blue-900/30 dark:border-blue-600/40">
                                <div className="w-5 h-5 rounded bg-blue-600 border-blue-600
                                                flex items-center justify-center mr-3">
                                  <CheckIcon/>
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                                  {p.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {role.name==='SuperAdmin' && (
                    <div className="mt-6 p-4 rounded-md border
                                    bg-blue-50 border-blue-100 dark:bg-blue-900/30 dark:border-blue-600/40">
                      <p className="text-sm text-blue-700 dark:text-blue-200">
                        Le rôle SuperAdmin dispose de tous les accès, indépendamment
                        des permissions listées ci-dessus.
                      </p>
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

/* ---------- Sous-composants ---------- */
function Info({label,value}:{
  label:string; value:React.ReactNode|string|number;
}){
  return(
    <div className="mb-4">
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</h3>
      <p className="mt-1 text-lg font-medium text-slate-800 dark:text-white">{value}</p>
    </div>
  );
}

function Badge({children,color='gray'}:{
  children:React.ReactNode; color?:'gray'|'amber';
}){
  const bg = color==='amber'
    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    : 'bg-slate-100 text-slate-800 dark:bg-slate-700/40 dark:text-slate-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg}`}>
      {children}
    </span>
  );
}

function CheckIcon(){
  return(
    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
