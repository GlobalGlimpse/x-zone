@@ .. @@
import { Head, Link, router } from '@inertiajs/react'
+import { usePage } from '@inertiajs/react'
 import { route } from 'ziggy-js'
@@ .. @@
+import type { PageProps } from '@/types'

 /* ------------------------------------------------------------------ */
 /* Types & Props                                                      */
@@ .. @@
 interface Props {
   invoice: Invoice
+  statuses: InvoiceStatus[]
 }

 /* ------------------------------------------------------------------ */
 /* Main component                                                     */
 /* ------------------------------------------------------------------ */
-export default function InvoiceShow({ invoice }: Props) {
+export default function InvoiceShow({ invoice, statuses }: Props) {
+  const { auth } = usePage<PageProps>().props
+  
   /* ───────── state pour les onglets et menus ───────── */
@@ .. @@
   const sendReminder = () => {
     if (!confirm('Envoyer un rappel de paiement au client ?')) return
     router.post(route('invoices.send-reminder', invoice.id), {}, {
       preserveScroll: true,
     })
   }

+  const reopenInvoice = () => {
+    if (!confirm('Réouvrir cette facture remboursée ? Elle sera remise en brouillon.')) return
+    router.post(route('invoices.reopen', invoice.id), {}, {
+      preserveScroll: true,
+    })
+  }

   /* → 1. L'utilisateur choisit un nouveau statut */
@@ .. @@
               sendInvoice={sendInvoice}
               markAsPaid={markAsPaid}
               sendReminder={sendReminder}
+              reopenInvoice={reopenInvoice}
+              canReopen={auth.user?.roles?.some(role => 
+                ['SuperAdmin', 'Admin'].includes(role.name)
+              ) || false}
               transitions={transitions}
@@ .. @@
   sendInvoice: () => void
   markAsPaid: () => void
   sendReminder: () => void
+  reopenInvoice: () => void
+  canReopen: boolean
   transitions: Partial<Record<InvoiceStatus, InvoiceStatus[]>>
@@ .. @@
       )}

+      {/* Bouton Réouvrir (seulement pour les factures remboursées + permission) */}
+      {invoice.status === 'refunded' && canReopen && (
+        <Button
+          variant="secondary"
+          className="w-full sm:w-auto"
+          onClick={reopenInvoice}
+        >
+          <RotateCcw className="w-4 h-4 mr-2" />
+          Réouvrir
+        </Button>
+      )}
+
       {/* Menu Changer statut (options dynamiques alignées BE) */}