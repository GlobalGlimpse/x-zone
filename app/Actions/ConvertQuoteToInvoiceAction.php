<?php

namespace App\Actions;

use App\Models\Quote;
use App\Models\Invoice;
use App\Models\InvoiceLine;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ConvertQuoteToInvoiceAction
{
    /**
     * Convertit un devis en facture
     */
    public function handle(Quote $quote, array $customData = []): Invoice
    {
        // S'assurer que les items sont chargés
        if (!$quote->relationLoaded('items')) {
            $quote->load('items');
        }

        // Générer le numéro de facture de manière sécurisée
        $invoiceNumber = DB::transaction(function () {
            return Invoice::generateInvoiceNumber();
        });

        // Calculer les totaux depuis les items du devis
        $totalHt = $quote->items->sum('line_total_ht');
        $totalTva = $quote->items->sum('line_tax_amount');
        $totalTtc = $quote->items->sum('line_total_ttc');

        // Création de la facture avec les données personnalisées ou par défaut
        $invoice = Invoice::create([
            'id'               => Str::uuid(),
            'number'           => $invoiceNumber,
            'client_id'        => $quote->client_id,
            'date'             => $customData['date'] ?? now(),
            'due_date'         => $customData['due_date'] ?? now()->addDays(30),
            'status'           => Invoice::STATUS_DRAFT,
            'total_ht'         => $totalHt,
            'total_tva'        => $totalTva,
            'total_ttc'        => $totalTtc,
            'notes'            => $customData['notes'] ?? $quote->notes,
            'internal_notes'   => $quote->internal_notes,
            'terms_conditions' => $quote->terms_conditions,
        ]);

        // Copier les lignes du devis dans la facture
        foreach ($quote->items as $item) {
            InvoiceLine::create([
                'id'            => Str::uuid(),
                'invoice_id'    => $invoice->id,
                'product_id'    => $item->product_id,
                'designation'   => $item->product_name_snapshot,
                'quantity'      => $item->quantity,
                'unit_price_ht' => $item->unit_price_ht_snapshot,
                'discount_rate' => 0,
                'tax_rate'      => $item->tax_rate_snapshot,
                'line_total_ht' => $item->line_total_ht,
            ]);
        }

        return $invoice;
    }
}
