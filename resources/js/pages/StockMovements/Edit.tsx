/* --------------------------------------------------------------------------
   IMPORTS
   -------------------------------------------------------------------------- */
import React, {
  useEffect, useMemo, useState, ReactNode, useRef,
} from 'react'
import { Head, useForm, router, Link } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
  ArrowLeft, Save,
  UploadCloud, X, Trash2, Layers, Info, Calendar,
} from 'lucide-react'
import { motion } from 'framer-motion'

import AppLayout            from '@/layouts/app-layout'
import ParticlesBackground   from '@/components/ParticlesBackground'
import { Button   }          from '@/components/ui/button'
import { Input    }          from '@/components/ui/input'
import { Textarea }          from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

import type {
  PageProps, Currency, Product,
  StockMovement as Movement,
  StockMovementAttachment as Attachment,
  Provider, StockMovementReason as Reason,
} from '@/types'

/* --------------------------------------------------------------------------
   INLINE CSS – masque l’icône native du date-picker
   -------------------------------------------------------------------------- */
const DateInputStyles = () => (
  <style>{`
    input[type='date']::-webkit-calendar-picker-indicator { opacity:0; display:none; }
    input[type='date']::-webkit-inner-spin-button { display:none; }
    input[type='date']::-moz-calendar-picker-indicator { display:none; }
  `}</style>
)

/* --------------------------------------------------------------------------
   TYPES
   -------------------------------------------------------------------------- */
interface FormData {
  [key: string]: any
  product_id   : string
  type         : 'in' | 'out' | 'adjustment'
  quantity     : string
  reference    : string
  provider_id  : string
  reason_id    : string
  unit_cost    : string
  currency_code: string
  notes        : string
  movement_date: string
  attachments           : File[]
  deleted_attachment_ids : number[]
  restored_attachment_ids: number[]
}

interface Props extends PageProps<{
  movement   : Movement & {
    attachments: Attachment[]
    currency: Currency
    product: Product
    provider?: Provider
    movement_reason?: Reason
  }
  products   : Product[]
  currencies : Currency[]
  providers? : Provider[]
  reasons?   : Reason[]
}> {}

/* --------------------------------------------------------------------------
   COMPONENT
   -------------------------------------------------------------------------- */
