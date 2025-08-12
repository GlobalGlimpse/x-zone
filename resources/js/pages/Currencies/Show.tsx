import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { PageProps, Currency } from '@/types'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Pencil, ArrowLeft, Info } from 'lucide-react'
import { route } from 'ziggy-js'

interface Props extends PageProps<{
  currency: Currency
}> {}

export default function ShowCurrency({ currency }: Props) {
  const isDeleted = !!currency.deleted_at

  return (
    <>
      <Head title={`Devise — ${currency.name}`} />

      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Devises', href: '/currencies' },
          { title: currency.name },
        ]}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Détails de la devise
            </h1>
            <div className="flex gap-3">
              <Link href={route('currencies.index')}>
                <Button
                  variant="secondary"
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              {!isDeleted && (
                <Link href={route('currencies.edit', currency.code)}>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                              dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8">
                <h2 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white">
                  Informations
                </h2>
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <div>
                    <h3 className="text-sm font-medium">Nom</h3>
                    <p className="text-lg font-medium mt-1 text-slate-900 dark:text-white">{currency.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Code</h3>
                    <p className="text-lg font-mono tracking-widest mt-1 text-slate-900 dark:text-white">{currency.code}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Symbole</h3>
                    <p className="text-lg font-medium mt-1 text-slate-900 dark:text-white">{currency.symbol}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Statut</h3>
                    <p className="mt-1">
                      {isDeleted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100">
                          Désactivée
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100">
                          Active
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Créée le</h3>
                    <p className="text-sm mt-1">
                      {currency.created_at
                        ? new Date(currency.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </p>
                  </div>
                  {currency.updated_at && (
                    <div>
                      <h3 className="text-sm font-medium">Dernière mise à jour</h3>
                      <p className="text-sm mt-1">
                        {new Date(currency.updated_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* À propos */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                              dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  À propos des devises
                </h2>
                <div className="prose max-w-none text-sm text-slate-700 dark:text-slate-300" style={{ textAlign: 'justify' }}>
                  <p className="mb-4">
                    Une <b>devise</b> représente une unité monétaire (ex : MAD, EUR, USD). Elle est utilisée pour les montants, les conversions, et la facturation multidevise.
                  </p>
                  <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><b>Code</b> : format ISO 4217 (ex : MAD, USD, EUR).</li>
                    <li><b>Symbole</b> : utilisé dans l’interface (ex : €, $, د.م.).</li>
                  </ul>
                  <p>
                    Les devises sont essentielles pour la gestion des prix, la conformité et l’export international.
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
