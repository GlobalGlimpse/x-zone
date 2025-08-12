import React, { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
  ArrowLeft, Pencil, Info, Package2,
  FileText, Calendar, BadgeEuro, Tag, Layers, Hash,
  User as UserIcon, Truck, AlertCircle, Download
} from 'lucide-react'

import AppLayout from '@/layouts/app-layout'
import ParticlesBackground from '@/components/ParticlesBackground'
import { Button } from '@/components/ui/button'
import type {
  PageProps,
  StockMovement as Movement,
  StockMovementAttachment as Attachment,
  Product, Currency, Provider,
  StockMovementReason as Reason, User
} from '@/types'

/* ------------------------------------------------------------------ */
/* Types & props                                                      */
/* ------------------------------------------------------------------ */
type Tab = 'details' | 'attachments' | 'history'

interface Props extends PageProps<{
  movement: Movement & {
    product: Product
    user: User
    currency?: Currency
    provider?: Provider
    movement_reason?: Reason      // ⬅️ snake_case, conforme au JSON Laravel
    attachments: Attachment[]
  }
}> {}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function ShowStockMovement({ movement }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('details')

  /* ---------------------------------------------------------------- */
  /* Données dérivées                                                 */
  /* ---------------------------------------------------------------- */
  const isDeleted    = !!movement.deleted_at
  const created      = new Date(movement.created_at!)
  const updated      = movement.updated_at ? new Date(movement.updated_at) : null
  const movementDate = new Date(movement.movement_date)

  const typeLabels = {
    in: 'Entrée',
    out: 'Sortie',
    adjustment: 'Ajustement',
  } as const

  const typeColors = {
    in: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    out: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    adjustment: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  } as const

  const quantityDisplay =
    movement.type === 'out' ? `-${Math.abs(movement.quantity)}` : movement.quantity

  /* ---------------------------------------------------------------- */
  /* Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <>
      <Head title={`Mouvement #${movement.id} — ${movement.reference || 'Sans référence'}`} />

      <div className="min-h-screen bg-gradient-to-br from-white via-slate-100 to-slate-200 dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749] transition-colors duration-500">
        <ParticlesBackground />

        <AppLayout
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Mouvements', href: '/stock-movements' },
            { title: `Mouvement #${movement.id}`, href: route('stock-movements.show', movement.id) },
          ]}
        >
          {/* -------- Bandeau haut -------- */}
          <div className="p-6 space-y-4">
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 backdrop-blur-md p-6 rounded-xl shadow-xl flex flex-col lg:flex-row gap-6 items-start">
              {/* icône produit */}
              <div className="w-32 h-32 flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                <Package2 className="w-12 h-12 text-slate-400" />
              </div>

              {/* informations principales */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Mouvement #{movement.id}
                  </h1>
                  <Badge text={typeLabels[movement.type]} color={typeColors[movement.type]} />
                  {isDeleted && (
                    <Badge text="Supprimé" color="bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400" />
                  )}
                </div>

                {/* métadonnées empilées */}
                <div className="space-y-1 text-sm">
                  <Meta label="Produit"   value={movement.product.name} />
                  <Meta label="Quantité"  value={quantityDisplay} />
                  <Meta label="Référence" value={movement.reference || '—'} />
                  <Meta label="Date"      value={movementDate.toLocaleDateString('fr-FR')} />
                </div>
              </div>

              {/* actions */}
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <Link href={route('stock-movements.index')} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Retour
                  </Button>
                </Link>

                {!isDeleted && (
                  <Link href={route('stock-movements.edit', movement.id)} className="w-full sm:w-auto">
                    <Button
                      className="group relative flex items-center justify-center
                                 rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-5 py-3
                                 text-sm font-semibold text-white shadow-md transition-all
                                 hover:from-red-500 hover:to-red-600 focus:ring-2 focus:ring-red-500
                                 w-full sm:w-auto"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* -------- Onglets -------- */}
          <div className="flex-grow p-6">
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 backdrop-blur-md rounded-xl shadow-xl grid grid-cols-1 md:grid-cols-4 min-h-[350px]">
              {/* liste des tabs */}
              <div className="border-r border-slate-200 dark:border-slate-700 flex flex-col">
                {( ['details', 'attachments', 'history'] as Tab[] ).map(tab => (
                  <TabButton key={tab} tab={tab} active={activeTab} setActive={setActiveTab} />
                ))}
              </div>

              {/* contenu */}
              <div className="p-6 md:col-span-3 overflow-y-auto text-slate-700 dark:text-slate-300">
                {/* -------- DÉTAILS -------- */}
                {activeTab === 'details' && (
                  <div className="space-y-8">
                    {/* Informations générales */}
                    <Section title="Informations générales">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Detail icon={Hash}      label="ID"            value={movement.id} />
                        <Detail icon={Tag}       label="Type"          value={typeLabels[movement.type]} />
                        <Detail icon={Package2}  label="Produit"       value={`${movement.product.sku} — ${movement.product.name}`} />
                        <Detail icon={Layers}    label="Quantité"      value={quantityDisplay} />
                        <Detail icon={FileText}  label="Référence"     value={movement.reference || '—'} />
                        <Detail icon={Calendar}  label="Date du mouvement" value={movementDate.toLocaleString('fr-FR')} />
                      </div>
                    </Section>

                    {/* Détails financiers */}
                    {(movement.unit_cost || movement.currency) && (
                      <Section title="Détails financiers">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {movement.unit_cost && (
                            <Detail
                              icon={BadgeEuro}
                              label="Coût unitaire"
                              value={`${movement.unit_cost} ${movement.currency?.symbol || ''}`}
                            />
                          )}
                          {movement.currency && (
                            <Detail
                              icon={BadgeEuro}
                              label="Devise"
                              value={`${movement.currency.code} (${movement.currency.symbol})`}
                            />
                          )}
                        </div>
                      </Section>
                    )}

                    {/* Relations */}
                    <Section title="Relations">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Detail icon={UserIcon}  label="Utilisateur"  value={movement.user.name} />
                        <Detail icon={Truck}     label="Fournisseur"  value={movement.provider?.name || '—'} />
                        <Detail icon={AlertCircle} label="Motif"      value={movement.movement_reason?.name || '—'} />
                      </div>
                    </Section>

                    {/* Notes */}
                    {movement.notes && (
                      <Section title="Notes">
                        <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                          {movement.notes}
                        </p>
                      </Section>
                    )}

                    {/* Métadonnées */}
                    <Section title="Métadonnées">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Detail icon={Calendar} label="Créé le"       value={created.toLocaleString('fr-FR')} />
                        {updated && <Detail icon={Calendar} label="Mis à jour le" value={updated.toLocaleString('fr-FR')} />}
                      </div>
                    </Section>
                  </div>
                )}

                {/* -------- PIÈCES JOINTES -------- */}
                {activeTab === 'attachments' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white/90 border-b border-slate-200 dark:border-slate-700 pb-2">
                      Pièces jointes ({movement.attachments.length})
                    </h3>

                    {movement.attachments.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {movement.attachments.map(attachment => (
                          <div
                            key={attachment.id}
                            className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition bg-white dark:bg-white/5 backdrop-blur-md"
                          >
                            <div className="flex items-start gap-3">
                              <FileText className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 dark:text-white truncate">
                                  {attachment.filename}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {attachment.mime_type} • {(attachment.size / 1024).toFixed(1)} Ko
                                </p>
                                <div className="flex gap-2 mt-3">
                                  <a
                                    href={`/storage/${attachment.path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    Télécharger
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 italic text-center py-8">
                        Aucune pièce jointe.
                      </p>
                    )}
                  </div>
                )}

                {/* -------- HISTORIQUE -------- */}
                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white/90 border-b border-slate-200 dark:border-slate-700 pb-2">
                      Historique
                    </h3>

                    <TimelineItem
                      color="bg-green-500"
                      title="Mouvement créé"
                      subtitle={`${created.toLocaleString('fr-FR')} par ${movement.user.name}`}
                    />

                    {updated && updated.getTime() !== created.getTime() && (
                      <TimelineItem
                        color="bg-blue-500"
                        title="Mouvement modifié"
                        subtitle={updated.toLocaleString('fr-FR')}
                      />
                    )}

                    {isDeleted && (
                      <TimelineItem
                        color="bg-red-500"
                        title="Mouvement supprimé"
                        subtitle={new Date(movement.deleted_at!).toLocaleString('fr-FR')}
                        fade
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </AppLayout>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* UI helpers                                                         */
/* ------------------------------------------------------------------ */

const Badge = ({ text, color }: { text: string; color: string }) => (
  <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium select-none tracking-wide ${color}`}>
    {text}
  </span>
)

const Meta = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <p>
    <span className="text-slate-500 dark:text-slate-400">{label} : </span>
    <span className="font-medium text-slate-900 dark:text-white">{value}</span>
  </p>
)

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white/90 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
      {title}
    </h3>
    {children}
  </div>
)

const Detail = ({
  icon: Icon, label, value,
}: { icon: typeof Layers; label: string; value: React.ReactNode }) => (
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
  tab, active, setActive,
}: { tab: Tab; active: Tab; setActive: (t: Tab) => void }) => {
  const icons: Record<Tab, JSX.Element> = {
    details:     <Info     className="inline w-4 h-4 mr-2" />,
    attachments: <FileText className="inline w-4 h-4 mr-2" />,
    history:     <Calendar className="inline w-4 h-4 mr-2" />,
  }

  const labels: Record<Tab, string> = {
    details: 'Détails',
    attachments: 'Pièces jointes',
    history: 'Historique',
  }

  const isActive = active === tab

  return (
    <button
      onClick={() => setActive(tab)}
      className={`w-full px-4 py-3 text-left text-sm font-medium transition flex items-center
        ${isActive
          ? 'bg-gradient-to-r from-red-600 to-red-500 text-white rounded-l-xl shadow-inner'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50/5 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white'}
      `}
    >
      {icons[tab]} {labels[tab]}
    </button>
  )
}

const TimelineItem = ({
  color, title, subtitle, fade = false,
}: { color: string; title: string; subtitle: string; fade?: boolean }) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg ${
    fade ? 'bg-red-50/20 dark:bg-red-900/15' : 'bg-slate-50/5 dark:bg-slate-800/30'
  }`}>
    <div className={`w-2 h-2 ${color} rounded-full`} />
    <div>
      <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
  </div>
)