export default function EditStockMovement ({
  movement,
  products,
  currencies,
  providers = [],
  reasons   = [],
}: Props) {
  /* ────────── Form ────────── */
  const { data, setData, processing } = useForm<FormData>({
    product_id   : movement.product_id?.toString() ?? '',
    type         : movement.type,
    quantity     : movement.quantity?.toString() ?? '',
    reference    : movement.reference ?? '',
    provider_id  : movement.provider?.id?.toString() ?? '',
    reason_id    : movement.movement_reason?.id?.toString() ?? '',
    unit_cost    : movement.unit_cost?.toString() ?? '',
    currency_code: movement.currency?.code ?? currencies[0]?.code ?? '',
    notes        : movement.notes ?? '',
    movement_date: movement.movement_date
      ? new Date(movement.movement_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    attachments           : [],
    deleted_attachment_ids : [],
    restored_attachment_ids: [],
  })

  /* ────────── Produit / stock ────────── */
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    products.find(p => p.id === movement.product_id) ?? null,
  )

  /* ────────── Pré-vues nouvelles PJ ────────── */
  const [previews, setPreviews] = useState<string[]>([])
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews])

  /* ────────── PJ existantes ────────── */
  const [existing, setExisting] = useState<Attachment[]>(movement.attachments || [])

  /* ────────── Motifs filtrés ────────── */
  const filteredReasons = useMemo(
    () => reasons.filter(r => r.type === 'all' || r.type === data.type),
    [reasons, data.type],
  )

  /* ----------------------------------------------------------------------
                             HANDLERS
  ---------------------------------------------------------------------- */
  const handleProductChange = (id: string) => {
    setData('product_id', id)
    setSelectedProduct(products.find(p => p.id === id) ?? null)
  }

  const handleQuantity = (raw: string) => {
    const cleaned = raw.replace(/(?!^)-|[^0-9-]/g, '').replace(/^-{2,}/, '-')
    setData('quantity', cleaned)
  }

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files).slice(0, 5)
    setData('attachments', [...data.attachments, ...files])
    setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))])
  }
  const removePreview = (i: number) => {
    setData('attachments', data.attachments.filter((_, idx) => idx !== i))
    setPreviews(previews.filter((_, idx) => idx !== i))
  }

  const toggleExisting = (id: number) => {
    const isDel = data.deleted_attachment_ids.includes(id)
    if (isDel) {
      setData('deleted_attachment_ids',  data.deleted_attachment_ids.filter(i => i !== id))
      setData('restored_attachment_ids', [...data.restored_attachment_ids, id])
      setExisting(a => a.map(att => att.id === id ? { ...att, deleted_at: null } : att))
    } else {
      setData('deleted_attachment_ids',  [...data.deleted_attachment_ids, id])
      setData('restored_attachment_ids', data.restored_attachment_ids.filter(i => i !== id))
      setExisting(a => a.map(att => att.id === id ? { ...att, deleted_at: '1' } : att))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.post(
      route('stock-movements.update', movement.id),
      { ...data, _method: 'PATCH' },
      { forceFormData: true, preserveScroll: true, preserveState: true },
    )
  }

  const qtyPlaceholder = {
    in: 'Quantité à ajouter', out: 'Quantité à retirer', adjustment: '± ajustement',
  }[data.type]

  /* ----------------------------------------------------------------------
                              RENDER
  ---------------------------------------------------------------------- */
  return (
    <>
      {/* CSS inline → masque l’icône native du date-picker */}
      <DateInputStyles />

      <Head title={`Modifier mouvement — ${movement.reference ?? movement.id}`} />

      <div className="relative min-h-screen bg-gradient-to-br
                      from-white via-slate-100 to-slate-200
                      dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749]">
        <ParticlesBackground />

        <AppLayout breadcrumbs={[
          { title: 'Inventaire', href: '/stock-movements' },
          { title: `Mouv. #${movement.id}`, href: route('stock-movements.show', movement.id) },
          { title: 'Modifier' },
        ]}>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center px-6 pt-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-0">
              Modifier le mouvement
            </h1>
            <Link href="/stock-movements">
              <Button variant="ghost"
                      className="bg-muted hover:bg-muted/80 text-slate-700 dark:text-slate-300">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la liste
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-12 gap-6 p-6">

            {/* ---------------- Formulaire ---------------- */}
            <form
              onSubmit={handleSubmit}
              className="col-span-12 lg:col-span-8 xl:col-span-7
                         rounded-xl border border-slate-200 bg-white shadow-xl
                         dark:bg-white/5 dark:border-slate-700 backdrop-blur-md
                         p-8 space-y-8"
            >
              {/* Produit & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="Produit *"
                  value={data.product_id}
                  onChange={handleProductChange}
                  placeholder="Sélectionner un produit"
                  options={products.map(p => ({
                    value: p.id.toString(),
                    label: `${p.sku} — ${p.name}`,
                  }))}
                />
                <SelectField
                  label="Type de mouvement *"
                  value={data.type}
                  onChange={v => setData('type', v as any)}
                  placeholder="Type"
                  options={[
                    { value: 'in',  label: 'Entrée' },
                    { value: 'out', label: 'Sortie' },
                    { value: 'adjustment', label: 'Ajustement' },
                  ]}
                />
              </div>

              {/* Stock actuel */}
              {selectedProduct && (
                <div className="flex items-center gap-2 p-4 rounded-lg text-sm
                                bg-blue-50 border border-blue-200 text-blue-800
                                dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                  <Layers className="w-5 h-5 shrink-0" />
                  Stock actuel : <strong>{selectedProduct.stock_quantity}</strong> unités
                </div>
              )}

              {/* Quantité & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Quantité *"
                  placeholder={qtyPlaceholder}
                  value={data.quantity}
                  onChange={v => handleQuantity(v)}
                />
                <InputDateField
                  label="Date du mouvement *"
                  value={data.movement_date}
                  onChange={v => setData('movement_date', v)}
                />
              </div>

              {/* Fournisseur & Référence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.length > 0 ? (
                  <SelectField
                    label="Fournisseur"
                    value={data.provider_id}
                    onChange={v => setData('provider_id', v === '__empty__' ? '' : v)}
                    placeholder="Sélectionner un fournisseur"
                    options={[
                      ...providers.map(p => ({ value: String(p.id), label: p.name }))
                    ]}
                  />
                ) : (
                  <InputField
                    label="Fournisseur"
                    value={movement.provider?.name ?? '—'}
                    readOnly
                  />
                )}

                <InputField
                  label={<>Référence&nbsp;<small className="text-xs text-gray-400 dark:text-gray-500">(N° du BL)</small></>}
                  value={data.reference}
                  onChange={v => setData('reference', v)}
                />
              </div>

              {/* Motif */}
              {reasons.length > 0 ? (
                <SelectField
                  label="Motif"
                  value={data.reason_id}
                  onChange={v => setData('reason_id', v === '__empty__' ? '' : v)}
                  placeholder="Sélectionner un motif"
                  options={[
                    ...filteredReasons.map(r => ({ value: String(r.id), label: r.name }))
                  ]}
                />
              ) : (
                <InputField
                  label="Motif"
                  value={movement.movement_reason?.name ?? '—'}
                  readOnly
                />
              )}

              {/* Coût / Devise */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label="Coût unitaire"
                  type="number"
                  step="0.01"
                  value={data.unit_cost}
                  onChange={v => setData('unit_cost', v)}
                />
                <SelectField
                  label="Devise"
                  value={data.currency_code}
                  onChange={v => setData('currency_code', v)}
                  placeholder="Devise"
                  options={currencies.map(c => ({
                    value: c.code,
                    label: `${c.symbol} (${c.code})`,
                  }))}
                />
              </div>

              {/* Notes */}
              <TextareaField label="Notes" rows={3}
                             value={data.notes} onChange={v => setData('notes', v)} />

              {/* Upload nouvelles PJ */}
              <label className="cursor-pointer flex flex-col items-center justify-center
                                 py-8 border-2 border-dashed rounded-lg
                                 border-slate-300 dark:border-slate-600
                                 bg-slate-50 dark:bg-slate-800/50
                                 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors">
                <UploadCloud className="h-6 w-6 text-slate-400 mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Cliquez ou déposez vos fichiers ici (max. 5)
                </p>
                <input type="file" multiple className="hidden" onChange={addFiles}
                       accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" />
              </label>

              {/* Pré-vues nouvelles PJ */}
              {previews.length > 0 && (
                <motion.ul layout className="space-y-1 text-sm">
                  {previews.map((_, i) => (
                    <motion.li key={i} className="flex items-center gap-2 truncate">
                      <span className="flex-1 text-slate-600 dark:text-slate-300 truncate">
                        {data.attachments[i]?.name}
                      </span>
                      <Button size="icon" variant="ghost"
                              onClick={() => removePreview(i)}
                              className="text-red-600 hover:bg-red-600/10">
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.li>
                  ))}
                </motion.ul>
              )}

              {/* PJ existantes */}
              {existing.length > 0 && (
                <>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                    Pièces jointes existantes
                  </h3>
                  <motion.ul layout className="space-y-1 text-sm">
                    {existing.map(att => {
                      const isDel = !!att.deleted_at
                      return (
                        <motion.li key={att.id}
                                   className={`flex items-center gap-2 p-2 rounded border truncate ${
                                     isDel
                                       ? 'opacity-60 border-red-400'
                                       : 'border-slate-200 dark:border-slate-600'
                                   }`}>
                          <span className="flex-1 truncate text-slate-600 dark:text-slate-300">{att.filename}</span>
                          <Button size="icon" variant="ghost" onClick={() => toggleExisting(att.id)}
                                  className={isDel
                                    ? 'text-green-600 hover:bg-green-600/10'
                                    : 'text-red-600 hover:bg-red-600/10'}>
                            {isDel ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                          <a href={`/storage/${att.path}`} target="_blank" rel="noopener noreferrer"
                             className="text-xs underline text-slate-500 dark:text-slate-400">Ouvrir</a>
                        </motion.li>
                      )
                    })}
                  </motion.ul>
                </>
              )}

              {/* Actions */}
              <div className="flex justify-between pt-4">
                <Button variant="secondary" type="button" onClick={() => history.back()}>
                  Annuler
                </Button>
                <Button type="submit" disabled={processing}
                        className="relative flex items-center justify-center
                                   rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-6 py-3
                                   text-sm font-semibold text-white shadow-md
                                   hover:from-red-500 hover:to-red-600 focus:ring-2 focus:ring-red-500">
                  {processing
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    : <Save className="w-4 h-4 mr-2" />}
                  {processing ? 'Mise à jour…' : 'Mettre à jour'}
                </Button>
              </div>
            </form>

            {/* ---------------- Aside ---------------- */}
            <aside className="col-span-12 lg:col-span-4 xl:col-span-5
                               rounded-xl border border-slate-200 bg-white shadow-xl
                               dark:bg-white/5 dark:border-slate-700 backdrop-blur-md
                               p-8 space-y-6">
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                Guide d'édition
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Modifiez les champs puis cliquez sur <em>Mettre à&nbsp;jour</em>.
              </p>

              <h3 className="font-medium text-slate-900 dark:text-white">
                Astuce quantité
              </h3>
              <div className="flex items-center gap-2 p-4 rounded-lg text-sm
                              bg-blue-50 border border-blue-200 text-blue-800
                              dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                <Info className="w-5 h-5 shrink-0" />
                Pour un ajustement, utilisez des valeurs négatives ou positives
                (ex&nbsp;: <code className="px-1 rounded bg-slate-200 dark:bg-slate-700">-3</code>).
              </div>
            </aside>

          </div>
        </AppLayout>
      </div>
    </>
  )
}

/* --------------------------------------------------------------------------
   SUB-COMPONENTS
   -------------------------------------------------------------------------- */
const Label = ({ children }:{ children:ReactNode }) => (
  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
    {children}
  </label>
)

/* -------- Input texte/générique ---------- */
const InputField = ({
  label, value, onChange,
  type = 'text', placeholder = '', step, readOnly = false,
}: {
  label:ReactNode; value:string; onChange:(v:string)=>void
  type?:string; placeholder?:string; step?:string; readOnly?:boolean
}) => (
  <div>
    <Label>{label}</Label>
    <Input
      type={type} placeholder={placeholder} step={step}
      readOnly={readOnly}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full bg-white dark:bg-slate-800
                  border border-slate-300 dark:border-slate-600
                  text-slate-900 dark:text-white
                  ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
    />
  </div>
)

/* -------- Input date (icône custom) ---------- */
const InputDateField = ({
  label, value, onChange,
}:{
  label:ReactNode; value:string; onChange:(v:string)=>void
}) => {
  const ref = useRef<HTMLInputElement>(null)

  const openPicker = () => {
    if (ref.current) {
      // Chromium
      // @ts-ignore
      if (typeof ref.current.showPicker === 'function') ref.current.showPicker()
      else ref.current.focus()
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          ref={ref}
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pr-10 bg-white dark:bg-slate-800
                     border border-slate-300 dark:border-slate-600
                     text-slate-900 dark:text-white"
        />
        <button
          type="button"
          onClick={openPicker}
          className="absolute right-3 top-1/2 -translate-y-1/2
                     text-slate-400 hover:text-slate-600
                     dark:text-slate-500 dark:hover:text-slate-300"
        >
          <Calendar className="w-4 h-4 pointer-events-none" />
        </button>
      </div>
    </div>
  )
}

/* -------- Select générique ---------- */
const SelectField = ({
  label, value, onChange, placeholder, options,
}: {
  label:ReactNode; value:string; onChange:(v:string)=>void
  placeholder:string; options:{value:string;label:string}[]
}) => (
  <div>
    <Label>{label}</Label>
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-white dark:bg-slate-800
                                border border-slate-300 dark:border-slate-600
                                text-slate-900 dark:text-white">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-60 overflow-y-auto">
        <SelectItem value="__empty__" className="text-slate-500 italic">
          {placeholder}
        </SelectItem>
        {options.map(o => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

/* -------- Textarea ---------- */
const TextareaField = ({
  label, value, onChange, rows = 3,
}:{
  label:string; value:string; onChange:(v:string)=>void; rows?:number
}) => (
  <div>
    <Label>{label}</Label>
    <Textarea
      rows={rows} value={value} onChange={e=>onChange(e.target.value)}
      className="w-full bg-white dark:bg-slate-800
                 border border-slate-300 dark:border-slate-600
                 text-slate-900 dark:text-white"
    />
  </div>
)
