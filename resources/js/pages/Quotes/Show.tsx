import React, { useMemo, useState, useCallback } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
  ArrowLeft,
  Pencil,
  Info,
  FileText,
  Package,
  Calendar,
  Building2,
  Clock,
  Shield,
  Receipt,
  Download,
  CopyPlus,
  ChevronDown,
  Loader2,
  CalendarDays,
  FileCheck,
} from 'lucide-react'

import AppLayout           from '@/layouts/app-layout'
import ParticlesBackground from '@/components/ParticlesBackground'
import { Button }          from '@/components/ui/button'

/* ------------------------------------------------------------------ */
/* Types & Props                                                      */
/* ------------------------------------------------------------------ */
type Tab = 'details' | 'items' | 'notes' | 'history'

type QuoteStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'converted'

interface QuoteItem {
  id                     : number
  product_name_snapshot  : string
  product_sku_snapshot   : string
  quantity               : number
  unit_price_ht_snapshot : number | null
  tax_rate_snapshot      : number | null
  /** Fallbacks injectés côté backend */
  unit_price_ht?         : number | null
  tax_rate?              : number | null
  product?               : { name: string; sku: string }
}

interface QuoteStatusHistory {
  from_status: QuoteStatus | null
  to_status  : QuoteStatus
  comment?   : string
  created_at : string
  user?      : { name: string }
}

interface Quote {
  id              : number
  quote_number    : string
  status          : QuoteStatus
  quote_date      : string
  valid_until     : string
  currency_code   : string
  currency_symbol?: string
  client          : { id: number; company_name: string; contact_name?: string }
  items           : QuoteItem[]
  terms_conditions?: string
  notes?          : string
  internal_notes? : string
  /** Clé snake_case renvoyée par Laravel */
  status_histories?: QuoteStatusHistory[]
}

