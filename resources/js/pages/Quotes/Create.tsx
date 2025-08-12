/* ------------------------------------------------------------------ */
/* resources/js/Pages/Quotes/Create.tsx                               */
/* ------------------------------------------------------------------ */
/* Page : création (ou duplication) d’un devis                        */
/* ------------------------------------------------------------------ */

import React, { useMemo, useRef } from 'react'
import { Head, useForm }          from '@inertiajs/react'
import { route }                  from 'ziggy-js'
import {
  Building2, CreditCard, Calendar, FileText,
  Package2 as Package, Plus, Trash2, ArrowLeft,
  Loader2, Percent, Check,
} from 'lucide-react'
import toast                      from 'react-hot-toast'

import AppLayout           from '@/layouts/app-layout'
import ParticlesBackground from '@/components/ParticlesBackground'
import { Button }          from '@/components/ui/button'
import { Input }           from '@/components/ui/input'
import { Textarea }        from '@/components/ui/textarea'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import type { FormDataConvertible } from '@inertiajs/core'

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
interface Client   { id:number; company_name:string; contact_name?:string }
interface Currency { code:string; symbol:string; name:string }
interface Product  { id:string; name:string; sku:string; price:number;
                     tax_rate?:{ rate:number } }

interface QuoteItem {
  product_id   : string
  quantity     : number
  unit_price_ht: number
  tax_rate     : number
  [key:string] : FormDataConvertible
}

interface DuplicateData {
  client_id:number; currency_code:string; quote_date:string; valid_until:string;
  terms_conditions?:string; notes?:string; internal_notes?:string;
  items:QuoteItem[]
}

