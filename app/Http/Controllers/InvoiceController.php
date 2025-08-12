<?php

namespace App\Http\Controllers;

use App\Actions\ConvertQuoteToInvoiceAction;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Quote;
use App\Models\Product;
use App\Models\TaxRate;
use App\Models\Currency;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    /**
     * Listing + filtres + pagination
     */
    public function index(Request $request): Response
    {
        $perPage = (int) $request->input('per_page', 15);

        $filters = [
            'search'    => $request->string('search')->toString() ?: null,
            'status'    => $request->string('status')->toString() ?: null,
            'client_id' => $request->string('client_id')->toString() ?: null,
        ];

        $query = Invoice::with('client')->withCount('lines');

        if ($filters['search']) {
            $s = $filters['search'];
            $query->where(function ($q) use ($s) {
                $q->where('number', 'like', "%{$s}%")
                  ->orWhereHas('client', fn($c) => $c->where('company_name', 'like', "%{$s}%"));
            });
        }
        if ($filters['status']) {
            $query->where('status', $filters['status']);
        }
        if ($filters['client_id']) {
            $query->where('client_id', $filters['client_id']);
        }

        $invoices = $query
            ->orderByDesc('date')
            ->paginate($perPage)
            ->withQueryString()
            ->through(function (Invoice $inv) {
                return [
                    'id'             => $inv->id,
                    'invoice_number' => $inv->number,
                    'invoice_date'   => optional($inv->date)->toDateString(),
                    'status'         => $inv->status,
                    'subtotal_ht'    => (float) $inv->total_ht,
                    'total_tax'      => (float) $inv->total_tva,
                    'total_ttc'      => (float) $inv->total_ttc,
                    'currency'       => [
                        'code'   => config('app.currency_code', 'MAD'),
                        'symbol' => config('app.currency_symbol', 'MAD'),
                    ],
                    'client' => [
                        'id'           => $inv->client?->id,
                        'company_name' => $inv->client?->company_name,
                        'contact_name' => $inv->client?->contact_name ?? null,
                    ],
                    'user'        => null,
                    'items_count' => (int) ($inv->lines_count ?? 0),
                    'deleted_at'  => $inv->deleted_at,
                    'created_at'  => $inv->created_at?->toDateTimeString(),
                ];
            });

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'clients'  => Client::select('id', 'company_name')->orderBy('company_name')->get(),
            'filters'  => $filters,
            'statuses' => Invoice::statuses(), // utile pour le filtre côté UI
        ]);
    }

    /**
     * Affichage détaillé d'une facture
     */
    public function show(string $id): Response
    {
        $invoice = Invoice::with([
            'client:id,company_name,contact_name',
            'lines.product:id,sku,name',
            'statusHistories.user:id,name',
        ])->findOrFail($id);

        $currencyCode   = config('app.currency_code',  'MAD');
        $currencySymbol = config('app.currency_symbol','MAD');

        $items = $invoice->lines->map(function ($ln) {
            return [
                'id'                     => $ln->id,
                'product_name_snapshot'  => $ln->designation ?? ($ln->product->name ?? ''),
                'product_sku_snapshot'   => $ln->product->sku ?? '',
                'quantity'               => (float) ($ln->quantity ?? 0),
                'unit_price_ht_snapshot' => $ln->unit_price_ht !== null ? (float) $ln->unit_price_ht : null,
                'tax_rate_snapshot'      => $ln->tax_rate      !== null ? (float) $ln->tax_rate      : null,
                'unit_price_ht'          => $ln->unit_price_ht !== null ? (float) $ln->unit_price_ht : null,
                'tax_rate'               => $ln->tax_rate      !== null ? (float) $ln->tax_rate      : null,
                'product'                => $ln->product ? ['name' => $ln->product->name, 'sku' => $ln->product->sku] : null,
            ];
        })->values();

        $histories = $invoice->statusHistories->sortBy('created_at')->values();

        $statusHistories = [];
        $prev = null;
        foreach ($histories as $h) {
            $statusHistories[] = [
                'from_status' => $h->from_status ?? $prev,
                'to_status'   => $h->to_status ?? $h->status,
                'comment'     => $h->comment ?? null,
                'created_at'  => $h->created_at?->toISOString(),
                'user'        => $h->relationLoaded('user') && $h->user ? ['name' => $h->user->name] : null,
            ];
            $prev = $h->to_status ?? $h->status;
        }

        $payload = [
            'id'               => $invoice->id,
            'invoice_number'   => $invoice->number ?? $invoice->invoice_number ?? '',
            'status'           => (string) $invoice->status,
            'invoice_date'     => optional($invoice->date)->toDateString(),
            'due_date'         => optional($invoice->due_date)->toDateString(),
            'currency_code'    => $currencyCode,
            'currency_symbol'  => $currencySymbol,
            'client'           => [
                'id'            => $invoice->client?->id,
                'company_name'  => $invoice->client?->company_name ?? '',
                'contact_name'  => $invoice->client?->contact_name ?? null,
            ],
            'items'            => $items,
            'terms_conditions' => $invoice->terms_conditions ?? null,
            'notes'            => $invoice->notes ?? null,
            'internal_notes'   => $invoice->internal_notes ?? null,
            'status_histories' => $statusHistories,
            'is_overdue'       => $invoice->isOverdue(),
        ];

        return Inertia::render('Invoices/Show', [
            'invoice'  => $payload,
            'statuses' => Invoice::statuses(),
        ]);
    }

    /**
     * Export PDF d'une facture
     */
    public function exportPdf(string $id)
    {
        $invoice = Invoice::with(['client','lines.product','currency'])->findOrFail($id);
        $pdf = Pdf::loadView('pdf.invoice', compact('invoice'));

        return $pdf->stream("Facture_{$invoice->number}.pdf");
    }

    /**
     * Édition d'une facture (seulement en brouillon)
     */
    public function edit(string $id): Response|RedirectResponse
    {
        $invoice = Invoice::with(['client', 'lines.product'])->findOrFail($id);

        if (!$invoice->canBeEdited()) {
            return redirect()
                ->route('invoices.show', $invoice)
                ->with('error', 'Seules les factures en brouillon peuvent être modifiées.');
        }

        return Inertia::render('Invoices/Edit', [
            'invoice'    => $invoice,
            'clients'    => Client::active()->orderBy('company_name')->get(),
            'products'   => Product::with(['brand','category','currency','taxRate'])
                                   ->where('is_active', true)
                                   ->orderBy('name')
                                   ->get(),
            'currencies' => Currency::all(),
            'taxRates'   => TaxRate::all(),
            'statuses'   => Invoice::statuses(),
        ]);
    }

    /**
     * Mise à jour d'une facture
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $invoice = Invoice::findOrFail($id);

        if (!$invoice->canBeEdited()) {
            return back()->with('error', 'Seules les factures en brouillon peuvent être modifiées.');
        }

        $data = $request->validate([
            'client_id'             => 'required|exists:clients,id',
            'date'                  => 'required|date',
            'due_date'              => 'required|date|after_or_equal:date',
            'notes'                 => 'nullable|string',
            'terms_conditions'      => 'nullable|string',
            'items'                 => 'required|array|min:1',
            'items.*.product_id'    => 'required|exists:products,id',
            'items.*.quantity'      => 'required|numeric|min:0.01',
            'items.*.unit_price_ht' => 'required|numeric|min:0',
            'items.*.tax_rate'      => 'required|numeric|min:0|max:100',
        ]);

        $invoice->update([
            'client_id'        => $data['client_id'],
            'date'             => $data['date'],
            'due_date'         => $data['due_date'],
            'notes'            => $data['notes'] ?? null,
            'terms_conditions' => $data['terms_conditions'] ?? null,
        ]);

        // Remplacer les lignes
        $invoice->lines()->delete();

        foreach ($data['items'] as $item) {
            $product = Product::findOrFail($item['product_id']);

            $invoice->lines()->create([
                'product_id'        => $product->id,
                'designation'       => $product->name,
                'quantity'          => $item['quantity'],
                'unit_price_ht'     => $item['unit_price_ht'],
                'tax_rate'          => $item['tax_rate'],
                'line_total_ht'     => $item['quantity'] * $item['unit_price_ht'],
            ]);
        }

        // Recalcul totaux
        $invoice->load('lines');
        $invoice->calculateTotals();

        return redirect()
            ->route('invoices.show', $invoice)
            ->with('success', 'Facture mise à jour avec succès.');
    }

    /**
     * Changement de statut (avec historique)
     */
    public function changeStatus(Request $request, string $id): RedirectResponse
    {
        $invoice = Invoice::findOrFail($id);

        $data = $request->validate([
            'status'  => ['required','string', Rule::in(Invoice::statuses())],
            'comment' => ['nullable','string'],
        ]);

        $allowedTransitions = [
            Invoice::STATUS_DRAFT          => [Invoice::STATUS_SENT, Invoice::STATUS_ISSUED, Invoice::STATUS_CANCELLED],
            Invoice::STATUS_SENT           => [Invoice::STATUS_ISSUED, Invoice::STATUS_PAID, Invoice::STATUS_PARTIALLY_PAID, Invoice::STATUS_CANCELLED],
            Invoice::STATUS_ISSUED         => [Invoice::STATUS_PAID, Invoice::STATUS_PARTIALLY_PAID, Invoice::STATUS_CANCELLED],
            Invoice::STATUS_PARTIALLY_PAID => [Invoice::STATUS_PAID, Invoice::STATUS_CANCELLED],
            Invoice::STATUS_PAID           => [Invoice::STATUS_REFUNDED],
            Invoice::STATUS_CANCELLED      => [],
            Invoice::STATUS_REFUNDED       => [],
        ];

        $currentStatus = (string) $invoice->status;
        $newStatus     = (string) $data['status'];

        if (!isset($allowedTransitions[$currentStatus]) || !in_array($newStatus, $allowedTransitions[$currentStatus], true)) {
            return back()->with('error', 'Transition de statut non autorisée.');
        }

        $from = $currentStatus;
        $invoice->update(['status' => $newStatus]);

        $invoice->statusHistories()->create([
            'user_id'     => Auth::id(),
            'from_status' => $from,
            'to_status'   => $newStatus,
            'comment'     => $data['comment'] ?? null,
        ]);

        return back()->with('success', 'Statut de la facture mis à jour.');
    }

    /**
     * Duplication d'une facture
     */
    public function duplicate(string $id): RedirectResponse
    {
        $original = Invoice::with('lines')->findOrFail($id);

        $duplicate = $original->replicate();
        $duplicate->number   = Invoice::generateInvoiceNumber();
        $duplicate->status   = Invoice::STATUS_DRAFT;
        $duplicate->date     = now()->toDateString();
        $duplicate->due_date = now()->addDays(30)->toDateString();
        $duplicate->save();

        foreach ($original->lines as $line) {
            $newLine = $line->replicate();
            $newLine->invoice_id = $duplicate->id;
            $newLine->save();
        }

        return redirect()
            ->route('invoices.show', $duplicate)
            ->with('success', 'Facture dupliquée avec succès.');
    }

    /**
     * Marquer comme payée
     */
    public function markAsPaid(string $id): RedirectResponse
    {
        $invoice = Invoice::findOrFail($id);

        $eligible = in_array($invoice->status, [
            Invoice::STATUS_SENT,
            Invoice::STATUS_ISSUED,
            Invoice::STATUS_PARTIALLY_PAID,
        ], true) || $invoice->isOverdue();

        if (!$eligible) {
            return back()->with('error', 'Cette facture ne peut pas être marquée comme payée.');
        }

        $from = (string) $invoice->status;
        $invoice->update(['status' => Invoice::STATUS_PAID]);

        $invoice->statusHistories()->create([
            'user_id'     => Auth::id(),
            'from_status' => $from,
            'to_status'   => Invoice::STATUS_PAID,
            'comment'     => 'Facture marquée comme payée',
        ]);

        return back()->with('success', 'Facture marquée comme payée.');
    }

    /**
     * Envoyer la facture
     */
    public function send(string $id): RedirectResponse
    {
        $invoice = Invoice::findOrFail($id);

        if (!in_array($invoice->status, [Invoice::STATUS_DRAFT, Invoice::STATUS_CANCELLED], true)) {
            return back()->with('error', 'Cette facture ne peut pas être envoyée.');
        }

        $from = (string) $invoice->status;
        $invoice->update(['status' => Invoice::STATUS_SENT]);

        $invoice->statusHistories()->create([
            'user_id'     => Auth::id(),
            'from_status' => $from,
            'to_status'   => Invoice::STATUS_SENT,
            'comment'     => 'Facture envoyée au client',
        ]);

        // TODO: logiques d’envoi email si besoin

        return back()->with('success', 'Facture envoyée avec succès.');
    }

    /**
     * Envoyer un rappel de paiement (basé sur la logique "overdue" calculée)
     */
    public function sendReminder(string $id): RedirectResponse
    {
        $invoice = Invoice::findOrFail($id);

        if (!$invoice->isOverdue()) {
            return back()->with('error', 'Seules les factures en retard (échéance dépassée) peuvent recevoir un rappel.');
        }

        // TODO: logiques d’envoi du rappel par email

        return back()->with('success', 'Rappel de paiement envoyé avec succès.');
    }

    /**
     * Réouvrir une facture remboursée (la remettre en brouillon)
     */
    public function reopen(string $id): RedirectResponse
    {
        $invoice = Invoice::findOrFail($id);

        if (!$invoice->canBeReopened()) {
            return back()->with('error', 'Seules les factures remboursées peuvent être réouvertes.');
        }

        $from = (string) $invoice->status;
        $invoice->update(['status' => Invoice::STATUS_DRAFT]);

        $invoice->statusHistories()->create([
            'user_id'     => Auth::id(),
            'from_status' => $from,
            'to_status'   => Invoice::STATUS_DRAFT,
            'comment'     => 'Facture réouverte et remise en brouillon',
        ]);

        return back()->with('success', 'Facture réouverte avec succès.');
    }

    /**
     * Conversion d'un devis en facture
     */
    public function convertFromQuote(Quote $quote, ConvertQuoteToInvoiceAction $action): RedirectResponse
    {
        $quote->load('items');

        $invoice = $action->handle($quote);

        return redirect()
            ->route('invoices.show', $invoice->id)
            ->with('success', 'Facture créée à partir du devis.');
    }

    /**
     * Suppression soft-delete
     */
    public function destroy(string $id): RedirectResponse
    {
        $invoice = Invoice::findOrFail($id);

        if (!$invoice->canBeDeleted()) {
            return back()->with('error', 'Seules les factures en brouillon ou annulées peuvent être supprimées.');
        }

        $invoice->delete();

        return redirect()
            ->route('invoices.index')
            ->with('success', 'Facture supprimée.');
    }
}
