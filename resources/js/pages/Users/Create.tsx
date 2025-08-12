import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
  User, Mail, Shield,
  Eye, EyeOff, ChevronDown,
  UserPlus, ArrowLeft, UserCog
} from 'lucide-react';

import AppLayout           from '@/layouts/app-layout';
import ParticlesBackground from '@/components/ParticlesBackground';
import { Button }          from '@/components/ui/button';

interface Role  { id: number; name: string }
interface Props { roles: Role[] }

export default function CreateUser({ roles }: Props) {
  /* ─── État Inertia ─── */
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '', email: '', role: '', password: '', password_confirmation: '',
  });

  /* ─── État local ─── */
  const [showPwd,     setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdErr,      setPwdErr]      = useState('');

  /* ─── Helpers ─── */
  const pwdOK = (p: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/.test(p);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pwdOK(data.password))
      return setPwdErr('10 car. min. + maj + min + chiffre');
    if (data.password !== data.password_confirmation)
      return setPwdErr('Les mots de passe ne correspondent pas');

    setPwdErr('');
    /* 🔑 on transmet les données AVANT les options */
    post(route('users.store'), data, {
      onSuccess: () => reset(),
    });
  };

  /* ─────────────────────────────────────────── */
  return (
    <>
      <Head title="Créer un utilisateur" />

      <div className="relative min-h-screen bg-gradient-to-br
                      from-white via-slate-100 to-slate-200
                      dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749]
                      transition-colors duration-500">
        <ParticlesBackground />

        <AppLayout breadcrumbs={[
          { title: 'Dashboard',    href: '/dashboard' },
          { title: 'Utilisateurs', href: '/users' },
          { title: 'Créer',        href: '/users/create' },
        ]}>

          <div className="grid grid-cols-12 gap-6 p-6">

            {/* ────────── Formulaire ────────── */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-7">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                              dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8">
                <h1 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
                  Nouvel utilisateur
                </h1>

                <form onSubmit={submit} className="space-y-6">
                  {/* Nom */}
                  <Field id="name" label="Nom complet" Icon={User}
                         value={data.name} onChange={v => setData('name', v)}
                         error={errors.name} required />

                  {/* Email */}
                  <Field id="email" label="Adresse e-mail" Icon={Mail} type="email"
                         value={data.email} onChange={v => setData('email', v)}
                         error={errors.email} required autoComplete="new-email" />

                 <div>
  <label
    htmlFor="role"
    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
  >
    Rôle utilisateur <span className="text-red-500">*</span>
  </label>

  {/* Le conteneur garde la position relative pour les icônes */}
  <div className="relative">
    {/* Icône UserCog placée à gauche */}
    <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />

    <select
      id="role"
      name="role"
      required
      value={data.role}
      onChange={e => setData('role', e.target.value)}
      /* Ajout de pl-10 pour laisser la place à l’icône à gauche */
      className={`appearance-none block w-full rounded-lg border py-3 pl-10 pr-10 bg-white dark:bg-slate-800
                  ${errors.role
                    ? 'border-red-500 text-red-500'
                    : 'border-slate-300 text-slate-900 dark:text-white dark:border-slate-700'}
                  focus:border-red-500 focus:ring-1 focus:ring-red-500`}
    >
      <option value="" disabled>Choisissez un rôle</option>
      {roles.map(r => (
        <option key={r.id} value={r.name}>{r.name}</option>
      ))}
    </select>

    {/* Icône ChevronDown déjà en place */}
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
  </div>

  {errors.role && (
    <p className="mt-1 text-sm text-red-500">{errors.role}</p>
  )}
</div>

                  {/* Mot de passe */}
                  <PasswordField id="password" label="Mot de passe" Icon={Shield}
                                 show={showPwd} toggleShow={() => setShowPwd(!showPwd)}
                                 value={data.password} onChange={v => setData('password', v)}
                                 error={pwdErr || errors.password} />

                  {/* Confirmation */}
                  <PasswordField id="password_confirmation" label="Confirmer le mot de passe" Icon={Shield}
                                 show={showConfirm} toggleShow={() => setShowConfirm(!showConfirm)}
                                 value={data.password_confirmation}
                                 onChange={v => setData('password_confirmation', v)}
                                 error={errors.password_confirmation} />

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
                        : (<UserPlus className="w-4 h-4 mr-2" />)}
                      {processing ? 'Création…' : "Créer l'utilisateur"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* ────────── Aide ────────── */}
            <div className="col-span-12 lg:col-span-4 xl:col-span-5">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                              dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8">
                <h2 className="text-lg font-medium mb-4 text-slate-900 dark:text-white">
                  Bonnes pratiques de sécurité
                </h2>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                  <li>Mot de passe : 10+ caractères, majuscule, minuscule et chiffre</li>
                  <li>L’e-mail doit être unique</li>
                  <li>Le rôle détermine les permissions attribuées</li>
                </ul>
              </div>
            </div>

          </div>
        </AppLayout>
      </div>
    </>
  );
}

/* ────────── Composants réutilisables ────────── */
interface FieldProps {
  id: string; label: string; Icon: any;
  type?: React.HTMLInputTypeAttribute; required?: boolean;
  value: string; onChange: (v: string) => void; autoComplete?: string;
  error?: string | false;
}
function Field({
  id, label, Icon, type = 'text', required = true,
  value, onChange, autoComplete, error,
}: FieldProps) {
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
          onChange={e => onChange(e.target.value)}
          className={`block w-full rounded-lg border py-3 pl-10 pr-3 bg-white dark:bg-slate-800
                      ${error
                        ? 'border-red-500 text-red-500'
                        : 'border-slate-300 text-slate-900 dark:text-white dark:border-slate-700'}
                      focus:border-red-500 focus:ring-1 focus:ring-red-500`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface PasswordFieldProps {
  id: string; label: string; Icon: any; show: boolean; toggleShow: () => void;
  value: string; onChange: (v: string) => void; error?: string | false;
}
function PasswordField({
  id, label, Icon, show, toggleShow, value, onChange, error,
}: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          required
          value={value}
          autoComplete="new-password"
          onChange={e => onChange(e.target.value)}
          className={`block w-full rounded-lg border py-3 pl-10 pr-10 bg-white dark:bg-slate-800
                      ${error
                        ? 'border-red-500 text-red-500'
                        : 'border-slate-300 text-slate-900 dark:text-white dark:border-slate-700'}
                      focus:border-red-500 focus:ring-1 focus:ring-red-500`}
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black dark:hover:text-white"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