interface Props {
  clients        : Client[]
  products       : Product[]
  currencies     : Currency[]
  duplicateQuote?: DuplicateData|null
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const normalizeDuplicateItems = (items: QuoteItem[]): QuoteItem[] =>
  items.map(it => ({
    product_id   : String(it.product_id),
    quantity     : Number(it.quantity)      || 1,
    unit_price_ht: Number((it as any).unit_price_ht ?? (it as any).unit_price_ht_snapshot ?? 0),
    tax_rate     : Number((it as any).tax_rate      ?? (it as any).tax_rate_snapshot      ?? 0),
  }))

/* ------------------------------------------------------------------ */
/* Page component                                                     */
/* ------------------------------------------------------------------ */
export default function CreateQuote({
  clients, products, currencies, duplicateQuote = null,
}: Props) {

  /* ---------------------- Inertia form ---------------------- */
  const { data, setData, post, processing, errors, reset } = useForm({
    /* Informations générales */
    client_id       : duplicateQuote?.client_id?.toString() ?? '',
    currency_code   : duplicateQuote?.currency_code ?? currencies[0]?.code ?? 'MAD',
    quote_date      : duplicateQuote?.quote_date ??
                      new Date().toISOString().slice(0,10),
    valid_until     : duplicateQuote?.valid_until ??
                      new Date(Date.now()+30*24*60*60*1000).toISOString().slice(0,10),

    /* Notes */
    terms_conditions: duplicateQuote?.terms_conditions ?? '',
    notes           : duplicateQuote?.notes ?? '',
    internal_notes  : duplicateQuote?.internal_notes ?? '',

    /* Articles */
    items: duplicateQuote?.items
           ? normalizeDuplicateItems(duplicateQuote.items)
           : ([] as QuoteItem[]),
  })

  /* ------------------------- Helpers ------------------------ */
  const fmt = (n:number)=>{
    const sym = currencies.find(c=>c.code===data.currency_code)?.symbol
                ?? data.currency_code
    return `${n.toLocaleString('fr-FR',{minimumFractionDigits:2})} ${sym}`
  }

  const addItem = () =>
    setData('items', [...data.items,
      { product_id:'', quantity:1, unit_price_ht:0, tax_rate:0 }])

  const removeItem = (idx:number)=>{
    const arr=[...data.items]; arr.splice(idx,1); setData('items',arr)
  }

  const updateItem = (idx:number, field:keyof QuoteItem, value:any)=>{
    const arr=[...data.items]

    switch(field){
      case 'product_id':{
        arr[idx].product_id = value
        const p = products.find(p=>p.id===value)
        if (p) {
          arr[idx].unit_price_ht = p.price
          arr[idx].tax_rate      = p.tax_rate?.rate ?? 0
        }
        break
      }
      case 'quantity':
        arr[idx].quantity = Number(value) || 1
        break
      case 'unit_price_ht':
        arr[idx].unit_price_ht = Number(value) || 0
        break
      default:
        (arr[idx] as any)[field] = value
    }

    setData('items', arr)
  }

  /* --------------------- Totaux dynamiques ------------------ */
  const totals = useMemo(()=>{
    let sub=0, tva=0
    data.items.forEach(it=>{
      const ht  = Number(it.quantity) * Number(it.unit_price_ht)
      sub += ht
      tva += ht * Number(it.tax_rate) / 100
    })
    return { sub, tva, ttc: sub+tva }
  },[data.items])

  /* -------------------- Étapes visuelles -------------------- */
  const step1 = !!data.client_id
  const step2 = data.items.length>0 && data.items.every(it=>it.product_id && it.quantity>0)
  const step3 = step2
  const steps = [
    {id:1,title:'Informations générales',icon:Building2,complete:step1,active:true},
    {id:2,title:'Articles',              icon:Package,   complete:step2,active:step1},
    {id:3,title:'Notes et finalisation', icon:FileText,  complete:step3,active:step2},
  ]

  /* ------------------------ Submit -------------------------- */
  const submit = (e:React.FormEvent) =>{
    e.preventDefault()

    if(!data.items.length){
      toast.error('Ajoutez au moins un article.')
      return
    }

    post(route('quotes.store'),{
      onSuccess:()=>{ toast.success('Devis créé.'); reset() },
      onError  :()=> toast.error('Erreur lors de la création.'),
    })
  }

  /* ------------------------- Render ------------------------- */
  return (
    <>
      <Head title="Créer un devis" />

      <div className="relative min-h-screen bg-gradient-to-br
                      from-white via-slate-100 to-slate-200
                      dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749]">
        <ParticlesBackground />

        <AppLayout breadcrumbs={[
          {title:'Devis',href:'/quotes'},
          {title:'Créer',href:''},
        ]}>
          <HeaderCreate steps={steps} />

          <div className="grid grid-cols-12 gap-6 p-6">
            <div className="col-span-12">
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl
                              dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-8">

                {/*                   Erreurs                     */}
                {Object.keys(errors).length>0 && (
                  <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20
                                  text-red-700 dark:text-red-300 rounded-lg
                                  border border-red-200 dark:border-red-800">
                    <strong>Veuillez corriger :</strong>
                    <ul className="list-disc list-inside mt-2 text-sm">
                      {Object.entries(errors).map(([k,m])=> <li key={k}>{m}</li>)}
                    </ul>
                  </div>
                )}

                {/*                   Formulaire                   */}
                <form onSubmit={submit} className="space-y-8">

                  {/* -------- Informations générales -------- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <SelectBlock
                      label="Client *" Icon={Building2}
                      value={data.client_id}
                      onChange={v=>setData('client_id',v)}
                      options={clients.map(c=>({value:String(c.id),label:c.company_name}))}
                      error={errors.client_id}
                    />
                    <SelectBlock
                      label="Devise" Icon={CreditCard}
                      value={data.currency_code}
                      onChange={v=>setData('currency_code',v)}
                      options={currencies.map(c=>({value:c.code,label:`${c.name} (${c.symbol})`}))}
                    />
                    <DateInputField
                      label="Date du devis *"
                      value={data.quote_date}
                      onChange={v=>setData('quote_date',v)}
                      error={errors.quote_date}
                    />
                    <DateInputField
                      label="Valide jusqu'au *"
                      value={data.valid_until}
                      onChange={v=>setData('valid_until',v)}
                      error={errors.valid_until}
                    />
                  </div>

                  {/* ---------------- Articles ---------------- */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-red-600"/> Articles ({data.items.length})
                      </h2>
                      <Button type="button" onClick={addItem}>
                        <Plus className="w-4 h-4 mr-1"/> Ajouter
                      </Button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-[#0a0420] text-slate-600 dark:text-slate-300">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">Produit</th>
                            <th className="px-4 py-3 text-center font-medium w-28">Qté</th>
                            <th className="px-4 py-3 text-center font-medium w-40">PU HT</th>
                            <th className="px-4 py-3 text-center font-medium w-32">TVA %</th>
                            <th className="px-4 py-3 text-right font-medium w-36">Total HT</th>
                            <th className="px-2 py-3 w-10"/>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {data.items.length===0 && (
                            <tr>
                              <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                                Aucun article ajouté.
                              </td>
                            </tr>
                          )}

                          {data.items.map((it,i)=>{
                            const htLine = it.quantity * it.unit_price_ht
                            return (
                              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#0a0420]/60">
                                {/* Produit */}
                                <td className="px-4 py-2">
                                  <Select value={it.product_id} onValueChange={v=>updateItem(i,'product_id',v)}>
                                    <SelectTrigger className="h-9 w-full bg-transparent border-0 px-0 focus:ring-0">
                                      <SelectValue placeholder="Sélectionner…"/>
                                    </SelectTrigger>
                                    <SelectContent className="max-h-72">
                                      {products.map(p=>(
                                        <SelectItem key={p.id} value={p.id}>
                                          <div className="flex flex-col">
                                            <span className="font-medium">{p.name}</span>
                                            <span className="text-xs text-slate-500">SKU : {p.sku}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>

                                {/* Qté */}
                                <td className="px-4 py-2 text-center">
                                  <Input type="number" min="1" step="1"
                                         value={it.quantity}
                                         onChange={e=>updateItem(i,'quantity',e.target.value)}
                                         className="text-center bg-transparent border-0 focus:bg-white dark:focus:bg-[#0a0420]"/>
                                </td>

                                {/* PU HT */}
                                <td className="px-4 py-2 text-center">
                                  <Input type="number" min="0" step="0.01"
                                         value={it.unit_price_ht}
                                         onChange={e=>updateItem(i,'unit_price_ht',e.target.value)}
                                         className="text-center bg-transparent border-0 focus:bg-white dark:focus:bg-[#0a0420]"/>
                                </td>

                                {/* TVA */}
                                <td className="px-4 py-2 text-center">
                                  <div className="relative">
                                    <Input readOnly value={it.tax_rate}
                                           className="text-center bg-slate-100 dark:bg-[#0a0420]/60 border-0 cursor-not-allowed pr-6"/>
                                    <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500"/>
                                  </div>
                                </td>

                                {/* Total HT */}
                                <td className="px-4 py-2 text-right font-medium">{fmt(htLine)}</td>

                                {/* Delete */}
                                <td className="px-2 py-2 text-center">
                                  <Button variant="ghost" size="icon" onClick={()=>removeItem(i)}
                                          className="hover:bg-red-50 dark:hover:bg-red-900/20">
                                    <Trash2 className="w-4 h-4 text-red-600"/>
                                  </Button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Totaux */}
                    {data.items.length>0 && (
                      <TotalsBox totals={totals} fmt={fmt}/>
                    )}
                  </div>

                  {/* ---------------- Notes ---------------- */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <TextareaBlock
                      label="Conditions générales"
                      value={data.terms_conditions}
                      onChange={v=>setData('terms_conditions',v)}
                      error={errors.terms_conditions}
                    />
                    <TextareaBlock
                      label="Notes client"
                      value={data.notes}
                      onChange={v=>setData('notes',v)}
                      error={errors.notes}
                    />
                    <TextareaBlock
                      label="Notes internes"
                      value={data.internal_notes}
                      onChange={v=>setData('internal_notes',v)}
                      error={errors.internal_notes}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between pt-6">
                    <Button variant="ghost" onClick={()=>window.history.back()}>
                      <ArrowLeft className="w-4 h-4 mr-2"/> Annuler
                    </Button>
                    <Button type="submit" disabled={processing || !step2}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r
                                       from-red-600 to-red-500 hover:from-red-500 hover:to-red-600
                                       text-white px-6 py-3 shadow-md">
                      {processing
                        ? <Loader2 className="w-4 h-4 animate-spin"/>
                        : <FileText className="w-4 h-4"/>}
                      {processing ? 'Création…' : 'Créer le devis'}
                    </Button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </AppLayout>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Sous-composants                                                    */
/* ------------------------------------------------------------------ */
const HeaderCreate = ({steps}:{steps:any[]})=>(
  <div className="flex flex-col md:flex-row md:items-center md:justify-between px-6 pt-6 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <FileText className="w-6 h-6 text-red-600"/> Créer un devis
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Remplissez tous les champs nécessaires
      </p>
    </div>
    <div className="mt-4 md:mt-0 hidden md:flex">
      <StepProgress steps={steps}/>
    </div>
  </div>
)

const StepProgress = ({steps}:{steps:any[]})=>(
  <div className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 rounded-full px-4 py-2">
    {steps.map((s,i)=>(
      <React.Fragment key={s.id}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
            s.complete ? 'bg-green-500 text-white'
                        : s.active   ? 'bg-red-500 text-white'
                                     : 'bg-slate-600 text-slate-400'}`}>
            {s.complete ? <Check className="w-4 h-4"/> : <s.icon className="w-4 h-4"/>}
          </div>
          <span className={`text-sm font-medium ${
            s.complete ? 'text-green-400'
                        : s.active   ? 'text-white'
                                     : 'text-slate-400'}`}>
            {s.title}
          </span>
        </div>
        {i<steps.length-1 &&
          <div className={`w-8 h-0.5 ${steps[i+1].active ? 'bg-green-400' : 'bg-slate-600'}`}/> }
      </React.Fragment>
    ))}
  </div>
)

const Label = ({children}:{children:React.ReactNode})=>(
  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
    {children}
  </label>
)

function SelectBlock({label,Icon,value,onChange,options,error}:{
  label:string; Icon:any; value:string; onChange:(v:string)=>void;
  options:{value:string;label:string}[]; error?:string|false
}){
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"/>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger
            className={`pl-10 bg-white dark:bg-[#0a0420] border-slate-300 dark:border-white/10
                        text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500
                        ${error ? 'border-red-500 text-red-500' : ''}`}>
            <SelectValue placeholder="Sélectionner…"/>
          </SelectTrigger>
          <SelectContent>
            {options.map(o=> <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function DateInputField({label,value,onChange,error}:{
  label:string; value:string; onChange:(v:string)=>void; error?:string|false
}){
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          ref={ref}
          type="date"
          value={value}
          onChange={e=>onChange(e.target.value)}
          className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0
                     [&::-webkit-calendar-picker-indicator]:absolute
                     [&::-webkit-calendar-picker-indicator]:right-2
                     [&::-webkit-calendar-picker-indicator]:h-6
                     [&::-webkit-calendar-picker-indicator]:w-6
                     [&::-webkit-calendar-picker-indicator]:cursor-pointer"/>
        <Calendar
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 cursor-pointer"
          onClick={()=>ref.current?.showPicker?.()}/>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function TextareaBlock({label,value,onChange,error}:{
  label:string; value:string; onChange:(v:string)=>void; error?:string|false
}){
  return (
    <div>
      <Label>{label}</Label>
      <Textarea rows={4} value={value} onChange={e=>onChange(e.target.value)}
        className={`resize-none bg-white dark:bg-[#0a0420] border-slate-300 dark:border-white/10
                    text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500
                    ${error ? 'border-red-500 text-red-500' : ''}`}/>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function TotalsBox({totals,fmt}:{totals:{sub:number;tva:number;ttc:number};fmt:(n:number)=>string}){
  return (
    <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
      <div className="flex justify-end">
        <div className="w-full max-w-sm space-y-2">
          <TotalRow label="Sous-total HT :" value={fmt(totals.sub)}/>
          <TotalRow label="TVA :"           value={fmt(totals.tva)}/>
          <TotalRow label="Total TTC :"     value={fmt(totals.ttc)} bold/>
        </div>
      </div>
    </div>
  )
}

function TotalRow({label,value,bold=false}:{
  label:string; value:string; bold?:boolean
}){
  return (
    <div className={`flex justify-between ${
      bold ? 'text-lg font-bold border-t border-slate-200 dark:border-slate-700 pt-2' : ''}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  )
}
