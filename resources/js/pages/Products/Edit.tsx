// resources/js/Pages/Products/Edit.tsx
import React, { useEffect, useState } from 'react'
import { Head, useForm, router, Link } from '@inertiajs/react'
import { route } from 'ziggy-js'
import axios from 'axios'
import { Info, UploadCloud, X, Trash2, ArrowLeft, Save } from 'lucide-react'
import { motion } from 'framer-motion'

import AppLayout from '@/layouts/app-layout'
import ParticlesBackground from '@/components/ParticlesBackground'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import DynamicFields from './Partials/DynamicFields'
import CompatibilityFields, { CompatibilityEntry } from './Partials/CompatibilityFields'

import type {
  PageProps, Category, Currency, TaxRate,
  Product, ProductImage,
} from '@/types'

/* ---------- Types ---------- */
interface FormData {
  brand_id: string
  name: string
  model: string
  sku: string
  description: string
  price: string
  stock_quantity: number
  currency_code: string
  tax_rate_id: number
  category_id: number
  is_active: boolean
  images: File[]
  primary_image_index: number
  deleted_image_ids: number[]
  restored_image_ids: number[]
  compatibilities: CompatibilityEntry[]
  spec: Record<string, any>
}

interface Props extends PageProps<{
  product: Product & { images: ProductImage[] }
  brands: { id: number; name: string }[]
  categories: Category[]
  currencies: Currency[]
  taxRates: TaxRate[]
  compatibilities: CompatibilityEntry[]
}> {}

