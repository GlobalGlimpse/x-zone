import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
  Calculator, Percent, ArrowLeft, Plus, Info
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import ParticlesBackground from '@/components/ParticlesBackground';
import { Button } from '@/components/ui/button';

interface FormData {
  name: string;
  rate: string;
  [key: string]: string;
}

export default function CreateTaxRate() {
  /* ─── État Inertia ─── */
  const { data, setData, post, processing, errors } = useForm<FormData>({
    name: '',
    rate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('taxrates.store'));
  };

  /* ─────────────────────────────────────────── */
  return (
    <>
      <Head title="Créer un taux de TVA" />

      <div className="relative min-h-screen bg-gradient-to-br
                      from-white via-slate-100 to-slate-200
                      dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749]
                      transition-colors duration-500">
        <ParticlesBackground />

        <AppLayout breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Taux de TVA', href: '/tax-rates' },
          { title: 'Créer', href: '/tax-rates/create' },
        ]}>

          <div className="grid grid-cols-12 gap-6 p-6">

            {/* ────────── Formulaire ────────── */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-7">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                              dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8">
                <h1 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
                  Nouveau taux de TVA
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nom */}
                  <Field
                    id="name"
                    label="Nom du taux"
                    Icon={Calculator}
                    value={data.name}
                    onChange={(v) => setData('name', v)}
                    error={errors.name}
                    required
                  />

                  {/* Taux */}
                  <Field
                    id="rate"
                    label="Taux (%)"
                    Icon={Percent}
                    type="number"
                    value={data.rate}
                    onChange={(v) => setData('rate', v)}
                    error={errors.rate}
                    required
                    step="0.01"
                    min="0"
                    max="100"
                  />

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
                        : (<Plus className="w-4 h-4 mr-2" />)}
                      {processing ? 'Création…' : 'Créer le taux'}
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
                  À propos des taux de TVA
                </h2>
                <div className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    Ajoutez un nouveau taux de TVA applicable à vos produits.
                  </p>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Le taux est exprimé en pourcentage, par exemple 20 pour 20%.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </AppLayout>
      </div>
    </>
  );
}

/* ────────── Composant réutilisable ────────── */
interface FieldProps {
  id: string;
  label: string;
  Icon: any;
  type?: React.HTMLInputTypeAttribute;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  error?: string | false;
  step?: string;
  min?: string;
  max?: string;
}

function Field({
  id, label, Icon, type = 'text', required = true,
  value, onChange, autoComplete, error, step, min, max,
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
          step={step}
          min={min}
          max={max}
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
