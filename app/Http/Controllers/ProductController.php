<?php

namespace App\Http\Controllers;

use App\Models\{
    Product,
    Brand,
    Category,
    Currency,
    TaxRate,
    ProductImage,
    ProductCompatibility
};
use App\Http\Requests\ProductRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query()
            ->with(['brand:id,name', 'category:id,name', 'currency:code,symbol']);

        // Recherche globale améliorée
        if ($search = trim($request->input('search'))) {
            foreach (preg_split('/\s+/', $search, -1, PREG_SPLIT_NO_EMPTY) as $term) {
                $like = "%{$term}%";
                $query->where(function ($q) use ($term, $like) {
                    // Recherche dans les champs textuels
                    $q->where('name', 'like', $like)
                      ->orWhere('description', 'like', $like)
                      ->orWhereHas('category', fn($subQ) => $subQ->where('name', 'like', $like))
                      ->orWhereHas('brand', fn($subQ) => $subQ->where('name', 'like', $like));

                    // Si c'est un nombre, rechercher aussi dans les champs numériques
                    if (is_numeric($term)) {
                        $numericValue = (float) $term;
                        $intValue = (int) $term;

                        $q->orWhere('price', '=', $numericValue)
                          ->orWhere('stock_quantity', '=', $intValue)
                          // Recherche partielle dans le prix (ex: "299" trouve "299.99")
                          ->orWhere('price', 'like', $like)
                          // Recherche par année dans created_at
                          ->orWhereYear('created_at', '=', $intValue);
                    }

                    // Détection et traitement des formats de date
                    $this->addDateSearchConditions($q, $term);
                });
            }
        }

        // Filtres spécifiques
        if ($name = $request->input('name')) {
            $query->where('name', 'like', "%{$name}%");
        }

        if ($cat = $request->input('category')) {
            $query->whereHas('category', fn ($q) => $q->where('name', 'like', "%{$cat}%"));
        }

        if ($status = $request->input('status')) {
            $status === 'actif'
                ? $query->whereNull('deleted_at')
                : $query->whereNotNull('deleted_at');
        }

        // Filtres numériques pour le prix
        if ($priceOperator = $request->input('price_operator')) {
            if ($priceOperator === 'between') {
                $minPrice = $request->input('price_min');
                $maxPrice = $request->input('price_max');
                if ($minPrice !== null && $maxPrice !== null) {
                    $query->whereBetween('price', [(float)$minPrice, (float)$maxPrice]);
                }
            } else {
                $price = $request->input('price');
                if ($price !== null && $price !== '') {
                    switch ($priceOperator) {
                        case 'equals':
                            $query->where('price', '=', (float)$price);
                            break;
                        case 'gt':
                            $query->where('price', '>', (float)$price);
                            break;
                        case 'gte':
                            $query->where('price', '>=', (float)$price);
                            break;
                        case 'lt':
                            $query->where('price', '<', (float)$price);
                            break;
                        case 'lte':
                            $query->where('price', '<=', (float)$price);
                            break;
                    }
                }
            }
        }

        // Filtres numériques pour le stock
        if ($stockOperator = $request->input('stock_operator')) {
            if ($stockOperator === 'between') {
                $minStock = $request->input('stock_min');
                $maxStock = $request->input('stock_max');
                if ($minStock !== null && $maxStock !== null) {
                    $query->whereBetween('stock_quantity', [(int)$minStock, (int)$maxStock]);
                }
            } else {
                $stock = $request->input('stock');
                if ($stock !== null && $stock !== '') {
                    switch ($stockOperator) {
                        case 'equals':
                            $query->where('stock_quantity', '=', (int)$stock);
                            break;
                        case 'gt':
                            $query->where('stock_quantity', '>', (int)$stock);
                            break;
                        case 'gte':
                            $query->where('stock_quantity', '>=', (int)$stock);
                            break;
                        case 'lt':
                            $query->where('stock_quantity', '<', (int)$stock);
                            break;
                        case 'lte':
                            $query->where('stock_quantity', '<=', (int)$stock);
                            break;
                    }
                }
            }
        }

        // Filtres de date
        if ($startDate = $request->input('date_start')) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate = $request->input('date_end')) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $query->orderBy($request->input('sort', 'created_at'), $request->input('dir', 'desc'));
        $per = (int) $request->input('per_page', 10);
        $products = $per === -1
            ? $query->paginate($query->count())->appends($request->query())
            : $query->paginate($per)->appends($request->query());

        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters'  => $request->only([
                'search', 'name', 'category', 'status',
                'price', 'price_operator', 'price_min', 'price_max',
                'stock', 'stock_operator', 'stock_min', 'stock_max',
                'date_start', 'date_end'
            ]),
            'sort'     => $request->input('sort', 'created_at'),
            'dir'      => $request->input('dir', 'desc'),
            'flash'    => session()->only(['success', 'error']),
        ]);
    }

    /**
     * Ajoute les conditions de recherche pour les dates dans différents formats
     */
    private function addDateSearchConditions($query, string $term): void
    {
        // Formats de date supportés
        $dateFormats = [
            '/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/' => 'd/m/Y',     // 16/06/2025
            '/^(\d{1,2})-(\d{1,2})-(\d{4})$/' => 'd-m-Y',       // 16-06-2025
            '/^(\d{4})-(\d{1,2})-(\d{1,2})$/' => 'Y-m-d',       // 2025-06-16
            '/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/' => 'd.m.Y',     // 16.06.2025
        ];

        foreach ($dateFormats as $pattern => $format) {
            if (preg_match($pattern, $term)) {
                try {
                    // Essayer de parser la date avec Carbon
                    $date = Carbon::createFromFormat($format, $term);
                    if ($date) {
                        $formattedDate = $date->format('Y-m-d');

                        // Recherche exacte par date
                        $query->orWhereDate('created_at', '=', $formattedDate)
                              ->orWhereDate('updated_at', '=', $formattedDate);

                        // Recherche par composants de date
                        $query->orWhere(function($subQuery) use ($date) {
                            $subQuery->whereYear('created_at', $date->year)
                                    ->whereMonth('created_at', $date->month)
                                    ->whereDay('created_at', $date->day);
                        });

                        break; // Sortir de la boucle une fois qu'un format correspond
                    }
                } catch (\Exception $e) {
                    // Si la conversion échoue, continuer avec le format suivant
                    continue;
                }
            }
        }

        // Recherche partielle pour les années (ex: "2025" trouve toutes les dates de 2025)
        if (preg_match('/^\d{4}$/', $term)) {
            $year = (int) $term;
            $query->orWhereYear('created_at', '=', $year)
                  ->orWhereYear('updated_at', '=', $year);
        }

        // Recherche partielle pour les mois/années (ex: "06/2025" ou "06-2025")
        if (preg_match('/^(\d{1,2})[\/\-](\d{4})$/', $term, $matches)) {
            $month = (int) $matches[1];
            $year = (int) $matches[2];

            $query->orWhere(function($subQuery) use ($month, $year) {
                $subQuery->whereYear('created_at', $year)
                        ->whereMonth('created_at', $month);
            });
        }

        // Recherche pour les jours/mois (ex: "16/06")
        if (preg_match('/^(\d{1,2})[\/\-](\d{1,2})$/', $term, $matches)) {
            $day = (int) $matches[1];
            $month = (int) $matches[2];

            // Vérifier que c'est bien jour/mois et non mois/jour
            if ($day <= 31 && $month <= 12) {
                $query->orWhere(function($subQuery) use ($day, $month) {
                    $subQuery->whereMonth('created_at', $month)
                            ->whereDay('created_at', $day);
                });
            }
        }
    }

    public function create(): Response
    {
        return Inertia::render('Products/Create', [
            'brands'     => Brand::orderBy('name')->get(['id', 'name']),
            'categories' => Category::orderBy('name')->get(['id', 'name', 'slug']),
            'currencies' => Currency::all(['code', 'symbol']),
            'taxRates'   => TaxRate::all(['id', 'name', 'rate']),
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $category  = Category::findOrFail($validated['category_id']);
        $slug      = $category->slug;
        $config    = config('catalog.specializations');

        $product = Product::create([...$validated, 'id' => (string) Str::uuid()]);

        if (isset($config[$slug]) && isset($validated['spec'])) {
            $modelClass = $config[$slug]['model'] ?? null;
            $fields     = $config[$slug]['fields'] ?? [];

            $specData = array_merge($fields, $validated['spec'], ['product_id' => $product->id]);
            $relation = Str::camel(Str::singular($slug));

            if (method_exists($product, $relation) && method_exists($product->{$relation}(), 'create')) {
                $product->{$relation}()->create($specData);
            } elseif ($modelClass && class_exists($modelClass)) {
                $modelClass::create($specData);
            }
        }

        foreach ($request->input('compatibilities', []) as $entry) {
            $product->compatibleWith()->attach(
                $entry['compatible_with_id'],
                [
                    'direction' => $entry['direction'] ?? 'bidirectional',
                    'note'      => $entry['note'] ?? null,
                ]
            );
        }

        $this->syncImages($request, $product);

        return to_route('products.index')->with('success', 'Produit créé.');
    }

    public function show(Product $product): Response
    {
        $product->load([
            'brand','category','currency','taxRate','images',
            'ram','processor','hardDrive','powerSupply','motherboard','networkCard',
            'graphicCard','license','software','accessory','laptop','desktop','server',
            'compatibleWith.category','isCompatibleWith.category',
        ]);

        $all = collect();

        foreach ($product->compatibleWith as $p) {
            $all->push((object)[
                'id' => $p->id,
                'name' => $p->name,
                'category' => $p->category?->name,
                'direction' => $p->pivot->direction,
                'note' => $p->pivot->note,
            ]);
        }
        foreach ($product->isCompatibleWith as $p) {
            $all->push((object)[
                'id' => $p->id,
                'name' => $p->name,
                'category' => $p->category?->name,
                'direction' => $p->pivot->direction,
                'note' => $p->pivot->note,
            ]);
        }

        $allCompatibilities = $all->unique('id')->values();
        $base = $product->toArray();
        $config = config('catalog.specializations');

        foreach ($config as $slug => $_) {
            $relation = Str::camel(Str::singular($slug));
            if ($product->relationLoaded($relation)) {
                $base[$relation] = $product->getRelation($relation);
            }
        }

        return Inertia::render('Products/Show', [
            'product' => $base,
            'allCompatibilities' => $allCompatibilities,
        ]);
    }

    public function edit(Product $product): Response
    {
        $slug = $product->category?->slug;
        $relations = ['brand', 'category', 'currency', 'taxRate', 'images'];

        if ($slug) {
            $relations[] = Str::camel(Str::singular($slug));
        }

        $product->load(array_merge($relations, ['compatibleWith', 'isCompatibleWith']));

        $compatibilities = $product->compatibleWith
            ->merge($product->isCompatibleWith)
            ->values()
            ->map(fn ($p) => [
                'compatible_with_id' => $p->id,
                'name' => $p->name,
                'direction' => $p->pivot->direction,
                'note' => $p->pivot->note,
            ]);

        return Inertia::render('Products/Edit', [
            'brands' => Brand::orderBy('name')->get(['id', 'name']),
            'product' => $product,
            'categories' => Category::orderBy('name')->get(['id', 'name', 'slug']),
            'currencies' => Currency::all(['code', 'symbol']),
            'taxRates' => TaxRate::all(['id', 'name', 'rate']),
            'compatibilities' => $compatibilities,
        ]);
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        DB::transaction(function () use ($request, $product) {
            $validated = $request->validated();
            $product->update($validated);

            $category = Category::findOrFail($validated['category_id']);
            $slug = $category->slug;
            $config = config('catalog.specializations');

            if (isset($config[$slug]) && isset($validated['spec'])) {
                $relation = Str::camel(Str::singular($slug));

                if (method_exists($product, $relation)) {
                    $product->{$relation}()->updateOrCreate(
                        ['product_id' => $product->id],
                        $validated['spec']
                    );
                }
            }

            $sent = collect($request->input('compatibilities', []))
                ->filter(fn ($e) => !empty($e['compatible_with_id']))
                ->map(fn ($e) => [
                    'id' => (string) $e['compatible_with_id'],
                    'direction' => $e['direction'] ?? 'bidirectional',
                    'note' => $e['note'] ?? null,
                ]);

            $toSync = $sent->mapWithKeys(fn ($e) => [
                $e['id'] => ['direction' => $e['direction'], 'note' => $e['note']],
            ]);

            $existing = ProductCompatibility::withTrashed()
                ->where(fn ($q) => $q
                    ->where('product_id', $product->id)
                    ->orWhere('compatible_with_id', $product->id))
                ->get();

            foreach ($existing as $pivot) {
                $otherId = $pivot->product_id === $product->id
                    ? $pivot->compatible_with_id
                    : $pivot->product_id;

                if ($toSync->has($otherId)) {
                    $attrs = $toSync[$otherId];
                    if ($pivot->trashed()) $pivot->restore();
                    $pivot->update($attrs);
                    $toSync->forget($otherId);
                } elseif (is_null($pivot->deleted_at)) {
                    $pivot->delete();
                }
            }

            foreach ($toSync as $otherId => $attrs) {
                $product->compatibleWith()->attach($otherId, $attrs);
            }

            $this->syncImages($request, $product);
        });

        return to_route('products.show', $product)->with('success', 'Produit mis à jour.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();
        return back()->with('success', 'Produit supprimé.');
    }

    public function restore(Product $product): RedirectResponse
    {
        $product->restore();
        return back()->with('success', 'Produit restauré.');
    }

    protected function syncImages(ProductRequest $request, Product $product): void
    {
        if ($ids = $request->input('deleted_image_ids', [])) {
            ProductImage::whereIn('id', $ids)->delete();
        }
        if ($ids = $request->input('restored_image_ids', [])) {
            ProductImage::withTrashed()->whereIn('id', $ids)->restore();
        }

        ProductImage::where('product_id', $product->id)
            ->whereNull('deleted_at')
            ->update(['is_primary' => false]);

        $primaryIdx = (int) $request->input('primary_image_index', 0);
        $globalIdx = 0;
        $primaryPath = null;

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store("products/{$product->id}", 'public');
                $isPrimary = $globalIdx === $primaryIdx;

                $product->images()->create([
                    'path' => $path,
                    'is_primary' => $isPrimary,
                ]);

                if ($isPrimary) $primaryPath = $path;
                $globalIdx++;
            }
        }

        $existing = $product->images()
            ->whereNull('deleted_at')
            ->orderBy('id')
            ->get();

        foreach ($existing as $img) {
            $isPrimary = $globalIdx === $primaryIdx;
            if ($isPrimary) {
                $img->update(['is_primary' => true]);
                $primaryPath = $img->path;
            }
            $globalIdx++;
        }

        if (!$primaryPath && $first = $existing->first()) {
            $first->update(['is_primary' => true]);
            $primaryPath = $first->path;
        }

        if ($primaryPath) {
            $product->updateQuietly(['image_main' => $primaryPath]);
        }
    }

    public function compatibleList()
    {
        $machineSlugs = ['desktop', 'desktops', 'laptop', 'laptops', 'server', 'servers'];

        return Product::query()
            ->select('products.id', 'products.name')
            ->join('categories', 'categories.id', '=', 'products.category_id')
            ->whereIn('categories.slug', $machineSlugs)
            ->whereNull('products.deleted_at')
            ->orderBy('products.name')
            ->get();
    }
}
