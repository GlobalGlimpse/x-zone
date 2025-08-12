/* ------------------------------------------------------------------ */
/* resources/js/Pages/Quotes/Edit.tsx                                 */
/* ------------------------------------------------------------------ */

import React, { useState, useMemo, useRef } from 'react'
import {
  Building2, Package2 as Package, FileText, Check,
  Plus, Trash2, Save, ArrowLeft, Edit3, Calendar,
  AlertTriangle, Percent,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
interface Client   { id:number; company_name:string }
interface Currency { code:string; symbol:string; name:string }
interface Product  { id:string; name:string; sku:string; price:number;
                     tax_rate?:{ rate:number } }

interface QuoteItemForm {
  product_id   : string
  quantity     : number
  unit_price_ht: number
  tax_rate     : number
}

interface QuoteProp {
  id:number; quote_number:string; status:string;
  client_id:number; quote_date:string; valid_until:string; currency_code:string;
  terms_conditions?:string; notes?:string; internal_notes?:string;
  items:Array<{
    product_id:string; quantity:number;
    unit_price_ht_snapshot:number; tax_rate_snapshot:number;
  }>
}

interface Props {
  quote      : QuoteProp
  clients    : Client[]
  products   : Product[]
  currencies : Currency[]
}

interface FormData {
  client_id       : string
  currency_code   : string
  quote_date      : string
  valid_until     : string
  terms_conditions: string
  notes           : string
  internal_notes  : string
  items           : QuoteItemForm[]
}

interface FormErrors {
  [key: string]: string | undefined
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const iso = (d:string) => new Date(d).toISOString().slice(0,10)

// Mock functions
const mockUseForm = (initialData: FormData) => {
  const [data, setDataState] = useState<FormData>(initialData)
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const setData = (key: keyof FormData | FormData, value?: any) => {
    if (typeof key === 'object') {
      setDataState(key)
    } else {
      setDataState(prev => ({ ...prev, [key]: value }))
    }
  }

  const patch = (url: string, options?: any) => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      if (options?.onSuccess) options.onSuccess()
    }, 1000)
  }

  return { data, setData, patch, processing, errors }
}

const mockToast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.log('Error:', message),
}

const mockRoute = (name: string, params?: any) => `/${name.replace('.', '/')}${params ? `/${params}` : ''}`

/* ------------------------------------------------------------------ */
/* UI Components                                                      */
/* ------------------------------------------------------------------ */
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'default',
  size = 'default',
  disabled = false,
  className = '',
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'icon'
  disabled?: boolean
  className?: string
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700',
    ghost: 'hover:bg-gray-100 dark:hover:bg-slate-800'
  }

  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    icon: 'h-10 w-10'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

const Input = ({
  className = '',
  type = 'text',
  value,
  onChange,
  ...props
}: {
  className?: string
  type?: string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    className={`flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 dark:placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)

const Textarea = ({
  className = '',
  rows = 3,
  value,
  onChange,
  ...props
}: {
  className?: string
  rows?: number
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    rows={rows}
    value={value}
    onChange={onChange}
    className={`flex min-h-[80px] w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 dark:placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)

const Select = ({
  children,
  value,
  onValueChange
}: {
  children: React.ReactNode
  value: string
  onValueChange: (value: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            setIsOpen,
            selectedValue: value,
            onSelect: onValueChange
          })
        }
        return child
      })}
    </div>
  )
}

const SelectTrigger = ({
  children,
  className = '',
  isOpen,
  setIsOpen
}: {
  children: React.ReactNode
  className?: string
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
}) => (
  <button
    type="button"
    onClick={() => setIsOpen?.(!isOpen)}
    className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
)

const SelectValue = ({
  placeholder,
  selectedValue,
  options
}: {
  placeholder?: string
  selectedValue?: string
  options?: Array<{value: string, label: string}>
}) => (
  <span>{selectedValue && options ? options.find(o => o.value === selectedValue)?.label || placeholder : placeholder}</span>
)

const SelectContent = ({
  children,
  className = '',
  isOpen,
  maxHeight = 'max-h-72'
}: {
  children: React.ReactNode
  className?: string
  isOpen?: boolean
  maxHeight?: string
}) => (
  isOpen ? (
    <div className={`absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-lg ${maxHeight} overflow-auto ${className}`}>
      {children}
    </div>
  ) : null
)

