<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\{
    Quote,
    Client,
    Product,
    Currency,
    TaxRate,
    Order,
    User
};
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Actions\ConvertQuoteToInvoiceAction;

/**
 * Contrôleur complet pour la gestion des devis :
 * - listing, création, duplication, édition, suppression
 * - changement de statut
 * - conversion en commande
 * - export PDF
 */
class QuoteController extends Controller
{
    /* -----------------------------------------------------------------
     | INDEX
     |-----------------------------------------------------------------*/
    public function index(Request $request): Response
    {
        $query = Quote::with(['client', 'user', 'currency'])
            ->withCount('items');

        /* Filtres */
        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(fn ($q) => $q
                ->where('quote_number', 'like', "%{$search}%")
                ->orWhereHas('client', fn ($c) =>
                    $c->where('company_name', 'like', "%{$search}%")));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->integer('client_id'));
        }

        $quotes = $query->latest()
            ->paginate($request->integer('per_page', 15))
            ->appends($request->all());

        return Inertia::render('Quotes/Index', [
            'quotes'  => $quotes,
            'filters' => $request->only(['search', 'status', 'client_id']),
            'clients' => Client::active()
                ->orderBy('company_name')
                ->get(['id', 'company_name']),
        ]);
    }

    /* -----------------------------------------------------------------
     | CREATE (formulaire  duplication)
     |-----------------------------------------------------------------*/
    public function create(Request $request): Response
    {
        $duplicateQuote = null;

        if ($request->filled('duplicate')) {
            /** @var Quote $src */
            $src = Quote::with('items.product.taxRate')
                        ->findOrFail($request->integer('duplicate'));

            /* Normalise les items pour qu'ils correspondent au
               schéma attendu côté React (unit_price_ht / tax_rate) */
            $duplicateQuote = [
                'client_id'        => $src->client_id,
                'currency_code'    => $src->currency_code,
                'quote_date'       => $src->quote_date->toDateString(),
                'valid_until'      => $src->valid_until->toDateString(),
                'terms_conditions' => $src->terms_conditions,
                'notes'            => $src->notes,
                'internal_notes'   => $src->internal_notes,
                'items'            => $src->items->map(fn ($it) => [
                    'product_id'    => (string) $it->product_id,
                    'quantity'      => (float)  $it->quantity,
                    'unit_price_ht' => (float) ($it->unit_price_ht_snapshot
                                         ?? $it->product->price_ht
                                         ?? 0),
                    'tax_rate'      => (float) ($it->tax_rate_snapshot
                                         ?? optional($it->product->taxRate)->rate
                                         ?? 0),
                ]),
            ];
        }

        return Inertia::render('Quotes/Create', [
            'clients'        => Client::active()->orderBy('company_name')->get(),
            'products'       => Product::with(['brand','category','currency','taxRate'])
                                       ->where('is_active', true)
                                       ->orderBy('name')
                                       ->get(),
            'currencies'     => Currency::all(),
            'taxRates'       => TaxRate::all(),
            'duplicateQuote' => $duplicateQuote,
        ]);
    }

    /* -----------------------------------------------------------------
     | STORE
     |-----------------------------------------------------------------*/
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'client_id'             => 'required|exists:clients,id',
            'quote_date'            => 'required|date',
            'valid_until'           => 'required|date|after:quote_date',
            'currency_code'         => 'required|exists:currencies,code',
            'terms_conditions'      => 'nullable|string',
            'notes'                 => 'nullable|string',
            'internal_notes'        => 'nullable|string',
            'items'                 => 'required|array|min:1',
            'items.*.product_id'    => 'required|exists:products,id',
            'items.*.quantity'      => 'required|numeric|min:0.01',
            'items.*.unit_price_ht' => 'required|numeric|min:0',
            'items.*.tax_rate'      => 'required|numeric|min:0|max:100',
        ]);

        $client = Client::findOrFail($data['client_id']);

        $quote = Quote::create([
            'client_id'        => $data['client_id'],
            'user_id'          => Auth::id(),
            'quote_date'       => $data['quote_date'],
            'valid_until'      => $data['valid_until'],
            'currency_code'    => $data['currency_code'],
            'terms_conditions' => $data['terms_conditions'],
            'notes'            => $data['notes'],
            'internal_notes'   => $data['internal_notes'],
            'client_snapshot'  => $client->toSnapshot(),
        ]);

        foreach ($data['items'] as $i => $item) {
            $product = Product::with('taxRate')->findOrFail($item['product_id']);

            $quote->items()->create([
                'product_id'                   => $product->id,
                'product_name_snapshot'        => $product->name,
                'product_description_snapshot' => $product->description,
                'product_sku_snapshot'         => $product->sku,
                'unit_price_ht_snapshot'       => $item['unit_price_ht'],
                'tax_rate_snapshot'            => $item['tax_rate'],
                'quantity'                     => $item['quantity'],
                'sort_order'                   => $i,
            ]);
        }

        return redirect()
            ->route('quotes.show', $quote)
            ->with('success', 'Devis créé avec succès.');
    }

    /* -----------------------------------------------------------------
     | SHOW
     |-----------------------------------------------------------------*/
    public function show(Quote $quote): Response
    {
        $quote->load([
            'client','user','currency',
            'items.product','statusHistories.user','order',
        ]);

        /* Rendre visibles les champs snapshot / montants */
        $quote->items->each->makeVisible([
            'unit_price_ht_snapshot','tax_rate_snapshot',
            'quantity','line_total_ht','line_tax_amount',
            'line_total_ttc','sort_order',
        ]);

        /* Fallback si snapshot manquant */
        $quote->items->each(function ($item) {
            if (is_null($item->unit_price_ht_snapshot)) {
                $item->unit_price_ht_snapshot = (float) ($item->product->price_ht ?? 0);
            }
            if (is_null($item->tax_rate_snapshot)) {
                $item->tax_rate_snapshot =
                    (float) optional($item->product->taxRate)->rate ?? 0;
            }
        });

        return Inertia::render('Quotes/Show', ['quote' => $quote]);
    }

    /* -----------------------------------------------------------------
     | EDIT
     |-----------------------------------------------------------------*/
    public function edit(Quote $quote): Response|RedirectResponse
    {
        if ($quote->status !== 'draft') {
            return redirect()
                ->route('quotes.show', $quote)
                ->with('error', 'Seuls les devis en brouillon peuvent être modifiés.');
        }

        $quote->load(['client','items.product']);

        return Inertia::render('Quotes/Edit', [
            'quote'      => $quote,
            'clients'    => Client::active()->orderBy('company_name')->get(),
            'products'   => Product::with(['brand','category','currency','taxRate'])
                                   ->where('is_active', true)
                                   ->orderBy('name')
                                   ->get(),
            'currencies' => Currency::all(),
            'taxRates'   => TaxRate::all(),
        ]);
    }

    /* -----------------------------------------------------------------
     | UPDATE
     |-----------------------------------------------------------------*/
    public function update(Request $request, Quote $quote): RedirectResponse
    {
        if ($quote->status !== 'draft') {
            return back()->with('error', 'Seuls les devis en brouillon peuvent être modifiés.');
        }

        $data = $request->validate([
            'client_id'             => 'required|exists:clients,id',
            'quote_date'            => 'required|date',
            'valid_until'           => 'required|date|after:quote_date',
            'currency_code'         => 'required|exists:currencies,code',
            'terms_conditions'      => 'nullable|string',
            'notes'                 => 'nullable|string',
            'internal_notes'        => 'nullable|string',
            'items'                 => 'required|array|min:1',
            'items.*.product_id'    => 'required|exists:products,id',
            'items.*.quantity'      => 'required|numeric|min:0.01',
            'items.*.unit_price_ht' => 'required|numeric|min:0',
            'items.*.tax_rate'      => 'required|numeric|min:0|max:100',
        ]);

        $client = Client::findOrFail($data['client_id']);

        $quote->update([
            'client_id'        => $data['client_id'],
            'quote_date'       => $data['quote_date'],
            'valid_until'      => $data['valid_until'],
            'currency_code'    => $data['currency_code'],
            'terms_conditions' => $data['terms_conditions'],
            'notes'            => $data['notes'],
            'internal_notes'   => $data['internal_notes'],
            'client_snapshot'  => $client->toSnapshot(),
        ]);

        /* Remplace complètement les items pour garder le snapshot cohérent */
        $quote->items()->delete();

        foreach ($data['items'] as $i => $item) {
            $product = Product::with('taxRate')->findOrFail($item['product_id']);

            $quote->items()->create([
                'product_id'                   => $product->id,
                'product_name_snapshot'        => $product->name,
                'product_description_snapshot' => $product->description,
                'product_sku_snapshot'         => $product->sku,
                'unit_price_ht_snapshot'       => $item['unit_price_ht'],
                'tax_rate_snapshot'            => $item['tax_rate'],
                'quantity'                     => $item['quantity'],
                'sort_order'                   => $i,
            ]);
        }

        return redirect()
            ->route('quotes.show', $quote)
            ->with('success', 'Devis mis à jour avec succès.');
    }

    /* -----------------------------------------------------------------
     | DESTROY
     |-----------------------------------------------------------------*/
    public function destroy(Quote $quote): RedirectResponse
    {
        if (!in_array($quote->status, ['draft', 'rejected'], true)) {
            return back()->with('error', 'Seuls les devis en brouillon ou refusés peuvent être supprimés.');
        }

        $quote->delete();

        return redirect()
            ->route('quotes.index')
            ->with('success', 'Devis supprimé.');
    }

    /* -----------------------------------------------------------------
     | CHANGE STATUS
     |-----------------------------------------------------------------*/
    public function changeStatus(Request $request, Quote $quote): RedirectResponse
    {
        $data = $request->validate([
            'status'  => 'required|string',
            'comment' => 'nullable|string',
        ]);

        $ok = $quote->changeStatus($data['status'], Auth::user(), $data['comment'] ?? null);

        return back()->with(
            $ok ? 'success' : 'error',
            $ok ? 'Statut du devis mis à jour.' : 'Transition de statut non autorisée.'
        );
    }

    /* -----------------------------------------------------------------
     | CONVERT TO ORDER
     |-----------------------------------------------------------------*/
    public function convertToOrder(Quote $quote): RedirectResponse
     {
         if (!$quote->can_be_converted) {
             return back()->with('error', 'Ce devis ne peut pas être converti en commande.');
         }

         $order = $quote->convertToOrder(Auth::user());

         if (!$order) {
             return back()->with('error', 'Erreur lors de la conversion en commande.');
         }

         return redirect()
             ->route('orders.show', $order)
             ->with('success', "Devis converti en commande #{$order->order_number}");
     }

    /* -----------------------------------------------------------------
     | CONVERT TO INVOICE
     |-----------------------------------------------------------------*/
    public function convertToInvoice(Request $request, Quote $quote, ConvertQuoteToInvoiceAction $convertAction): RedirectResponse
    {
        if ($quote->status !== 'accepted') {
            return redirect()
                ->route('quotes.show', $quote)
                ->with('error', 'Seuls les devis acceptés peuvent être convertis en facture');
        }

        $validated = $request->validate([
            'invoice_date' => 'required|date',
            'invoice_due_date' => 'required|date|after_or_equal:invoice_date',
            'invoice_notes' => 'nullable|string',
        ]);

        try {
            DB::transaction(function () use ($quote, $validated, $convertAction) {
                // Charger les items du devis
                $quote->load('items.product');

                $invoice = $convertAction->handle($quote, [
                    'date' => $validated['invoice_date'],
                    'due_date' => $validated['invoice_due_date'],
                    'notes' => $validated['invoice_notes'],
                ]);

                // Enregistrer l'historique de changement de statut
                $quote->statusHistories()->create([
                    'from_status' => 'accepted',
                    'to_status' => 'converted',
                    'comment' => 'Converti en facture #' . $invoice->number,
                    'user_id' => Auth::id(),
                ]);

                // Mettre à jour le statut du devis
                $quote->update([
                    'status' => 'converted',
                    'converted_at' => now(),
                ]);
            });

            return redirect()
                ->route('quotes.show', $quote)
                ->with('success', 'Devis converti en facture avec succès');

        } catch (\Exception $e) {
            \Log::error('Erreur conversion devis vers facture', [
                'quote_id' => $quote->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()
                ->route('quotes.show', $quote)
                ->with('error', 'Erreur lors de la conversion : ' . $e->getMessage());
        }
    }

    /* -----------------------------------------------------------------
     | DUPLICATE (redirection vers create)
     |-----------------------------------------------------------------*/
    public function duplicate(Quote $quote): RedirectResponse
    {
        return redirect()->route('quotes.create', ['duplicate' => $quote->id]);
    }

    /* -----------------------------------------------------------------
     | EXPORT PDF
     |-----------------------------------------------------------------*/
    public function export(Quote $quote)
    {
        $quote->load(['client', 'items.product', 'currency']);

        $pdf = Pdf::loadView('pdf.quote', compact('quote'));

        return $pdf->stream("Devis_{$quote->quote_number}.pdf");
    }
}
