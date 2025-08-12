import React, { useEffect, useMemo, useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
  Filter, X, SlidersHorizontal, Search, Plus,
  Package, Layers, Hash, DollarSign, User, Calendar,
  ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Eye, Pencil, Trash2, RotateCcw, ShieldAlert, ArrowUpRight,ClipboardSignature,MoreHorizontal
} from 'lucide-react'

import type { PageProps } from '@/types'
import AppLayout          from '@/layouts/app-layout'
import ParticlesBackground from '@/components/ParticlesBackground'
import ModernDatePicker    from '@/components/ModernDatePicker'
import { Button }          from '@/components/ui/button'

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
interface StockMovement {
  id: number
  product:   { id: string; name: string; sku: string }
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  formatted_quantity?: string
  reference: string | null
  total_cost: string | null
  currency?: { code: string; symbol: string }       // ← NEW
  user: { id: number; name: string }
  movement_date: string
  type_label?: string
  deleted_at?: string | null
}

interface Filters {
  search?: string
  type?: string
  product_id?: string
  start_date?: string
  end_date?: string
  sort?: 'movement_date' | 'quantity' | 'total_cost'
  direction?: 'asc' | 'desc'
  per_page?: number
}

interface Pagination<T> {
  data: T[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

interface Flash { success?: string; error?: string }

interface Props extends PageProps<{
  movements: Pagination<StockMovement>
  filters:   Filters
  products:  { id: string; name: string; sku: string }[]
  flash?:    Flash
}> {}

/* ------------------------------------------------------------------ */
/* Utils                                                              */
/* ------------------------------------------------------------------ */
const dateYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

const parseYMD = (s:string) => {
  const [y,m,d] = s.split('-').map(Number)
  return new Date(y, m-1, d)
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function StockMovementsIndex ({ movements, filters, products, flash }: Props) {

  /* ---------------- état UI ---------------- */
  const [showFilters, setShowFilters] = useState(false)
  const [field, setField]   = useState<'search'|'type'|'product'|'date'>('search')
  const [value, setValue]   = useState('')
  const [start, setStart]   = useState<Date|null>(filters.start_date ? parseYMD(filters.start_date) : null)
  const [end,   setEnd]     = useState<Date|null>(filters.end_date   ? parseYMD(filters.end_date)   : null)

  const [chips, setChips] = useState<any[]>(() => {
    const arr:any[]=[]
    if (filters.search)        filters.search.split(/\s+/).forEach(v=>arr.push({field:'search', value:v}))
    if (filters.type)          arr.push({field:'type',    value:filters.type})
    if (filters.product_id)    arr.push({field:'product', value:filters.product_id})
    if (filters.start_date && filters.end_date)
                               arr.push({field:'date',    value:filters.start_date, value2:filters.end_date})
    return arr
  })

  const [showSuccess,setShowSuccess]=useState(!!flash?.success)
  const [showError,  setShowError]  =useState(!!flash?.error)

  useEffect(()=>{ if(flash?.success){ const t=setTimeout(()=>setShowSuccess(false),5_000); return()=>clearTimeout(t)}},[flash?.success])
  useEffect(()=>{ if(flash?.error)  { const t=setTimeout(()=>setShowError(false),5_000);  return()=>clearTimeout(t)}},[flash?.error])

  /* ---------------- Inertia helpers ---------------- */
  const iOpts = { preserveScroll:true, preserveState:true, only:['movements','filters','flash'] } as const

  const payload = (list:any[], extra={}) => {
    const p:any = {...extra}
    list.forEach(f=>{
      if(f.field==='search')   p.search     = list.filter(s=>s.field==='search').map(s=>s.value).join(' ')
      if(f.field==='type')     p.type       = f.value
      if(f.field==='product')  p.product_id = f.value
      if(f.field==='date')    {p.start_date = f.value; p.end_date = f.value2}
    })
    return p
  }
  const go = (list:any[], extra={}) =>
    router.get(route('stock-movements.index'), payload(list,extra), iOpts)

  /* ---------------- gestion des filtres ---------------- */
  const addChip = () => {
    if(field==='date'){
      if(start && end){
        const n={field:'date', value:dateYMD(start), value2:dateYMD(end)}
        const next = chips.filter(c=>c.field!=='date').concat(n)
        setChips(next); go(next,{page:1,per_page:movements.per_page})
      }
    }else if(value.trim()){
      const n={field, value:value.trim()}
      const next = chips.filter(c=>c.field!==field).concat(n)
      setChips(next); setValue('')
      go(next,{page:1,per_page:movements.per_page})
    }
  }

  const rmChip = (idx:number) => {
    if(chips[idx].field==='date'){ setStart(null); setEnd(null) }
    const next = chips.filter((_,i)=>i!==idx)
    setChips(next); go(next,{page:1,per_page:movements.per_page})
  }

  const reset = () => {
    setChips([]); setStart(null); setEnd(null); setValue('')
    router.get(route('stock-movements.index'), {page:1,per_page:movements.per_page}, iOpts)
  }

  /* ---------------- pagination / tri ---------------- */
  const changePage = (p:number)=>go(chips,{page:p,per_page:movements.per_page,
                                           sort:filters.sort,direction:filters.direction})
  const changePer  = (n:number)=>go(chips,{page:1,per_page:n,
                                           sort:filters.sort,direction:filters.direction})
  const changeSort = (col:Filters['sort'])=>{
    const dir = filters.sort===col ? (filters.direction==='asc'?'desc':'asc') : 'asc'
    go(chips,{page:1,per_page:movements.per_page,sort:col,direction:dir})
  }

  const windowPages = useMemo<(number|'…')[]>(()=>{
    const res:(number|'…')[]=[], MAX=5,c=movements.current_page,l=movements.last_page
    if(l<=MAX+2){ for(let i=1;i<=l;i++) res.push(i); return res }
    res.push(1)
    let s=Math.max(2,c-Math.floor(MAX/2)), e=s+MAX-1
    if(e>=l){ e=l-1; s=e-MAX+1 }
    if(s>2) res.push('…')
    for(let i=s;i<=e;i++) res.push(i)
    if(e<l-1) res.push('…')
    res.push(l)
    return res
  },[movements.current_page,movements.last_page])

  /* ---------------- helpers ---------------- */
  const fields = [
    {value:'search',  label:'Recherche globale'},
    {value:'type',    label:'Type'},
    {value:'product', label:'Produit'},
    {value:'date',    label:'Date du mouvement'}
  ]
  const typeLbl = {in:'Entrée', out:'Sortie', adjustment:'Ajustement'}
  const badge = (t:StockMovement['type']) => ({
    in:'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    out:'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    adjustment:'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }[t])

  const chipText = (c:any) => {
    if(c.field==='product'){
      const p=products.find(p=>p.id===c.value); return p?`${p.sku} - ${p.name}`:c.value
    }
    if(c.field==='type') return typeLbl[c.value as keyof typeof typeLbl] ?? c.value
    if(c.field==='date'){
      const s=parseYMD(c.value).toLocaleDateString('fr-FR')
      const e=parseYMD(c.value2).toLocaleDateString('fr-FR')
      return `${s} – ${e}`
    }
    return c.value
  }

  /* ------------------------------------------------------------------ */
  return (
    <>
      <Head title="Mouvements de stock"/>
      <AppLayout breadcrumbs={[
        {title:'Dashboard',  href:'/dashboard'},
        {title:'Inventaire', href:'/stock-movements'}
      ]}>
        <div className="relative">
          <ParticlesBackground/>

          <div className="relative z-0 w-full py-6 px-4">

            {/* Flash messages */}
            {flash?.success && showSuccess && (
              <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200
                              text-green-800 flex gap-3 dark:bg-green-900/20 dark:border-green-700 dark:text-green-100">
                <ArrowUpRight className="w-5 h-5"/>
                <span className="flex-1 font-medium">{flash.success}</span>
                <button onClick={()=>setShowSuccess(false)}><X className="w-4 h-4"/></button>
              </div>
            )}
            {flash?.error && showError && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200
                              text-red-800 flex gap-3 dark:bg-red-900/20 dark:border-red-700 dark:text-red-100">
                <ShieldAlert className="w-5 h-5"/>
                <span className="flex-1 font-medium">{flash.error}</span>
                <button onClick={()=>setShowError(false)}><X className="w-4 h-4"/></button>
              </div>
            )}

            {/* Header */}
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              Gestion des mouvements de stock
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Suivi des entrées, sorties et ajustements
            </p>

            {/* Barre d’outils */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700
                            backdrop-blur-md rounded-xl shadow-xl p-6 mb-6">
              <div className="flex flex-wrap gap-4 justify-between">

                {/* Filtres */}
                <div className="flex flex-col gap-4 w-full lg:w-auto">
                  <div className="flex items-center gap-3">
                    <Button onClick={()=>setShowFilters(!showFilters)}>
                      <Filter className="w-4 h-4"/>
                      {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
                    </Button>
                    {chips.length>0 && (
                      <Button variant="outline" onClick={reset} className="gap-1.5">
                        <X className="w-4 h-4"/> Effacer
                      </Button>
                    )}
                  </div>

                  {showFilters && (
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200
                                    dark:border-slate-700 rounded-lg p-4 lg:max-w-2xl">
                      <h3 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4"/> Filtrer les mouvements
                      </h3>

                      {/* champ à filtrer */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <select value={field}
                                onChange={e=>{setField(e.target.value as any);setValue('')}}
                                className="w-full border rounded-lg px-3 py-2 text-sm
                                           bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100">
                          {fields.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>

                      {/* valeur du filtre */}
                      <div className="mb-3">
                        {field==='date' ? (
                          <div className="flex flex-wrap items-center gap-3">
                            <ModernDatePicker selected={start} onChange={d=>setStart(d)}
                                              placeholder="Date de début" selectsStart startDate={start} endDate={end}
                                              className="flex-1 min-w-[180px]" popperClassName="z-[90]"/>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">à</span>
                            <ModernDatePicker selected={end} onChange={d=>setEnd(d)}
                                              placeholder="Date de fin"   selectsEnd startDate={start} endDate={end}
                                              minDate={start} className="flex-1 min-w-[180px]" popperClassName="z-[90]"/>
                          </div>
                        ) : field==='type' ? (
                          <select value={value} onChange={e=>setValue(e.target.value)}
                                  className="w-full border rounded-lg px-3 py-2 text-sm
                                             bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100">
                            <option value="">Tous les types</option>
                            {Object.entries(typeLbl).map(([v,l])=>(
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </select>
                        ) : field==='product' ? (
                          <select value={value} onChange={e=>setValue(e.target.value)}
                                  className="w-full border rounded-lg px-3 py-2 text-sm
                                             bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100">
                            <option value="">Tous les produits</option>
                            {products.map(p=>(
                              <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
                            <input type="text" value={value}
                                   onChange={e=>setValue(e.target.value)}
                                   onKeyDown={e=>e.key==='Enter' && addChip()}
                                   placeholder="Filtrer…"
                                   className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm
                                              bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"/>
                          </div>
                        )}
                      </div>

                      <Button onClick={addChip}
                              disabled={field==='date' ? !start||!end : !value.trim()}
                              className="w-full">Ajouter le filtre</Button>
                    </div>
                  )}

                  {/* chips actifs */}
                  {chips.length>0 && (
                    <div className="flex flex-wrap gap-2">
                      {chips.map((c,i)=>(
                        <span key={i}
                              className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700
                                         dark:bg-indigo-900/30 dark:text-indigo-200 px-3 py-1.5 rounded-lg text-sm">
                          <span className="font-medium">{fields.find(f=>f.value===c.field)?.label}</span>
                          : <span>{chipText(c)}</span>
                          <button onClick={()=>rmChip(i)}><X className="w-3.5 h-3.5"/></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pagination / nouveau mouvement */}
                <div className="flex items-center gap-3 ml-auto">
                  <div className="relative min-w-[220px]">
                    <select value={movements.per_page} onChange={e=>changePer(Number(e.target.value))}
                            className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200
                                       dark:border-slate-700 rounded-lg pl-4 pr-10 py-2.5 text-sm
                                       text-slate-600 dark:text-slate-100">
                      {[5,10,20,50].map(n=><option key={n} value={n}>{n} lignes par page</option>)}
                      <option value={-1}>Tous</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none"/>
                  </div>

                  <Link href={route('stock-movements.create')}>
                    <Button className="bg-gradient-to-r from-red-600 to-red-500 text-white
                                       hover:from-red-500 hover:to-red-600 shadow-md">
                      <Plus className="w-4 h-4 mr-1"/> Nouveau mouvement
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* TABLE ------------------------------------------------------------------ */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700
                            backdrop-blur-md rounded-xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3 cursor-pointer" onClick={()=>changeSort('movement_date')}>
                        <div className="flex items-center gap-1"><Calendar className="w-4 h-4"/>
                          Date {filters.sort==='movement_date' && (filters.direction==='asc'?'▲':'▼')}
                        </div>
                      </th>
                      <th className="px-6 py-4"><div className="flex items-center gap-2"><Package className="w-4 h-4"/>Produit</div></th>
                      <th className="px-6 py-4"><div className="flex items-center gap-2"><Layers className="w-4 h-4"/>Type</div></th>
                      <th className="px-6 py-4 cursor-pointer" onClick={()=>changeSort('quantity')}>
                        <div className="flex items-center gap-2"><Hash className="w-4 h-4"/>
                          Quantité {filters.sort==='quantity' && (filters.direction==='asc'?'▲':'▼')}
                        </div>
                      </th>
                      <th className="px-6 py-4">
  <div className="flex items-center gap-2">
    <ClipboardSignature className="w-4 h-4" />
    Référence
  </div>
</th>
                      <th className="px-6 py-4 cursor-pointer" onClick={()=>changeSort('total_cost')}>
                        <div className="flex items-center gap-2"><DollarSign className="w-4 h-4"/>
                          Coût total {filters.sort==='total_cost' && (filters.direction==='asc'?'▲':'▼')}
                        </div>
                      </th>
                      <th className="px-6 py-4"><div className="flex items-center gap-2"><User className="w-4 h-4"/>Utilisateur</div></th>
                      <th className="px-6 py-4 text-center">
  <div className="flex items-center justify-center gap-2">
    <MoreHorizontal className="w-4 h-4" />
    Actions
  </div>
</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {movements.data.length===0 ? (
                      <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                        Aucun mouvement trouvé.</td></tr>
                    ) : movements.data.map(m=>(
                      <tr key={m.id}
                          className={`${m.deleted_at ? 'bg-red-50 dark:bg-red-900/10' : ''}
                                     hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors`}>
                        <td className="px-4 py-3">{new Date(m.movement_date).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-3">
                          <div className="font-medium text-slate-900 dark:text-white">{m.product.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{m.product.sku}</div>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge(m.type)}`}>
                            {m.type_label ?? typeLbl[m.type]}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className={m.quantity>=0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {m.formatted_quantity ?? `${m.quantity>0?'+':''}${m.quantity}`}
                          </span>
                        </td>
                        <td className="px-6 py-3">{m.reference || '-'}</td>
                        <td className="px-6 py-3">
                          {m.total_cost
                            ? `${m.total_cost} ${m.currency?.symbol ?? ''}`
                            : '-'}
                        </td>
                        <td className="px-6 py-3">{m.user.name}</td>
                        <td className="px-6 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            {!m.deleted_at ? (
                              <>
                                <Link href={route('stock-movements.show', m.id)}
                                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300
                                                 p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-800/30"
                                      aria-label="Voir"><Eye className="w-5 h-5"/></Link>
                                <Link href={route('stock-movements.edit', m.id)}
                                      className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300
                                                 p-1 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-800/30"
                                      aria-label="Éditer"><Pencil className="w-5 h-5"/></Link>
                                <button
                                  onClick={()=>confirm('Supprimer ce mouvement ?') &&
                                             router.delete(route('stock-movements.destroy',{id:m.id}), iOpts)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300
                                             p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-800/30"
                                  aria-label="Supprimer"><Trash2 className="w-5 h-5"/></button>
                              </>
                            ) : (
                              <button
                                onClick={()=>router.post(route('stock-movements.restore',{id:m.id}), {}, iOpts)}
                                className="text-yellow-400 hover:text-yellow-300 p-1 rounded-full"
                                aria-label="Restaurer"><RotateCcw className="w-5 h-5"/></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination ------------------------------------------------------------------ */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4
                            bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                            backdrop-blur-md rounded-xl shadow-xl mt-4 text-sm text-slate-700 dark:text-slate-200">
              <span>
                Affichage de {movements.current_page===0 ? 0 : (movements.current_page-1)*movements.per_page+1}
                &nbsp;à&nbsp;{Math.min(movements.current_page*movements.per_page, movements.total)}
                &nbsp;sur&nbsp;{movements.total} résultats
              </span>

              {movements.last_page>1 && (
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" disabled={movements.current_page===1}
                          onClick={()=>changePage(1)}                aria-label="Première page"><ChevronsLeft className="w-4 h-4"/></Button>
                  <Button size="sm" variant="outline" disabled={movements.current_page===1}
                          onClick={()=>changePage(movements.current_page-1)} aria-label="Page précédente"><ChevronLeft className="w-4 h-4"/></Button>
                  {windowPages.map((p,i)=> p==='…'
                    ? <span key={i} className="px-2 select-none">…</span>
                    : <Button key={p} size="sm"
                              variant={p===movements.current_page?'default':'outline'}
                              onClick={()=>changePage(p as number)}>{p}</Button>)}
                  <Button size="sm" variant="outline" disabled={movements.current_page===movements.last_page}
                          onClick={()=>changePage(movements.current_page+1)} aria-label="Page suivante"><ChevronRight className="w-4 h-4"/></Button>
                  <Button size="sm" variant="outline" disabled={movements.current_page===movements.last_page}
                          onClick={()=>changePage(movements.last_page)}      aria-label="Dernière page"><ChevronsRight className="w-4 h-4"/></Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  )
}
