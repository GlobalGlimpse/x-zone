import React from 'react'
import { Head, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Info } from 'lucide-react'
import { route } from 'ziggy-js'

interface FormData {
  code: string
  symbol: string
  name: string
  [key: string]: string
}

export default function CreateCurrency() {
  const { data, setData, post, processing, errors } = useForm<FormData>({
    code: '',
    symbol: '',
    name: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('currencies.store'))
  }

  return (
    <>
      <Head title="Créer une devise" />
      <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Devises', href: '/currencies' },
        { title: 'Créer' },
      ]}>
        <div className="grid grid-cols-12 gap-6 p-6">

          {/* Formulaire */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                            dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8 space-y-6">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                Nouvelle devise
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-red-500 focus:border-red-500"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                </div>

                {/* Code ISO */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Code ISO <span className="text-gray-400 text-xs">(ex: EUR)</span> <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.code}
                    onChange={e => setData('code', e.target.value.toUpperCase())}
                    maxLength={3}
                    minLength={2}
                    required
                    className="w-full px-4 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white uppercase focus:ring-red-500 focus:border-red-500"
                  />
                  {errors.code && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.code}</p>}
                </div>

                {/* Symbole */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Symbole <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.symbol}
                    onChange={e => setData('symbol', e.target.value)}
                    maxLength={5}
                    required
                    className="w-full px-4 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-red-500 focus:border-red-500"
                  />
                  {errors.symbol && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.symbol}</p>}
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => history.back()}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={processing}
                  >
                    {processing ? 'Création…' : 'Créer la devise'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Aide */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-5">
            <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                            dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                À propos des devises
              </h2>
              <div className="text-sm text-slate-700 dark:text-slate-300 space-y-3 text-justify">
                <p>
                  Ajoutez une devise que vous souhaitez utiliser dans vos opérations,
                  factures ou devis.
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <p>
                    Le code doit être au format ISO 4217 (ex: EUR, USD, MAD).
                    Le symbole (€, $, د.م., ...) est utilisé dans l’interface utilisateur.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </AppLayout>
    </>
  )
}
