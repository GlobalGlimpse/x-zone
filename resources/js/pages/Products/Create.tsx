import React, { useEffect, useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { route } from 'ziggy-js'
import { Info, UploadCloud, X, ArrowLeft, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

import AppLayout from '@/layouts/app-layout'
import ParticlesBackground from '@/components/ParticlesBackground'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import DynamicFields from './Partials/DynamicFields'
import CompatibilityFields from './Partials/CompatibilityFields'

import type { PageProps, Category, Currency, TaxRate } from '@/types'

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type SpecializedData = Record<string, any>

type CompatibilityEntry = {
  compatible_with_id: string
  direction?: 'bidirectional' | 'uni'
  note?: string
}

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
  category_id: number | ''
  is_active: boolean
  images: File[]
  primary_image_index: number
  spec: SpecializedData
  compatibilities: CompatibilityEntry[]
}

interface Props extends PageProps<{
  brands: { id: number; name: string }[]
  categories: Category[]
  currencies: Currency[]
  taxRates: TaxRate[]
}> {}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function CreateProduct({ brands, categories, currencies, taxRates }: Props) {
  const { data, setData, post, processing, errors } = useForm<FormData>({
    brand_id: '',
    name: '',
    model: '',
    sku: '',
    description: '',
    price: '',
    stock_quantity: 0,
    currency_code: currencies[0]?.code ?? '',
    tax_rate_id: taxRates[0]?.id ?? 0,
    category_id: '',
    is_active: true,
    images: [],
    primary_image_index: 0,
    spec: {},
    compatibilities: [],
  })

  const [previews, setPreviews] = useState<string[]>([])
  useEffect(() => {
    const urls = data.images.map(f => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach(URL.revokeObjectURL)
  }, [data.images])

  const [allProducts, setAllProducts] = useState<{ id:string; name:string }[]>([])
  useEffect(() => {
    axios.get(route('products.compatible-list')).then(res => setAllProducts(res.data))
  }, [])

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files).slice(0, 7)
    setData('images', files)
    setData('primary_image_index', 0)
  }

  const removeImage = (idx:number) => {
    const imgs = data.images.filter((_, i) => i !== idx)
    setData('images', imgs)
    setData('primary_image_index', Math.min(data.primary_image_index, imgs.length - 1))
  }

  const choosePrimary = (idx:number) => setData('primary_image_index', idx)

  const setSpecField = (field:string, value:any) =>
    setData('spec', { ...(data.spec ?? {}), [field]: value })

  const setCompatibilities = (list:CompatibilityEntry[]) =>
    setData('compatibilities', list)

  const currentCategory = categories.find(c => c.id === data.category_id)
  const currentSlug = currentCategory?.slug ?? ''
  const machineSlugs = ['servers', 'desktops', 'laptops']
  const showCompat = currentSlug && !machineSlugs.includes(currentSlug)

  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault()
    post(route('products.store'), {
      forceFormData: true,
      onError: () => window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  return (
    <>
      <Head title="Créer un produit" />

      <div className="relative min-h-screen bg-gradient-to-br
                      from-white via-slate-100 to-slate-200
                      dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749]
                      transition-colors duration-500">
        <ParticlesBackground />

        <AppLayout breadcrumbs={[{ title:'Produits', href:'/products' }, { title:'Créer' }]}>
          <div className="grid grid-cols-12 gap-6 p-6">

            {/* ────────── Formulaire ────────── */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-7">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                              dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8">
                <h1 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
                  Nouveau produit
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {Object.keys(errors).length > 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
                      <strong>Erreur(s) dans le formulaire :</strong>
                      <ul className="list-disc list-inside mt-2 text-sm">
                        {Object.entries(errors).map(([field, message]) => (
                          <li key={field}>{message}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Marque <span className="text-red-500">*</span>
                      </label>
                      <Select value={data.brand_id} onValueChange={v => setData('brand_id', v)}>
                        <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500">
                          <SelectValue placeholder="Sélectionner une marque" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Modèle
                      </label>
                      <Input
                        placeholder="Modèle du produit"
                        value={data.model}
                        onChange={e => setData('model', e.target.value)}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Nom du produit"
                        required
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        SKU <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Code produit"
                        required
                        value={data.sku}
                        onChange={e => setData('sku', e.target.value)}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Description
                    </label>
                    <Textarea
                      placeholder="Description du produit"
                      value={data.description}
                      onChange={e => setData('description', e.target.value)}
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Catégorie <span className="text-red-500">*</span>
                    </label>
                    <Select value={String(data.category_id)} onValueChange={v => setData('category_id', Number(v))}>
                      <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {currentSlug && (
                    <DynamicFields slug={currentSlug as any} data={data.spec} setData={setSpecField} errors={errors.spec ?? {}} />
                  )}

                  {showCompat && (
                    <CompatibilityFields compatibilities={data.compatibilities} allProducts={allProducts} onChange={setCompatibilities} />
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Images du produit
                    </label>
                    <label className="cursor-pointer flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <UploadCloud className="h-6 w-6 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">Cliquez ou déposez vos images ici (max. 7)</p>
                      <input type="file" multiple className="hidden" onChange={handleFiles} />
                    </label>
                  </div>

                  {previews.length > 0 && (
                    <motion.div layout className="grid grid-cols-3 gap-4">
                      {previews.map((src, i) => (
                        <motion.div layout key={i} className="relative">
                          <img src={src} className="h-32 w-full object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800"
                            onClick={() => removeImage(i)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            onClick={() => choosePrimary(i)}
                            className={`absolute bottom-1 left-1 px-2 py-0.5 text-xs rounded ${
                              data.primary_image_index === i
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                            }`}
                          >
                            {data.primary_image_index === i ? 'Principale' : 'Choisir'}
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Prix <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                        value={data.price}
                        onChange={e => setData('price', e.target.value)}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Devise
                      </label>
                      <Select value={data.currency_code} onValueChange={v => setData('currency_code', v)}>
                        <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500">
                          <SelectValue placeholder="Devise" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.symbol} ({c.code})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        TVA
                      </label>
                      <Select value={String(data.tax_rate_id)} onValueChange={v => setData('tax_rate_id', Number(v))}>
                        <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500">
                          <SelectValue placeholder="Taux de TVA" />
                        </SelectTrigger>
                        <SelectContent>
                          {taxRates.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name} ({t.rate}%)</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <label htmlFor="stock_quantity" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Stock <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="stock_quantity"
                        type="number"
                        min={0}
                        required
                        value={data.stock_quantity}
                        onChange={e => setData('stock_quantity', Number(e.target.value))}
                        className="w-40 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={e => setData('is_active', e.target.checked)}
                        className="w-4 h-4 text-red-600 bg-white border-slate-300 rounded focus:ring-red-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Produit actif</span>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      onClick={() => history.back()}
                      className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-0"
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
                      {processing ? 'Création…' : 'Créer le produit'}
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
                  Guide de création
                </h2>
                <div className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    Commencez par remplir les informations de base du produit. Une fois la catégorie sélectionnée, des champs spécialisés apparaîtront automatiquement.
                  </p>

                  {currentCategory && (
                    <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                      <h3 className="font-medium text-slate-900 dark:text-white">À propos de la catégorie : {currentCategory.name}</h3>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex gap-3">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                          <p>Les champs spécialisés s'affichent en fonction de la catégorie sélectionnée.</p>
                          {showCompat && (
                            <p>Pour les composants, les compatibilités sont toujours unidirectionnelles vers les machines (serveurs, ordinateurs de bureau, portables).</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">Conseils :</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Utilisez des images de haute qualité</li>
                        <li>• Remplissez tous les champs obligatoires</li>
                        <li>• Le SKU doit être unique</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </AppLayout>
      </div>
    </>
  )
}
