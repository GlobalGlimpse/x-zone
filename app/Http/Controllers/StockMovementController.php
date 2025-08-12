<?php

namespace App\Http\Controllers;

use App\Http\Requests\StockMovementRequest;
use App\Models\{
    StockMovement,
    StockMovementAttachment,
    Product,
    Currency,
    Provider,
    StockMovementReason
};
use Illuminate\Http\{
    Request,
    RedirectResponse
};
use Illuminate\Support\Facades\{
    Auth,
    Storage
};
use Inertia\Inertia;
use Inertia\Response;

class StockMovementController extends Controller
{
    /* -----------------------------------------------------------------
     |  LISTE + FILTRES
     |----------------------------------------------------------------- */
    public function index(Request $request): Response
    {
        $query = StockMovement::query()
            ->with([
                'product:id,name,sku',
                'user:id,name',
                'currency:code,symbol',
                'attachments',
                'provider:id,name',
                'movementReason:id,name',
            ])
            ->withTrashed(); // inclure soft-deleted

        /* -------- filtres dynamiques -------- */
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('supplier',  'like', "%{$search}%")
                  ->orWhere('reason',    'like', "%{$search}%");
            });
        }

        $query->when($request->filled('type'),
            fn ($q) => $q->where('type', $request->type));

        $query->when($request->filled('product_id'),
            fn ($q) => $q->where('product_id', $request->product_id));

        if ($request->filled(['start_date', 'end_date'])) {
            $query->whereBetween('movement_date', [
                $request->start_date . ' 00:00:00',
                $request->end_date   . ' 23:59:59',
            ]);
        }

        /* -------- tri + pagination -------- */
        $sort      = $request->input('sort',       'movement_date');
        $direction = $request->input('direction',  'desc');
        $perPage   = (int) $request->input('per_page', 10);

        $movements = $query->orderBy($sort, $direction)
                           ->paginate($perPage)
                           ->appends($request->all());

        /* -------- produits pour filtre -------- */
        $products = Product::select('id', 'name', 'sku')
                           ->orderBy('name')
                           ->get();

        return Inertia::render('StockMovements/Index', [
            'movements' => $movements,
            'products'  => $products,
            'filters'   => $request->only([
                'search', 'type', 'product_id',
                'start_date', 'end_date',
                'sort', 'direction', 'per_page',
            ]),
        ]);
    }

    /* -----------------------------------------------------------------
     |  CRÉATION
     |----------------------------------------------------------------- */
    public function create(): Response
    {
        return Inertia::render('StockMovements/Create', [
            'products'   => Product::select('id', 'name', 'sku', 'stock_quantity')
                                   ->orderBy('name')->get(),
            'currencies' => Currency::all(['code', 'symbol']),
            'providers'  => Provider::active()->select('id', 'name')
                                   ->orderBy('name')->get(),
            'reasons'    => StockMovementReason::active()
                                   ->select('id', 'name', 'type')
                                   ->orderBy('name')->get(),
        ]);
    }

    public function store(StockMovementRequest $request): RedirectResponse
    {
        $data            = $request->validated();
        $data['user_id'] = Auth::id();

        $movement = StockMovement::create($data);

        /* pièces jointes */
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store("stock-movements/{$movement->id}", 'public');

                StockMovementAttachment::create([
                    'stock_movement_id' => $movement->id,
                    'filename'          => $file->getClientOriginalName(),
                    'path'              => $path,
                    'mime_type'         => $file->getMimeType(),
                    'size'              => $file->getSize(),
                ]);
            }
        }

        $this->updateProductStock($movement);

        return to_route('stock-movements.index')
            ->with('success', 'Mouvement de stock créé avec succès.');
    }

    /* -----------------------------------------------------------------
     |  AFFICHAGE / ÉDITION
     |----------------------------------------------------------------- */
    public function show(StockMovement $stockMovement): Response
    {
        $stockMovement->load([
            'product:id,name,sku,stock_quantity',
            'user:id,name',
            'attachments',
            'currency:code,symbol',
            'provider:id,name',
            'movementReason:id,name',
        ]);

        return Inertia::render('StockMovements/Show', [
            'movement' => $stockMovement,
        ]);
    }

    public function edit(StockMovement $stockMovement): Response
    {
        $stockMovement->load([
            'product:id,name,sku,stock_quantity',
            'attachments',
            'currency:code,symbol',
            'provider:id,name',
            'movementReason:id,name',
        ]);

        return Inertia::render('StockMovements/Edit', [
            'movement'   => $stockMovement,
            'products'   => Product::select('id', 'name', 'sku', 'stock_quantity')
                                   ->orderBy('name')->get(),
            'currencies' => Currency::all(['code', 'symbol']),
            'providers'  => Provider::active()->select('id', 'name')
                                   ->orderBy('name')->get(),
            'reasons'    => StockMovementReason::active()
                                   ->select('id', 'name', 'type')
                                   ->orderBy('name')->get(),
        ]);
    }

    public function update(
        StockMovementRequest $request,
        StockMovement        $stockMovement
    ): RedirectResponse {
        $data = $request->validated();

        /* annule l'ancien mouvement (stock) */
        $this->revertProductStock($stockMovement);

        /* mise à jour */
        $stockMovement->update($data);

        /* suppression des PJ */
        if ($request->filled('deleted_attachment_ids')) {
            StockMovementAttachment::whereIn('id', $request->deleted_attachment_ids)
                ->where('stock_movement_id', $stockMovement->id)
                ->each(function ($a) {
                    Storage::disk('public')->delete($a->path);
                    $a->delete();
                });
        }

        /* ajout de nouvelles PJ */
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store("stock-movements/{$stockMovement->id}", 'public');

                StockMovementAttachment::create([
                    'stock_movement_id' => $stockMovement->id,
                    'filename'          => $file->getClientOriginalName(),
                    'path'              => $path,
                    'mime_type'         => $file->getMimeType(),
                    'size'              => $file->getSize(),
                ]);
            }
        }

        /* applique le nouveau mouvement */
        $this->updateProductStock($stockMovement);

        return to_route('stock-movements.index')
            ->with('success', 'Mouvement de stock mis à jour avec succès.');
    }

    /* -----------------------------------------------------------------
     |  SOFT-DELETE / RESTORE / FORCE-DELETE
     |----------------------------------------------------------------- */
    public function destroy(StockMovement $stockMovement): RedirectResponse
    {
        $this->revertProductStock($stockMovement);
        $stockMovement->attachments()->delete();
        $stockMovement->delete();

        return back()->with('success', 'Mouvement de stock supprimé.');
    }

    public function restore(string $id): RedirectResponse
    {
        $movement = StockMovement::withTrashed()->findOrFail($id);
        $movement->restore();
        $movement->attachments()->withTrashed()->restore();

        $this->updateProductStock($movement);

        return back()->with('success', 'Mouvement de stock restauré.');
    }

    public function forceDelete(string $id): RedirectResponse
    {
        $movement = StockMovement::withTrashed()->findOrFail($id);

        $movement->attachments()->withTrashed()->each(function ($a) {
            Storage::disk('public')->delete($a->path);
            $a->forceDelete();
        });

        $movement->forceDelete();

        return back()->with('success', 'Mouvement supprimé définitivement.');
    }

    /* -----------------------------------------------------------------
     |  RAPPORT (aperçu simplifié)
     |----------------------------------------------------------------- */
    public function report(): Response
    {

        // Récupérer les produits avec leurs mouvements
        $products = Product::with(['category:id,name'])
            ->select('id', 'name', 'sku', 'stock_quantity', 'category_id')
            ->orderBy('name')
            ->get();

        // Calculer les totaux pour chaque produit
        $products = $products->map(function ($product) {
            $movements = StockMovement::where('product_id', $product->id)
                ->whereNull('deleted_at')
                ->get();

            $total_in = $movements->where('type', 'in')->sum('quantity');
            $total_out = $movements->where('type', 'out')->sum(function ($movement) {
                return abs($movement->quantity); // Les sorties sont souvent négatives
            });
            $total_adjustments = $movements->where('type', 'adjustment')->sum('quantity');

            $product->total_in = $total_in;
            $product->total_out = $total_out;
            $product->total_adjustments = $total_adjustments;

            return $product;
        });

        // Calculer les statistiques globales
        $globalStats = [
            'total_products' => $products->count(),
            'total_stock' => $products->sum('stock_quantity'),
            'low_stock_count' => $products->where('stock_quantity', '<', 10)->count(),
            'out_of_stock_count' => $products->where('stock_quantity', 0)->count(),
            'total_in' => $products->sum('total_in'),
            'total_out' => $products->sum('total_out'),
            'total_adjustments' => $products->sum('total_adjustments'),
        ];

        return Inertia::render('StockMovements/Report', [
            'products' => $products,
            'globalStats' => $globalStats,
        ]);
    }

    public function export(Request $request)
    {
        return response()->json(['message' => 'Export en cours de développement']);
    }

    /* -----------------------------------------------------------------
     |  HELPERS internes
     |----------------------------------------------------------------- */
    private function updateProductStock(StockMovement $m): void
    {
        // Empêche le stock de devenir négatif si la colonne est UNSIGNED
        if ($m->quantity >= 0) {
            $m->product->increment('stock_quantity', $m->quantity);
        } else {
            // quantité négative ⇒ décrémente
            $m->product->decrement('stock_quantity', abs($m->quantity));
        }
    }

    private function revertProductStock(StockMovement $m): void
    {
        // Annulation : on fait l'inverse exact de updateProductStock
        if ($m->quantity >= 0) {
            $m->product->decrement('stock_quantity', $m->quantity);
        } else {
            $m->product->increment('stock_quantity', abs($m->quantity));
        }
    }
}