/* ---------- Component ---------- */
export default function EditProduct({
  product,
  brands,
  categories,
  currencies,
  taxRates,
  compatibilities: initialCompat,
}: Props) {
  /* ----- Catégorie / spec ----- */
  const currentCat  = categories.find(c => c.id === product.category?.id)
  const currentSlug = currentCat?.slug ?? ''
  const singular    = currentSlug.endsWith('ies')
    ? currentSlug.slice(0, -3) + 'y'
    : currentSlug.endsWith('s') ? currentSlug.slice(0, -1) : currentSlug
  const initialSpec = (product as any)[currentSlug] ?? (product as any)[singular] ?? {}

  /* ----- useForm ----- */
  const firstPrimary = Math.max(0, product.images.findIndex(i => i.is_primary))
  const { data, setData, processing, errors } = useForm<FormData>({
    brand_id: String(product.brand?.id ?? ''),
    name: product.name,
    model: product.model ?? '',
    sku: product.sku,
    description: product.description ?? '',
    price: product.price.toString(),
    stock_quantity: product.stock_quantity,
    currency_code: product.currency?.code ?? currencies[0]?.code ?? '',
    tax_rate_id: product.tax_rate?.id ?? taxRates[0]?.id ?? 0,
    category_id: product.category?.id ?? 0,
    is_active: !product.deleted_at,
    images: [],
    primary_image_index: firstPrimary,
    deleted_image_ids: [],
    restored_image_ids: [],
    compatibilities: initialCompat,
    spec: initialSpec,
  })

  /* ----- Compatibilité ----- */
  const machineSlugs = ['servers', 'desktops', 'laptops']
  const showCompat   = currentSlug && !machineSlugs.includes(currentSlug)

  /* ----- Liste produits cible ----- */
  const [allProducts, setAllProducts] = useState<{ id: string; name: string }[]>([])
  useEffect(() => { axios.get(route('products.compatible-list')).then(r => setAllProducts(r.data)) }, [])

  /* ----- Images ----- */
  const [previews, setPreviews] = useState<string[]>([])
  const [existing, setExisting] = useState<ProductImage[]>(product.images)
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews])

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files).slice(0, 7)
    setData('images', [...data.images, ...files])
    setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))])
  }

  const removePreview = (idx: number) => {
    setData('images', data.images.filter((_, i) => i !== idx))
    setPreviews(previews.filter((_, i) => i !== idx))
    if (data.primary_image_index === idx)            setData('primary_image_index', 0)
    else if (data.primary_image_index > idx)         setData('primary_image_index', data.primary_image_index - 1)
  }

  const toggleExisting = (id: number) => {
    const isDel = data.deleted_image_ids.includes(id)
    if (isDel) {
      setData('deleted_image_ids',  data.deleted_image_ids.filter(i => i !== id))
      setData('restored_image_ids', [...data.restored_image_ids, id])
      setExisting(imgs => imgs.map(img => img.id === id ? { ...img, deleted_at: null } : img))
    } else {
      setData('deleted_image_ids',  [...data.deleted_image_ids, id])
      setData('restored_image_ids', data.restored_image_ids.filter(i => i !== id))
      setExisting(imgs => imgs.map(img => img.id === id ? { ...img, deleted_at: '1' } : img))
    }
  }

  const setPrimary = (gIdx: number) => setData('primary_image_index', gIdx)

  /* ----- Spec & compat setters ----- */
  const setSpecField = (f: string, v: any) => setData('spec', { ...(data.spec ?? {}), [f]: v })
  const setCompat    = (list: CompatibilityEntry[]) => setData('compatibilities', list)

  /* ----- Submit ----- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.post(
      route('products.update', product.id),
      { ...data, _method: 'PATCH' },
      { forceFormData: true, preserveScroll: true, preserveState: true }
    )
  }

  /* ---------- Render ---------- */
  return (
    <>
      <Head title={`Modifier — ${product.name}`} />

      <div className="relative min-h-screen bg-gradient-to-br
                      from-white via-slate-100 to-slate-200
                      dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749]
                      transition-colors duration-500">
        <ParticlesBackground />

        <AppLayout breadcrumbs={[
          { title: 'Produits', href: '/products' },
          { title: product.name, href: route('products.show', product.id) },
          { title: 'Modifier' },
        ]}>

          <div className="flex flex-col sm:flex-row justify-between sm:items-center px-6 pt-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-0">
              Modifier le produit
            </h1>
            <Link href="/products">
              <Button variant="ghost"
                      className="bg-muted hover:bg-muted/80 text-slate-700 dark:text-slate-300">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la liste
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-12 gap-6 p-6">

            {/* ----------- Formulaire ----------- */}
            <form
              onSubmit={handleSubmit}
              className="col-span-12 lg:col-span-8 xl:col-span-7
                         rounded-xl border border-slate-200 bg-white shadow-xl
                         dark:bg-white/5 dark:border-slate-700 backdrop-blur-md
                         p-8 space-y-8"
            >
              {/* Marque + Modèle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={data.brand_id} onValueChange={v => setData('brand_id', v)}>
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-red-500 focus:border-red-500">
                    <SelectValue placeholder="Marque" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Modèle"
                  value={data.model}
                  onChange={e => setData('model', e.target.value)}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Nom + SKU */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Nom"
                  required
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-red-500 focus:border-red-500"
                />
                <Input
                  placeholder="SKU"
                  required
                  value={data.sku}
                  onChange={e => setData('sku', e.target.value)}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Description */}
              <Textarea
                placeholder="Description"
                value={data.description}
                onChange={e => setData('description', e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-red-500 focus:border-red-500"
              />

              {/* Catégorie (lecture seule) */}
              <Select value={String(data.category_id)} disabled>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>

              {/* Champs spécialisés */}
              {currentSlug && (
                <DynamicFields slug={currentSlug as any} data={data.spec} setData={setSpecField} errors={errors.spec ?? {}} />
              )}

              {/* Compatibilités */}
              {showCompat && (
                <CompatibilityFields compatibilities={data.compatibilities} allProducts={allProducts} onChange={setCompat} />
              )}

              {/* Upload Images */}
              <label className="cursor-pointer flex flex-col items-center justify-center
                                 py-8 border-2 border-dashed rounded-lg
                                 border-slate-300 dark:border-slate-600
                                 bg-slate-50 dark:bg-slate-800/50
                                 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors">
                <UploadCloud className="h-6 w-6 text-slate-400 mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Cliquez ou déposez vos images ici (max. 7)
                </p>
                <input type="file" multiple className="hidden" onChange={addFiles} />
              </label>

              {/* Nouvelles pré-vues */}
              {previews.length > 0 && (
                <motion.div layout className="grid grid-cols-3 gap-4">
                  {previews.map((src, i) => (
                    <motion.div layout key={`new-${i}`} className="relative">
                      <img src={src} className="h-32 w-full object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                      <Button size="icon" variant="ghost"
                              className="absolute top-1 right-1 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800"
                              onClick={() => removePreview(i)}>
                        <X className="w-4 h-4" />
                      </Button>
                      <Button type="button" onClick={() => setPrimary(i)}
                              className={`absolute bottom-1 left-1 px-2 py-0.5 text-xs rounded
                                          ${data.primary_image_index === i
                                            ? 'bg-red-600 text-white'
                                            : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                          }`}>
                        {data.primary_image_index === i ? 'Principale' : 'Choisir'}
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Images existantes */}
              {existing.length > 0 && (
                <>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">Images existantes</h3>
                  <motion.div layout className="grid grid-cols-3 gap-4">
                    {existing.map((img, idx) => {
                      const gIdx = previews.length + idx
                      const isDel = !!img.deleted_at
                      return (
                        <motion.div layout key={img.id}
                          className={`relative border rounded-lg overflow-hidden
                                      ${isDel ? 'opacity-60 border-red-400' : 'border-slate-300 dark:border-slate-600'}`}>
                          <img src={`/storage/${img.path}`} className="h-32 w-full object-cover" />
                          <Button size="icon" variant="ghost"
                                  className={`absolute top-1 right-1
                                              ${isDel ? 'text-green-600 hover:bg-green-600/10'
                                                       : 'text-red-600 hover:bg-red-600/10'}`}
                                  onClick={() => toggleExisting(img.id)}>
                            {isDel ? <X /> : <Trash2 />}
                          </Button>
                          <Button type="button" onClick={() => setPrimary(gIdx)}
                                  className={`absolute bottom-1 left-1 px-2 py-0.5 text-xs rounded
                                              ${data.primary_image_index === gIdx
                                                ? 'bg-red-600 text-white'
                                                : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                              }`}>
                            {data.primary_image_index === gIdx ? 'Principale' : 'Choisir'}
                          </Button>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                </>
              )}

              {/* Prix / Devise / TVA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="number" step="0.01" placeholder="Prix" required
                  value={data.price} onChange={e => setData('price', e.target.value)}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-red-500 focus:border-red-500"
                />
                <Select value={data.currency_code} onValueChange={v => setData('currency_code', v)}>
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-red-500 focus:border-red-500">
                    <SelectValue placeholder="Devise" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.symbol} ({c.code})</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={String(data.tax_rate_id)} onValueChange={v => setData('tax_rate_id', Number(v))}>
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-red-500 focus:border-red-500">
                    <SelectValue placeholder="TVA" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxRates.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name} ({t.rate}%)</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Stock + Actif */}
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Stock</label>
                  <Input
                    type="number" min={0} required className="w-32
                           bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600
                           text-slate-900 dark:text-white focus:ring-red-500 focus:border-red-500"
                    value={data.stock_quantity}
                    onChange={e => setData('stock_quantity', Number(e.target.value))}
                  />
                </div>
                <label className="flex items-center space-x-2 select-none">
                  <input type="checkbox" checked={data.is_active}
                         onChange={e => setData('is_active', e.target.checked)}
                         className="h-4 w-4 text-red-600 bg-white border-slate-300 rounded focus:ring-red-500 focus:ring-2" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Activer</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4">
                <Button variant="secondary" type="button" onClick={() => history.back()}>
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

            {/* ----------- Aside ----------- */}
            <aside className="col-span-12 lg:col-span-4 xl:col-span-5
                               rounded-xl border border-slate-200 bg-white shadow-xl
                               dark:bg-white/5 dark:border-slate-700 backdrop-blur-md
                               p-8 space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                  Guide d'édition
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Modifiez les champs puis cliquez sur <em>Enregistrer</em>.
                </p>
              </div>

              {currentCat && (
                <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-6">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    À propos de la catégorie : {currentCat.name}
                  </h3>
                  <div className="flex gap-3 p-4 rounded-lg border
                                  bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                    <Info className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                      <p>Les champs spécialisés varient selon la catégorie.</p>
                      {showCompat && (
                        <p>Les compatibilités sont unidirectionnelles
                           vers les machines (serveurs, desktops, laptops).</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </AppLayout>
      </div>
    </>
  )
}