interface Props {
  quote: Quote
}

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */
export default function QuoteShow({ quote }: Props) {
  /* ───────── state pour les onglets et menus ───────── */
  const [activeTab,        setActiveTab]        = useState<Tab>('details')
  const [statusMenuOpen,   setStatusMenuOpen]   = useState(false)

  /* ───────── state pour le commentaire ───────── */
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [pendingStatus,    setPendingStatus]    = useState<QuoteStatus | null>(null)
  const [comment,          setComment]          = useState('')
  const [changingStatus,   setChangingStatus]   = useState(false)

  /* ───────── state pour la conversion en facture ───────── */
  const [conversionModalOpen, setConversionModalOpen] = useState(false)
  const [invoiceDate,         setInvoiceDate]         = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0] // Format YYYY-MM-DD
  })
  const [invoiceDueDate,      setInvoiceDueDate]      = useState(() => {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30) // +30 jours par défaut
    return dueDate.toISOString().split('T')[0]
  })
  const [invoiceNotes,        setInvoiceNotes]        = useState(quote.notes || '')
  const [convertingToInvoice, setConvertingToInvoice] = useState(false)

  /* ----------------------------- Helpers --------------------------- */
  const statusLabel: Record<QuoteStatus, string> = {
    draft    : 'Brouillon',
    sent     : 'Envoyé',
    viewed   : 'Consulté',
    accepted : 'Accepté',
    rejected : 'Refusé',
    expired  : 'Expiré',
    converted: 'Converti',
  }

  const statusColor: Record<
    QuoteStatus,
    'red' | 'green' | 'secondary' | 'default'
  > = {
    draft    : 'secondary',
    sent     : 'default',
    viewed   : 'default',
    accepted : 'green',
    rejected : 'red',
    expired  : 'secondary',
    converted: 'green',
  }

  const transitions: Partial<Record<QuoteStatus, QuoteStatus[]>> = {
    draft   : ['sent', 'rejected'],
    sent    : ['viewed', 'accepted', 'rejected', 'expired'],
    viewed  : ['accepted', 'rejected', 'expired'],
    accepted: ['converted'],
    expired : ['sent'],
  }

  /* --------- Formatter numéraire ---------------------------------- */
  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [],
  )

  const currency = quote.currency_symbol || quote.currency_code
  const fmt = useCallback(
    (n?: number | string | null) => {
      const num = Number(n)           // "100.00" → 100
      return !isFinite(num)
        ? '-'                         // null, undefined ou NaN
        : `${numberFormatter.format(num)} ${currency}`
    },
    [numberFormatter, currency],
  )

  /* ------ Totaux --------------------------------------------------- */
  const totals = useMemo(() => {
    return quote.items.reduce(
      (acc, it) => {
        const unit = it.unit_price_ht_snapshot ?? it.unit_price_ht ?? 0
        const ht   = unit * it.quantity
        const tax  = ht * (it.tax_rate_snapshot ?? it.tax_rate ?? 0) / 100
        return { sub: acc.sub + ht, tva: acc.tva + tax }
      },
      { sub: 0, tva: 0 },
    )
  }, [quote.items])

  /* ------------------------- Actions ------------------------------- */
  const exportPdf = () =>
    window.open(route('quotes.export', quote.id), '_blank', 'noopener')

  const duplicateQuote = () =>
    router.post(route('quotes.duplicate', quote.id))

  /* Ouvrir la modal de conversion */
  const openConversionModal = () => {
    setConversionModalOpen(true)
  }

  /* Fermer la modal de conversion */
  const closeConversionModal = () => {
    setConversionModalOpen(false)
    // Reset des champs
    const today = new Date()
    setInvoiceDate(today.toISOString().split('T')[0])
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)
    setInvoiceDueDate(dueDate.toISOString().split('T')[0])
    setInvoiceNotes(quote.notes || '')
  }

  /* Conversion → facture avec les données de la modal */
  const submitConversionToInvoice = () => {
    setConvertingToInvoice(true)
    router.post(route('quotes.convert-to-invoice', quote.id), {
      invoice_date: invoiceDate,
      invoice_due_date: invoiceDueDate,
      invoice_notes: invoiceNotes,
    }, {
      preserveScroll: true,
      onFinish: () => {
        setConvertingToInvoice(false)
        setConversionModalOpen(false)
      },
    })
  }

  /* → 1. L'utilisateur choisit un nouveau statut */
  const startStatusChange = (newStatus: QuoteStatus) => {
    setPendingStatus(newStatus)
    setComment('')
    setStatusMenuOpen(false)
    setCommentModalOpen(true)
  }

  /* → 2. Il valide le commentaire */
  const submitStatusChange = () => {
    if (!pendingStatus) return
    setChangingStatus(true)
    router.post(
      route('quotes.change-status', quote.id),
      { status: pendingStatus, comment },
      {
        preserveScroll: true,
        onFinish: () => {
          setChangingStatus(false)
          setCommentModalOpen(false)
          setPendingStatus(null)
          setComment('')
        },
      },
    )
  }

  /* ------------------------------ Render --------------------------- */
  return (
    <>
      <Head title={`Devis – ${quote.quote_number}`} />

      <div className="relative min-h-screen flex flex-col bg-gradient-to-br
                   from-white via-slate-100 to-slate-200
                   dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749]">
        <ParticlesBackground />

        <AppLayout
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Devis', href: '/quotes' },
            { title: quote.quote_number, href: route('quotes.show', quote.id) },
          ]}
        >
          {/* ===== En-tête ===== */}
          <div className="px-6 pt-6 pb-1">
            <Header
              quote={quote}
              totals={totals}
              fmt={fmt}
              statusLabel={statusLabel}
              statusColor={statusColor}
              exportPdf={exportPdf}
              duplicateQuote={duplicateQuote}
              transitions={transitions}
              statusMenuOpen={statusMenuOpen}
              setStatusMenuOpen={setStatusMenuOpen}
              startStatusChange={startStatusChange}
              convertToInvoice={openConversionModal}
            />
          </div>

          {/* ===== Contenu ===== */}
          <div className="flex-grow p-6 flex flex-col">
            <div className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl
                         grid grid-cols-1 md:grid-cols-4 min-h-[350px]">
              {/* Tabs */}
              <div className="border-r border-slate-200 dark:border-slate-700 flex flex-col">
                {(['details', 'items', 'notes', 'history'] as Tab[]).map(tab => (
                  <TabButton
                    key={tab}
                    tab={tab}
                    active={activeTab}
                    setActive={setActiveTab}
                  />
                ))}
              </div>

              {/* Panels */}
              <div className="p-6 md:col-span-3 overflow-y-auto text-slate-700 dark:text-slate-300">
                {activeTab === 'details' && (
                  <DetailsPanel
                    quote={quote}
                    totals={totals}
                    fmt={fmt}
                    statusLabel={statusLabel}
                    statusColor={statusColor}
                  />
                )}

                {activeTab === 'items' && (
                  <ItemsPanel quote={quote} fmt={fmt} />
                )}

                {activeTab === 'notes' && (
                  <NotesPanel quote={quote} />
                )}

                {activeTab === 'history' && (
                  <HistoryPanel
                    histories={quote.status_histories ?? []}
                    statusLabel={statusLabel}
                  />
                )}
              </div>
            </div>
          </div>
        </AppLayout>
      </div>

      {/* ─────────── Modal Commentaire ─────────── */}
      {commentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
                     bg-black/50 backdrop-blur-sm"
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-800
                       border border-slate-200 dark:border-slate-700
                       rounded-lg p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Commentaire
            </h2>

            <textarea
              rows={4}
              className="w-full resize-none rounded border border-slate-300 dark:border-slate-600
                         bg-white/90 dark:bg-slate-900/30 p-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ajouter un commentaire (optionnel)…"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setCommentModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={submitStatusChange} disabled={changingStatus}>
                {changingStatus && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Valider
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────── Modal Conversion en Facture ─────────── */}
      {conversionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
                     bg-black/50 backdrop-blur-sm"
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-800
                       border border-slate-200 dark:border-slate-700
                       rounded-lg p-6 space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-lg">
                <FileCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Convertir en facture
              </h2>
            </div>

            <div className="space-y-4">
              {/* Date de la facture */}
              <div>
                <label htmlFor="invoice-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <CalendarDays className="inline w-4 h-4 mr-1" />
                  Date de la facture
                </label>
                <input
                  type="date"
                  id="invoice-date"
                  className="w-full rounded border border-slate-300 dark:border-slate-600
                             bg-white/90 dark:bg-slate-900/30 p-3 text-sm
                             focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={invoiceDate}
                  onChange={e => setInvoiceDate(e.target.value)}
                />
              </div>

              {/* Date d'échéance */}
              <div>
                <label htmlFor="invoice-due-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Date d'échéance
                </label>
                <input
                  type="date"
                  id="invoice-due-date"
                  className="w-full rounded border border-slate-300 dark:border-slate-600
                             bg-white/90 dark:bg-slate-900/30 p-3 text-sm
                             focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={invoiceDueDate}
                  onChange={e => setInvoiceDueDate(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="invoice-notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <FileText className="inline w-4 h-4 mr-1" />
                  Notes (optionnel)
                </label>
                <textarea
                  id="invoice-notes"
                  rows={4}
                  className="w-full resize-none rounded border border-slate-300 dark:border-slate-600
                             bg-white/90 dark:bg-slate-900/30 p-3 text-sm
                             focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Notes ou commentaires pour la facture..."
                  value={invoiceNotes}
                  onChange={e => setInvoiceNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Résumé */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                Résumé de la conversion
              </h3>
              <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <div>• Client : {quote.client.company_name}</div>
                <div>• Devis : {quote.quote_number}</div>
                <div>• Total TTC : {fmt(totals.sub + totals.tva)}</div>
                <div>• {quote.items.length} article{quote.items.length > 1 ? 's' : ''}</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={closeConversionModal}>
                Annuler
              </Button>
              <Button onClick={submitConversionToInvoice} disabled={convertingToInvoice}>
                {convertingToInvoice && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                <Receipt className="w-4 h-4 mr-2" />
                Créer la facture
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Sous-composants                                                    */
/* ------------------------------------------------------------------ */

/* ----------------------- HEADER ----------------------------------- */
const Header = ({
  quote,
  totals,
  fmt,
  statusLabel,
  statusColor,
  exportPdf,
  duplicateQuote,
  transitions,
  statusMenuOpen,
  setStatusMenuOpen,
  startStatusChange,
  convertToInvoice,
}: {
  quote: Quote
  totals: { sub: number; tva: number }
  fmt: (n?: number | null) => string
  statusLabel: Record<QuoteStatus, string>
  statusColor: Record<QuoteStatus, 'red' | 'green' | 'secondary' | 'default'>
  exportPdf: () => void
  duplicateQuote: () => void
  transitions: Partial<Record<QuoteStatus, QuoteStatus[]>>
  statusMenuOpen: boolean
  setStatusMenuOpen: (b: boolean) => void
  startStatusChange: (s: QuoteStatus) => void
  convertToInvoice: () => void
}) => (
  <div
    className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700
               backdrop-blur-md p-6 rounded-xl shadow-xl flex flex-col lg:flex-row gap-6 items-start"
  >
    {/* Icône */}
    <div className="w-32 h-32 flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
      <FileText className="w-12 h-12 text-slate-400" />
    </div>

    {/* Infos */}
    <div className="flex-1 space-y-2">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        {quote.quote_number}
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {quote.client.company_name}
        {quote.client.contact_name && ` – ${quote.client.contact_name}`}
      </p>
      <p className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <Calendar className="w-4 h-4" />{' '}
        {new Date(quote.quote_date).toLocaleDateString('fr-FR')} •{' '}
        <Clock className="w-4 h-4" /> Valide jusqu'au{' '}
        {new Date(quote.valid_until).toLocaleDateString('fr-FR')}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <Badge
          text={statusLabel[quote.status]}
          color={statusColor[quote.status]}
        />
        <Badge text={`TTC : ${fmt(totals.sub + totals.tva)}`} color="default" />
      </div>
    </div>

    {/* Actions */}
    <div className="flex flex-col gap-2 w-full sm:w-auto">
      <Link href={route('quotes.index')} className="w-full sm:w-auto">
        <Button variant="outline" className="w-full sm:w-auto">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour
        </Button>
      </Link>

      {quote.status === 'draft' && (
        <Link href={route('quotes.edit', quote.id)} className="w-full sm:w-auto">
          <Button
            className="group flex items-center justify-center
                       rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-5 py-3
                       text-sm font-semibold text-white shadow-md transition-all
                       hover:from-red-500 hover:to-red-600"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </Link>
      )}

      <Button variant="secondary" className="w-full sm:w-auto" onClick={exportPdf}>
        <Download className="w-4 h-4 mr-2" />
        Exporter&nbsp;PDF
      </Button>

      <Button variant="secondary" className="w-full sm:w-auto" onClick={duplicateQuote}>
        <CopyPlus className="w-4 h-4 mr-2" />
        Dupliquer
      </Button>

      {/* ➜ Convertir en facture (seulement si accepté) */}
      {quote.status === 'accepted' && (
        <Button
          variant="secondary" className="w-full sm:w-auto"
          onClick={convertToInvoice}
        >
          <Receipt className="w-4 h-4 mr-2" />
          Convertir en facture
        </Button>
      )}

      {/* Statut */}
      {transitions[quote.status]?.length && (
        <div className="relative">
          <Button
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-between"
            onClick={() => setStatusMenuOpen(!statusMenuOpen)}
          >
            Changer&nbsp;statut
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>

          {statusMenuOpen && (
            <ul
              className="absolute z-50 mt-1 w-44 right-0 bg-white dark:bg-slate-800
                         border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg"
            >
              {transitions[quote.status]!.map(s => (
                <li key={s}>
                  <button
                    onClick={() => startStatusChange(s)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100
                               dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    {statusLabel[s]}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  </div>
)

/* -------------------- PANEL — Détails ----------------------------- */
const DetailsPanel = ({
  quote,
  totals,
  fmt,
  statusLabel,
  statusColor,
}: {
  quote: Quote
  totals: { sub: number; tva: number }
  fmt: (n?: number | null) => string
  statusLabel: Record<QuoteStatus, string>
  statusColor: Record<QuoteStatus, 'red' | 'green' | 'secondary' | 'default'>
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <Detail icon={Building2} label="Client"          value={quote.client.company_name} />
    <Detail icon={Calendar}  label="Date devis"     value={new Date(quote.quote_date).toLocaleDateString('fr-FR')} />
    <Detail icon={Calendar}  label="Valide jusqu'au" value={new Date(quote.valid_until).toLocaleDateString('fr-FR')} />
    <Detail
      icon={Receipt}
      label="Statut"
      value={<Badge text={statusLabel[quote.status]} color={statusColor[quote.status]} />}
    />
    <Detail icon={FileText} label="Nombre d'articles" value={quote.items.length} />
    <Detail icon={Shield}   label="Total TTC"        value={fmt(totals.sub + totals.tva)} />
  </div>
)

/* -------------------- PANEL — Articles ---------------------------- */
const ItemsPanel = ({
  quote,
  fmt,
}: {
  quote: Quote
  fmt: (n?: number | null) => string
}) => {
  const rows = quote.items.map(it => {
    const unit = it.unit_price_ht_snapshot ?? it.unit_price_ht ?? 0
    const ht   = unit * it.quantity
    const tax  = ht * (it.tax_rate_snapshot ?? it.tax_rate ?? 0) / 100
    const ttc  = ht + tax
    return { ...it, unit, ht, tax, ttc }
  })

  return rows.length ? (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left bg-slate-50 dark:bg-slate-700/30">
              <th className="px-3 py-2">Désignation</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2 text-right">Qté</th>
              <th className="px-3 py-2 text-right">PU&nbsp;HT</th>
              <th className="px-3 py-2 text-right">TVA&nbsp;%</th>
              <th className="px-3 py-2 text-right">Total&nbsp;HT</th>
              <th className="px-3 py-2 text-right">Total&nbsp;TTC</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr
                key={r.id}
                className="border-b border-slate-200 dark:border-slate-700 last:border-0"
              >
                <td className="px-3 py-2">{r.product_name_snapshot || r.product?.name}</td>
                <td className="px-3 py-2">{r.product_sku_snapshot  || r.product?.sku}</td>
                <td className="px-3 py-2 text-right">{r.quantity}</td>
                <td className="px-3 py-2 text-right">{fmt(r.unit)}</td>
                <td className="px-3 py-2 text-right">{r.tax_rate_snapshot ?? r.tax_rate ?? 0}</td>
                <td className="px-3 py-2 text-right">{fmt(r.ht)}</td>
                <td className="px-3 py-2 text-right">{fmt(r.ttc)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totaux */}
      <div className="mt-4 text-right space-y-1">
        <div className="text-sm">
          Sous-total&nbsp;HT&nbsp;:{' '}
          <span className="font-medium">
            {fmt(rows.reduce((s, r) => s + r.ht, 0))}
          </span>
        </div>
        <div className="text-sm">
          TVA&nbsp;:{' '}
          <span className="font-medium">
            {fmt(rows.reduce((s, r) => s + r.tax, 0))}
          </span>
        </div>
        <div className="text-lg font-bold">
          Total&nbsp;TTC&nbsp;:{' '}
          {fmt(rows.reduce((s, r) => s + r.ttc, 0))}
        </div>
      </div>
    </>
  ) : (
    <p className="text-slate-500 dark:text-slate-400 italic">Aucun article.</p>
  )
}

/* -------------------- PANEL — Notes ------------------------------- */
const NotesPanel = ({ quote }: { quote: Quote }) => (
  <>
    {quote.terms_conditions || quote.notes || quote.internal_notes ? (
      <div className="space-y-6">
        {quote.terms_conditions && (
          <Section title="Conditions générales" content={quote.terms_conditions} />
        )}
        {quote.notes && <Section title="Notes client" content={quote.notes} />}
        {quote.internal_notes && (
          <Section title="Notes internes" content={quote.internal_notes} />
        )}
      </div>
    ) : (
      <p className="text-slate-500 dark:text-slate-400 italic">Aucune note.</p>
    )}
  </>
)

/* -------------------- PANEL — Historique -------------------------- */
const HistoryPanel = ({
  histories,
  statusLabel,
}: {
  histories: QuoteStatusHistory[]
  statusLabel: Record<QuoteStatus, string>
}) => (
  histories.length ? (
    <ul className="space-y-4">
      {histories.map((h, idx) => (
        <li
          key={idx}
          className="text-sm border-b border-slate-200 dark:border-slate-700 pb-2"
        >
          <div className="font-medium">
            {(h.from_status ? statusLabel[h.from_status] : 'Nouveau')}
            {' → '}
            {statusLabel[h.to_status]}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {h.user?.name ?? 'Système'} •{' '}
            {new Date(h.created_at).toLocaleString('fr-FR')}
          </div>
          {h.comment && (
            <div className="mt-1 italic text-slate-600 dark:text-slate-300">
              {h.comment}
            </div>
          )}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-slate-500 dark:text-slate-400 italic">
      Aucun changement de statut.
    </p>
  )
)

/* ------------------------------------------------------------------ */
/* Petits helpers UI                                                  */
/* ------------------------------------------------------------------ */
const Badge = ({
  text,
  color,
}: {
  text: string
  color: 'red' | 'green' | 'secondary' | 'default'
}) => (
  <span
    className={`inline-block px-2 py-1 text-xs rounded-full font-medium select-none tracking-wide
      ${
        color === 'red'
          ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
          : color === 'green'
          ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
          : 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400'
      }`}
  >
    {text}
  </span>
)

const Detail = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Info
  label: string
  value: React.ReactNode
}) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-1" />
    <div>
      <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-sm font-medium text-slate-900 dark:text-white/90 break-all">
        {value}
      </div>
    </div>
  </div>
)

const TabButton = ({
  tab,
  active,
  setActive,
}: {
  tab: Tab
  active: Tab
  setActive: (t: Tab) => void
}) => {
  const icons: Record<Tab, JSX.Element> = {
    details: <Info    className="inline w-4 h-4 mr-2" />,
    items:   <Package className="inline w-4 h-4 mr-2" />,
    notes:   <FileText className="inline w-4 h-4 mr-2" />,
    history: <Clock   className="inline w-4 h-4 mr-2" />,
  }
  const labels: Record<Tab, string> = {
    details: 'Détails',
    items:   'Articles',
    notes:   'Notes',
    history: 'Historique',
  }
  const isActive = active === tab
  return (
    <button
      onClick={() => setActive(tab)}
      className={`w-full px-4 py-3 text-left text-sm font-medium transition flex items-center
        ${
          isActive
            ? 'bg-gradient-to-r from-red-600 to-red-500 text-white rounded-l-xl shadow-inner'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white'
        }`}
    >
      {icons[tab]} {labels[tab]}
    </button>
  )
}

const Section = ({ title, content }: { title: string; content: string }) => (
  <div>
    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">
      {title}
    </h3>
    <p className="whitespace-pre-line text-sm">{content}</p>
  </div>
)