const SelectItem = ({
  children,
  value,
  onSelect
}: {
  children: React.ReactNode
  value: string
  onSelect?: (value: string) => void
}) => (
  <div
    onClick={() => onSelect?.(value)}
    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
  >
    {children}
  </div>
)

/* ------------------------------------------------------------------ */
/* Page component                                                     */
/* ------------------------------------------------------------------ */
export default function QuotesEdit({ quote, clients, products, currencies }: Props) {

  /* ---------- items ---------- */
  const initialItems: QuoteItemForm[] = quote.items.map(it => ({
    product_id   : it.product_id,
    quantity     : it.quantity,
    unit_price_ht: it.unit_price_ht_snapshot,
    tax_rate     : it.tax_rate_snapshot,
  }))
  const [items, setItems] = useState<QuoteItemForm[]>(initialItems)

  /* ---------- form ---------- */
  const { data, setData, patch, processing, errors } = mockUseForm({
    client_id       : String(quote.client_id),
    currency_code   : quote.currency_code,
    quote_date      : iso(quote.quote_date),
    valid_until     : iso(quote.valid_until),
    terms_conditions: quote.terms_conditions ?? '',
    notes           : quote.notes ?? '',
    internal_notes  : quote.internal_notes ?? '',
    items           : initialItems,
  })

  /* ---------- CRUD items ---------- */
  const addItem = () => {
    const arr = [...items, {product_id:'', quantity:1, unit_price_ht:0, tax_rate:0}]
    setItems(arr)
    setData('items', arr)
  }

  const removeItem = (i: number) => {
    const arr = [...items]
    arr.splice(i, 1)
    setItems(arr)
    setData('items', arr)
  }

  const updateItem = (i: number, f: keyof QuoteItemForm, v: any) => {
    const arr = [...items]
    if (f === 'product_id') {
      arr[i].product_id = v
      const p = products.find(p => p.id === v)
      if (p) {
        arr[i].unit_price_ht = p.price
        arr[i].tax_rate = p.tax_rate?.rate ?? 0
      }
    } else if (f === 'quantity') {
      arr[i].quantity = Number(v) || 1
    } else if (f === 'unit_price_ht') {
      arr[i].unit_price_ht = Number(v) || 0
    } else if (f === 'tax_rate') {
      arr[i].tax_rate = Number(v) || 0
    }
    setItems(arr)
    setData('items', arr)
  }

  /* ---------- totals ---------- */
  const totals = useMemo(() => {
    let sub = 0, tva = 0
    items.forEach(it => {
      const ht = it.quantity * it.unit_price_ht
      sub += ht
      tva += ht * it.tax_rate / 100
    })
    return {sub, tva, ttc: sub + tva}
  }, [items])

  const cur = currencies.find(c => c.code === data.currency_code)
  const fmt = (n: number) => `${n.toLocaleString('fr-FR', {minimumFractionDigits: 2})} ${cur?.symbol ?? data.currency_code}`

  /* ---------- steps ---------- */
  const step1 = !!data.client_id
  const step2 = items.length > 0 && items.every(it => it.product_id && it.quantity > 0)
  const step3 = step2
  const steps = [
    {id: 1, title: 'Informations générales', icon: Building2, complete: step1, active: true },
    {id: 2, title: 'Articles',               icon: Package,    complete: step2, active: step1},
    {id: 3, title: 'Notes et finalisation',   icon: FileText,   complete: step3, active: step2},
  ]

  /* ---------- submit ---------- */
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!step2) {
      mockToast.error('Ajoutez au moins un article')
      return
    }
    patch(mockRoute('quotes.update', quote.id), {
      onSuccess: () => mockToast.success('Devis mis à jour'),
      onError  : () => mockToast.error('Erreur lors de la mise à jour'),
    })
  }

  /* ---------------------------------------------------------------- */
  /* Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-slate-100 to-slate-200 dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749]">

      <HeaderEdit steps={steps} quoteNumber={quote.quote_number}/>

      {quote.status !== 'draft' && <AlertNonDraft/>}

      <form onSubmit={submit} className="p-6 space-y-8">

        {/* ---------------- étape 1 ---------------- */}
        <StepCard title="Informations générales" icon={Building2} complete={step1}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <SelectBlock
              label="Client *"
              value={data.client_id}
              onChange={v => setData('client_id', v)}
              options={clients.map(c => ({value: String(c.id), label: c.company_name}))}
              error={errors.client_id}
            />
            <SelectBlock
              label="Devise"
              value={data.currency_code}
              onChange={v => setData('currency_code', v)}
              options={currencies.map(c => ({value: c.code, label: `${c.name} (${c.symbol})`}))}
            />
            <DateInputField
              label="Date du devis *"
              value={data.quote_date}
              onChange={v => setData('quote_date', v)}
              error={errors.quote_date}
            />
            <DateInputField
              label="Valide jusqu'au *"
              value={data.valid_until}
              onChange={v => setData('valid_until', v)}
              error={errors.valid_until}
            />
          </div>
        </StepCard>

        {/* ---------------- étape 2 ---------------- */}
        <StepCard
          title="Articles"
          icon={Package}
          complete={step2}
          disabled={!step1}
          actions={
            <Button variant="outline" onClick={addItem} disabled={!step1}>
              <Plus className="w-4 h-4 mr-1"/>Ajouter
            </Button>
          }
        >
          {!step1 && <Empty msg="Complétez d'abord les informations générales"/>}
          {step1 && items.length === 0 && <Empty msg="Aucun article."/>}

          {step1 && items.length > 0 && (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-[#0a0420] text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3 text-left">Produit</th>
                    <th className="px-4 py-3 text-center w-24">Qté</th>
                    <th className="px-4 py-3 text-center w-36">PU HT</th>
                    <th className="px-4 py-3 text-center w-28">TVA %</th>
                    <th className="px-4 py-3 text-right w-40">Total HT</th>
                    <th className="w-10"/>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {items.map((it, idx) => {
                    const lineHT = it.quantity * it.unit_price_ht
                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#0a0420]/60">
                        {/* produit */}
                        <td className="px-4 py-2">
                          <Select value={it.product_id} onValueChange={v => updateItem(idx, 'product_id', v)}>
                            <SelectTrigger className="h-9 w-full bg-transparent border-0 px-0 focus:ring-0">
                              <SelectValue placeholder="Sélectionner…"/>
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {products.map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name} <span className="text-xs text-slate-500">({p.sku})</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        {/* qt */}
                        <td className="px-4 py-2 text-center">
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={it.quantity}
                            onChange={e => updateItem(idx, 'quantity', e.target.value)}
                            className="text-center bg-transparent border-0 focus:bg-white dark:focus:bg-[#0a0420]"
                          />
                        </td>

                        {/* pu */}
                        <td className="px-4 py-2 text-center">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={it.unit_price_ht}
                            onChange={e => updateItem(idx, 'unit_price_ht', e.target.value)}
                            className="text-center bg-transparent border-0 focus:bg-white dark:focus:bg-[#0a0420]"
                          />
                        </td>

                        {/* tva */}
                        <td className="px-4 py-2 text-center">
                          <div className="relative">
                            <Input
                              readOnly
                              value={it.tax_rate}
                              className="bg-slate-100 dark:bg-[#0a0420]/60 border-0 text-center pr-6 cursor-not-allowed"
                            />
                            <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500"/>
                          </div>
                        </td>

                        {/* total */}
                        <td className="px-4 py-2 text-right font-medium">{fmt(lineHT)}</td>

                        {/* delete */}
                        <td className="px-2 py-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(idx)}
                            className="hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4 text-red-600"/>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {items.length > 0 && <TotalsBox totals={totals} fmt={fmt}/>}
        </StepCard>

        {/* ---------------- étape 3 ---------------- */}
        <StepCard title="Notes et finalisation" icon={FileText} complete={step3} disabled={!step2}>
          {!step2 && <Empty msg="Ajoutez d'abord des articles"/>}
          {step2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TextareaBlock
                label="Conditions générales"
                value={data.terms_conditions}
                onChange={v => setData('terms_conditions', v)}
              />
              <TextareaBlock
                label="Notes client"
                value={data.notes}
                onChange={v => setData('notes', v)}
              />
              <TextareaBlock
                label="Notes internes"
                value={data.internal_notes}
                onChange={v => setData('internal_notes', v)}
              />
            </div>
          )}
        </StepCard>

        <div className="flex justify-between pt-4">
          <Button variant="ghost" type="button" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2"/> Annuler
          </Button>
          <Button type="submit" disabled={processing || !step2}>
            <Save className="w-4 h-4 mr-2"/> {processing ? 'Mise à jour…' : 'Mettre à jour'}
          </Button>
        </div>

      </form>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sous-composants réutilisés                                         */
/* ------------------------------------------------------------------ */
const HeaderEdit = ({steps, quoteNumber}: {steps: any[]; quoteNumber: string}) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between px-6 pt-6 mb-6">
    <div className="flex items-center gap-3">
      <Button variant="outline" size="icon" onClick={() => window.history.back()}>
        <ArrowLeft className="w-4 h-4"/>
      </Button>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Edit3 className="w-6 h-6 text-red-600"/> Modifier le devis {quoteNumber}
      </h1>
    </div>
    <div className="mt-4 md:mt-0 hidden md:flex">
      <StepProgress steps={steps}/>
    </div>
  </div>
)

const StepProgress = ({steps}: {steps: any[]}) => (
  <div className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 rounded-full px-4 py-2">
    {steps.map((s, i) => (
      <React.Fragment key={s.id}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 flex items-center justify-center rounded-full
            ${s.complete ? 'bg-green-500 text-white'
                        : s.active   ? 'bg-red-500 text-white'
                                     : 'bg-slate-600 text-slate-400'}`}>
            {s.complete ? <Check className="w-4 h-4"/> : <s.icon className="w-4 h-4"/>}
          </div>
          <span className={`${s.complete ? 'text-green-400'
                           : s.active   ? 'text-white'
                                        : 'text-slate-400'} text-sm font-medium`}>
            {s.title}
          </span>
        </div>
        {i < steps.length - 1 && <div className={`w-8 h-0.5 ${steps[i + 1].active ? 'bg-green-400' : 'bg-slate-600'}`}/>}
      </React.Fragment>
    ))}
  </div>
)

const AlertNonDraft = () => (
  <div className="mx-6 mb-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
    <div className="flex items-center gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400"/>
      <div>
        <div className="font-medium text-amber-900 dark:text-amber-100">
          Attention : ce devis n'est plus en brouillon
        </div>
        <div className="text-sm text-amber-700 dark:text-amber-300">
          Les modifications affecteront l'historique et la cohérence des données.
        </div>
      </div>
    </div>
  </div>
)

const StepCard = ({title, icon: Icon, complete, disabled = false, children, actions}: {
  title: string;
  icon: any;
  complete: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode
}) => (
  <div className={`bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700
                   rounded-xl shadow-xl p-6 backdrop-blur-md ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <span className={`w-6 h-6 flex items-center justify-center rounded-full
          ${complete ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {complete ? <Check className="w-4 h-4"/> : <Icon className="w-4 h-4"/>}
        </span>
        {title}
      </h2>
      {actions}
    </div>
    {children}
  </div>
)

const Empty = ({msg}: {msg: string}) => (
  <p className="text-center py-6 text-slate-500 dark:text-slate-400">{msg}</p>
)

const Label = ({children}: {children: React.ReactNode}) => (
  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
    {children}
  </label>
)

function SelectBlock({label, value, onChange, options, error}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: {value: string; label: string}[];
  error?: string
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner…"/>
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function DateInputField({label, value, onChange, error}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          ref={ref}
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0
                     [&::-webkit-calendar-picker-indicator]:absolute
                     [&::-webkit-calendar-picker-indicator]:right-2
                     [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
        <Calendar
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 cursor-pointer"
          onClick={() => ref.current?.showPicker?.()}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function TextareaBlock({label, value, onChange}: {
  label: string;
  value: string;
  onChange: (v: string) => void
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Textarea
        rows={4}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

function TotalsBox({totals, fmt}: {
  totals: {sub: number; tva: number; ttc: number};
  fmt: (n: number) => string
}) {
  return (
    <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
      <div className="flex justify-end">
        <div className="w-full max-w-sm space-y-2">
          <TotalRow label="Sous-total HT :" value={fmt(totals.sub)}/>
          <TotalRow label="TVA :" value={fmt(totals.tva)}/>
          <TotalRow label="Total TTC :" value={fmt(totals.ttc)} bold/>
        </div>
      </div>
    </div>
  )
}

const TotalRow = ({label, value, bold = false}: {
  label: string;
  value: string;
  bold?: boolean
}) => (
  <div className={`flex justify-between ${bold ? 'text-lg font-bold border-t border-slate-200 dark:border-slate-700 pt-2' : ''}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
)
