import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
  User, Mail, Shield,
  Eye, EyeOff, ChevronDown, UserCog,
  ArrowLeft, Save,
} from 'lucide-react';

import AppLayout           from '@/layouts/app-layout';
import ParticlesBackground from '@/components/ParticlesBackground';
import { Button }          from '@/components/ui/button';

interface Role  { id: number; name: string }
interface Props {
  user:      { id:number; name:string; email:string };
  roles:     Role[];
  userRoles: string[];          // noms des rôles assignés
}

export default function EditUser({ user, roles, userRoles }: Props) {
  /* ─── Inertia form state ─── */
  const { data, setData, patch, processing, errors, reset } = useForm({
    name:  user.name,
    email: user.email,
    password: '',
    password_confirmation: '',
    roles: userRoles,
  });

  /* ─── Local UI state ─── */
  const [showPwd,     setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ─── Submit ─── */
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(route('users.update', user.id), {
      onSuccess: () => reset('password', 'password_confirmation'),
    });
  };

  /* ───────────────────────────────────── */
  return (
    <>
      <Head title={`Modifier ${user.name}`} />

      <div className="relative min-h-screen bg-gradient-to-br
                      from-white via-slate-100 to-slate-200
                      dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749]
                      transition-colors duration-500">
        <ParticlesBackground />

        <AppLayout breadcrumbs={[
          { title: 'Dashboard',    href: '/dashboard' },
          { title: 'Utilisateurs', href: '/users'    },
          { title: `Modifier ${user.name}`, href: `/users/${user.id}/edit` },
        ]}>

          <div className="grid grid-cols-12 gap-6 p-6">

            {/* ────────── Formulaire ────────── */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-7">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                              dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8">
                <h1 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
                  Modifier l’utilisateur
                </h1>

                <form onSubmit={submit} className="space-y-6">
                  {/* Nom */}
                  <Field id="name" label="Nom complet" Icon={User}
                         value={data.name} onChange={v => setData('name', v)}
                         error={errors.name} required />

                  {/* Email */}
                  <Field id="email" label="Adresse e-mail" Icon={Mail} type="email"
                         value={data.email} onChange={v => setData('email', v)}
                         error={errors.email} required autoComplete="username" />

                  {/* Rôles (multi-select) */}
                    <div>
                    <label htmlFor="roles" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Rôles <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {roles.map((role) => {
                        const checked = data.roles.includes(role.name);
                        return (
                            <label key={role.id} className={`flex items-center space-x-3 rounded-lg border p-3 cursor-pointer
                                ${checked
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'}
                                transition`}>
                            <input
                                type="checkbox"
                                value={role.name}
                                checked={checked}
                                onChange={e => {
                                const selected = e.target.checked
                                    ? [...data.roles, role.name]
                                    : data.roles.filter(r => r !== role.name);
                                setData('roles', selected);
                                }}
                                className="form-checkbox h-4 w-4 text-red-600 border-gray-300 rounded"
                            />
                            <span className="text-sm text-slate-800 dark:text-slate-200">{role.name}</span>
                            </label>
                        );
                        })}
                    </div>
                    {errors.roles && <p className="mt-2 text-sm text-red-500">{errors.roles}</p>}
                    </div>


                  {/* Mot de passe (optionnel) */}
                  <PasswordField id="password" label="Nouveau mot de passe" Icon={Shield}
                                 show={showPwd} toggleShow={() => setShowPwd(!showPwd)}
                                 value={data.password} onChange={v => setData('password', v)}
                                 error={errors.password} required={false} />

                  {/* Confirmation */}
                  <PasswordField id="password_confirmation" label="Confirmer le mot de passe" Icon={Shield}
                                 show={showConfirm} toggleShow={() => setShowConfirm(!showConfirm)}
                                 value={data.password_confirmation}
                                 onChange={v => setData('password_confirmation', v)}
                                 error={errors.password_confirmation} required={false} />

                  {/* Actions */}
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => window.history.back()}
                      className="bg-muted hover:bg-muted/80 text-slate-700 dark:text-slate-300"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Annuler
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

            {/* ────────── Panneau aide ────────── */}
            <div className="col-span-12 lg:col-span-4 xl:col-span-5">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                              dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8">
                <h2 className="text-lg font-medium mb-4 text-slate-900 dark:text-white">
                  Conseils de sécurité
                </h2>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                  <li>Ne remplis le mot de passe que si tu veux le changer.</li>
                  <li>Mot de passe recommandé : 10 + caractères, majuscule, minuscule, chiffre.</li>
                  <li>Les rôles contrôlent les autorisations de l’utilisateur.</li>
                </ul>
              </div>
            </div>

          </div>
        </AppLayout>
      </div>
    </>
  );
}

/* ─────── Composants champ réutilisables ─────── */
interface FieldProps {
  id:string; label:string; Icon:any;
  type?:React.HTMLInputTypeAttribute; required?:boolean;
  value:string; onChange:(v:string)=>void; autoComplete?:string;
  error?:string|false;
}
function Field({
  id,label,Icon,type='text',required=true,
  value,onChange,autoComplete,error,
}:FieldProps){
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          value={value}
          autoComplete={autoComplete}
          onChange={e=>onChange(e.target.value)}
          className={`block w-full rounded-lg border py-3 pl-10 pr-3 bg-white dark:bg-slate-800
                      ${error ? 'border-red-500 text-red-500'
                              : 'border-slate-300 text-slate-900 dark:text-white dark:border-slate-700'}
                      focus:border-red-500 focus:ring-1 focus:ring-red-500`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface PasswordFieldProps extends FieldProps {
  show:boolean; toggleShow:()=>void; required?:boolean;
}
function PasswordField({
  id,label,Icon,show,toggleShow,required=false,
  value,onChange,error,
}:PasswordFieldProps){
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          required={required}
          value={value}
          autoComplete="new-password"
          onChange={e=>onChange(e.target.value)}
          className={`block w-full rounded-lg border py-3 pl-10 pr-10 bg-white dark:bg-slate-800
                      ${error ? 'border-red-500 text-red-500'
                              : 'border-slate-300 text-slate-900 dark:text-white dark:border-slate-700'}
                      focus:border-red-500 focus:ring-1 focus:ring-red-500`}
        />
        <button type="button" onClick={toggleShow}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black dark:hover:text-white">
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
