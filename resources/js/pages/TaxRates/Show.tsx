// resources/js/Pages/TaxRates/Show.tsx
import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { PageProps, TaxRate } from '@/types'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Pencil, ArrowLeft, Info } from 'lucide-react'
import { route } from 'ziggy-js'

interface Props extends PageProps<{
  taxRate: TaxRate
}> {}

export default function ShowTaxRate({ taxRate }: Props) {
  const isDeleted = !!taxRate.deleted_at
  const rateNumber = Number(taxRate.rate)

  return (
    <>
      <Head title={`Taux de TVA — ${taxRate.name}`} />

      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Taux de TVA', href: '/tax-rates' },
          { title: taxRate.name },
        ]}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-0">
              Détails du taux de TVA
            </h1>
            <div className="flex space-x-3">
              <Link href={route('taxrates.index')}>
                <Button variant="secondary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              {!isDeleted && (
                <Link href={route('taxrates.edit', taxRate.id)}>
                 <Button className="group relative flex items-center justify-center
                                                        rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-5 py-3
                                                        text-sm font-semibold text-white shadow-md transition-all
                                                        hover:from-red-500 hover:to-red-600 focus:ring-2 focus:ring-red-500">
                                       <Pencil className="w-4 h-4 mr-2" />
                                       Modifier
                                     </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Informations principales */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-7">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                              dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8 space-y-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-4 border-slate-200 dark:border-slate-700">
                  Informations générales
                </h2>

                <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                  <div>
                    <div className="font-medium text-slate-500 dark:text-slate-400">Nom</div>
                    <div className="text-base">{taxRate.name}</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-500 dark:text-slate-400">Taux (%)</div>
                    <div className="text-base">{rateNumber.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-500 dark:text-slate-400">Statut</div>
                    <div className="mt-1">
                      {isDeleted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600/10 text-red-600">
                          Désactivé
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600/10 text-green-600">
                          Actif
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-500 dark:text-slate-400">Créé le</div>
                    <div>
                      {new Date(taxRate.created_at).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  {taxRate.updated_at && (
                    <div>
                      <div className="font-medium text-slate-500 dark:text-slate-400">Dernière mise à jour</div>
                      <div>
                        {new Date(taxRate.updated_at).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* À propos de la TVA */}
            <div className="col-span-12 lg:col-span-4 xl:col-span-5">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                              dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  À propos de la TVA
                </h2>
                <div className="text-sm text-slate-700 dark:text-slate-300 space-y-3 text-justify">
                  <p>
                    La Taxe sur la Valeur Ajoutée (TVA) est un impôt indirect sur la consommation appliqué à la plupart des biens et services.
                  </p>
                  <p>
                    Le taux de TVA correspond au pourcentage appliqué au prix hors taxe pour obtenir le prix toutes taxes comprises (TTC).
                  </p>
                  <p className="font-semibold">Taux courants au Maroc :</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Taux normal : 20%</li>
                    <li>Taux réduit : 10% (produits alimentaires, eau, électricité)</li>
                    <li>Taux super-réduit : 7% (agriculture, hôtellerie...)</li>
                    <li>Taux particulier : 14% (services spécifiques)</li>
                  </ul>
                  <p>
                    Une gestion rigoureuse des taux est essentielle pour assurer la conformité fiscale et une facturation correcte.
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
