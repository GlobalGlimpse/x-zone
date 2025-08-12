// resources/js/Pages/Categories/Edit.tsx
import React, { useEffect, useState } from 'react'
import { Head, useForm, Link } from '@inertiajs/react'
import { PageProps, Category } from '@/types'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Info, ArrowLeft, Save } from 'lucide-react'
import { route } from 'ziggy-js'

interface Props extends PageProps<{
  category: Category
}> {}

export default function EditCategory({ category }: Props) {
  /* ---------- Slug auto / état ---------- */
  const defaultSlug = slugify(category.name)
  const [slugEdited, setSlugEdited] = useState(category.slug !== defaultSlug)

  const { data, setData, patch, processing, errors } = useForm({
    name: category.name,
    slug: category.slug,
  })

  useEffect(() => {
    if (!slugEdited) {
      setData('slug', slugify(data.name))
    }
  }, [data.name, slugEdited])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    patch(route('categories.update', category.id))
  }

  /* ---------- Render ---------- */
  return (
    <>
      <Head title={`Modifier « ${category.name} »`} />

      <div className="relative min-h-screen bg-gradient-to-br
                      from-white via-slate-100 to-slate-200
                      dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749]
                      transition-colors duration-500">

        <AppLayout breadcrumbs={[
          { title: 'Dashboard',   href: '/dashboard' },
          { title: 'Catégories',  href: '/categories' },
          { title: category.name, href: route('categories.show', category.id) },
          { title: 'Éditer',      href: route('categories.edit', category.id) },
        ]}>

          <div className="p-6">
            {/* ===== Header ===== */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-0">
                Modifier la catégorie
              </h1>

              <Link href="/categories">
                <Button variant="ghost"
                        className="bg-muted hover:bg-muted/80 text-slate-700 dark:text-slate-300">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à la liste
                </Button>
              </Link>
            </div>

            {/* ===== Grid ===== */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

              {/* ------ Formulaire ------ */}
              <div className="xl:col-span-7">
                <section className="rounded-xl border border-slate-200 bg-white shadow-xl
                                    dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-6">
                    Informations générales
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Nom */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Nom <span className="text-red-600">*</span>
                      </label>
                      <input
                        value={data.name}
                        onChange={e => {
                          setData('name', e.target.value)
                          if (e.target.value === '') setSlugEdited(false)
                        }}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                                   bg-white/70 dark:bg-slate-800/40 text-slate-900 dark:text-white
                                   shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                   placeholder:text-slate-400 dark:placeholder:text-slate-500
                                   transition-colors"
                        required
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                      )}
                    </div>

                    {/* Slug */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Slug <span className="text-red-600">*</span>
                      </label>
                      <input
                        value={data.slug}
                        onChange={e => {
                          setData('slug', e.target.value)
                          setSlugEdited(true)
                        }}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                                   bg-white/70 dark:bg-slate-800/40 text-slate-900 dark:text-white
                                   shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                   placeholder:text-slate-400 dark:placeholder:text-slate-500
                                   transition-colors"
                        required
                      />
                      {errors.slug && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug}</p>
                      )}
                    </div>

                    {/* Boutons */}
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
                </section>
              </div>

              {/* ------ Aide ------ */}
              <div className="xl:col-span-5">
                <section className="rounded-xl border border-slate-200 bg-white shadow-xl
                                    dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                    À propos des catégories
                  </h2>

                  <p className="text-slate-600 dark:text-slate-400">
                    Les catégories organisent votre catalogue et facilitent la recherche.
                  </p>

                  <p className="text-slate-600 dark:text-slate-400 mt-4">
                    Le <strong>slug</strong> est utilisé dans l’URL. Il doit être unique
                    et ne contenir que des caractères alphanumériques et des tirets.
                  </p>

                  <div className="mt-6 p-4 rounded-lg border
                                  bg-blue-50 border-blue-100 dark:bg-blue-900/30 dark:border-blue-600/40
                                  flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-300 mt-0.5" />
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      Le slug est généré automatiquement à partir du nom,
                      sauf si vous le modifiez manuellement.
                    </p>
                  </div>
                </section>
              </div>

            </div>
          </div>
        </AppLayout>
      </div>
    </>
  )
}

/* Helper local : “Nouvelle Catégorie” → “nouvelle-categorie” */
function slugify(str: string): string {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
