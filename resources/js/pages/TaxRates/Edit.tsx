// resources/js/Pages/TaxRates/Edit.tsx
import React, { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Info, Save } from 'lucide-react'
import { route } from 'ziggy-js'
import type { TaxRate } from '@/types'

interface Props {
  taxRate: TaxRate
}

export default function TaxRateEdit({ taxRate }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: taxRate.name,
    rate: taxRate.rate.toString(),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    put(route('taxrates.update', taxRate.id))
  }

  return (
    <>
      <Head title={`Modifier taux de TVA — ${taxRate.name}`} />

      <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Taux de TVA', href: '/tax-rates' },
        { title: taxRate.name, href: route('taxrates.show', taxRate.id) },
        { title: 'Éditer' },
      ]}>
        <div className="grid grid-cols-12 gap-6 p-6">

          {/* Formulaire principal */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                            dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8 space-y-6">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                Modifier le taux de TVA
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-red-500 focus:border-red-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Taux */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Taux (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    value={data.rate}
                    onChange={e => setData('rate', e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-red-500 focus:border-red-500"
                  />
                  {errors.rate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.rate}</p>
                  )}
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

          {/* Panneau d'information */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-5">
            <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                            dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                À propos des taux de TVA
              </h2>
              <div className="text-sm text-slate-700 dark:text-slate-300 space-y-3 text-justify">
                <p>
                  Les taux de TVA sont appliqués sur les ventes de biens et services.
                  Certains produits essentiels peuvent bénéficier de taux réduits.
                </p>
                <p>
                  Voici quelques exemples en vigueur au Maroc :
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Taux normal : 20%</li>
                  <li>Taux réduit : 10%</li>
                  <li>Taux super réduit : 7%</li>
                  <li>Taux particulier : 14%</li>
                </ul>
                <div className="mt-4 p-4 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <p>
                    Définissez un taux de TVA conforme au produit ou service vendu pour garantir la conformité fiscale.
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
