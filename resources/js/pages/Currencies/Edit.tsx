import React from 'react'
import { Head, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Info } from 'lucide-react'
import { route } from 'ziggy-js'
import { Currency, PageProps } from '@/types'

interface Props extends PageProps<{
  currency: Currency
}> {}

export default function EditCurrency({ currency }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    code: currency.code,
    name: currency.name,
    symbol: currency.symbol,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    put(route('currencies.update', currency.code))
  }

  return (
    <>
      <Head title={`Modifier la devise — ${currency.code}`} />
      <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Devises', href: '/currencies' },
        { title: currency.code, href: route('currencies.edit', currency.code) },
        { title: 'Éditer', href: route('currencies.edit', currency.code) }
      ]}>
        <div className="grid grid-cols-12 gap-6 p-6">

          {/* -------- Formulaire -------- */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                            dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8">
              <h1 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-white">
                Modifier la devise
              </h1>
              <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Code ISO 4217<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.code}
                    disabled
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-800 rounded-lg shadow-sm sm:text-sm cursor-not-allowed text-slate-700 dark:text-white"
                  />
                  {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nom<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm text-slate-900 dark:text-white"
                    required
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                {/* Symbole */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Symbole<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.symbol}
                    maxLength={5}
                    onChange={e => setData('symbol', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm text-slate-900 dark:text-white"
                    required
                  />
                  {errors.symbol && <p className="mt-1 text-sm text-red-500">{errors.symbol}</p>}
                </div>

                {/* Boutons */}
                <div className="flex justify-between">
                  <Button
                    type="button"
                    onClick={() => history.back()}
                    variant="secondary"
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={processing}
                  >
                    {processing ? 'Enregistrement…' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* ---- Aide ---- */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-5">
            <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                            dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                À propos des devises
              </h2>
              <div className="prose max-w-none text-sm text-slate-700 dark:text-slate-300">
                <p>Les devises permettent de gérer la facturation multidevise dans vos applications.</p>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <p>
                    Le <b>code</b> n’est pas modifiable après création, il sert de clé principale.<br />
                    Modifiez le <b>nom</b> ou le <b>symbole</b> si nécessaire.
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
