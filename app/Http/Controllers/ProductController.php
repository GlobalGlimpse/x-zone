<?php

namespace App\Http\Controllers;

use App\Models\{
    Product,
    Brand,
    Category,
    Currency,
    TaxRate,
    ProductImage,
    ProductCompatibility,
    CategoryAttribute,
    ProductAttributeValue,
    ProductVariant
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
            ->with(['brand:id,name', 'category:id,name,parent_id', 'currency:code,symbol'])
            ->withCount(['variants']);

        // Recherche globale
        if ($search = trim($request->input('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhereHas('category', fn($subQ) => $subQ->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('brand', fn($subQ) => $subQ->where('name', 'like', "%{$search}%"))
                  // Recherche dans les attributs
                  ->orWhereHas('attributeValues', function ($attrQ) use ($search) {
                      $attrQ->where('value', 'like', "%{$search}%");
                  });
            });
        }

        // Filtres spécifiques
        if ($request->filled('category_id')) {
            $categoryIds = [$request->category_id];
            
            // Inclure les sous-catégories si demandé
            if ($request->boolean('include_subcategories')) {
                $category = Category::find($request->category_id);
                if ($category) {
                    $categoryIds = array_merge($categoryIds, 
                        $category->getDescendants()->pluck('id')->toArray()
                    );
                }
            }
            
            $query->whereIn('category_id', $categoryIds);
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        // Filtres de prix
        if ($request->filled(['price_min', 'price_max'])) {
            $query->whereBetween('price', [
                (float) $request->price_min,
                (float) $request->price_max
            ]);
        }

        // Filtres de stock
        if ($request->filled('stock_status')) {
            match ($request->stock_status) {
                'in_stock' => $query->where('stock_quantity', '>', 0),
                'low_stock' => $query->whereBetween('stock_quantity', [1, 10]),
                'out_of_stock' => $query->where('stock_quantity', 0),
            };
        }

        // Filtres d'attributs dynamiques
        if ($request->filled('attributes')) {
            foreach ($request->attributes as $attributeSlug => $value) {
                if (!empty($value)) {
                    $query->withAttributeValue($attributeSlug, $value);
                }
            }
        }

        $sort = $request->input('sort', 'created_at');
        $direction = $request->input('direction', 'desc');
        $perPage = (int) $request->input('per_page', 15);

        $products = $query->orderBy($sort, $direction)
            ->paginate($perPage)
            ->appends($request->all());

        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters' => $request->only([
                'search', 'category_id', 'brand_id', 'status',
                'price_min', 'price_max', 'stock_status', 'attributes',
                'include_subcategories'
            ]),
            'categories' => Category::getFlatList(),
            'brands' => Brand::orderBy('name')->get(['id', 'name']),
            'sort' => $sort,
            'direction' => $direction,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Products/Create', [
            'brands' => Brand::orderBy('name')->get(['id', 'name']),
            'categories' => Category::getFlatList(),
            'currencies' => Currency::all(['code', 'symbol']),
            'taxRates' => TaxRate::all(['id', 'name', 'rate']),
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        
        DB::transaction(function () use ($validated, $request) {
            $product = Product::create([
                ...$validated,
                'id' => (string) Str::uuid()
            ]);

            // Gérer les attributs dynamiques
            if ($request->filled('attributes')) {
                foreach ($request->attributes as $attributeSlug => $value) {
                    if (!is_null($value) && $value !== '') {
                        $product->setAttributeValue($attributeSlug, $value);
                    }
                }
            }

            // Gérer les compatibilités (conservées)
            foreach ($request->input('compatibilities', []) as $entry) {
                $product->compatibleWith()->attach(
                    $entry['compatible_with_id'],
                    [
                        'direction' => $entry['direction'] ?? 'bidirectional',
                        'note' => $entry['note'] ?? null,
                    ]
                );
            }

            $this->syncImages($request, $product);
        });

        return to_route('products.index')
            ->with('success', 'Produit créé avec succès.');
    }

    public function show(Product $product): Response
    {
        $product->load([
            'brand', 'category.parent', 'currency', 'taxRate', 'images',
            'attributeValues.attribute', 'variants.images',
            'compatibleWith.category', 'isCompatibleWith.category',
        ]);

        // Préparer les compatibilités
        $allCompatibilities = collect();
        foreach ($product->compatibleWith as $p) {
            $allCompatibilities->push([
                'id' => $p->id,
                'name' => $p->name,
                'category' => $p->category?->name,
                'direction' => $p->pivot->direction,
                'note' => $p->pivot->note,
            ]);
        }
        foreach ($product->isCompatibleWith as $p) {
            $allCompatibilities->push([
                'id' => $p->id,
                'name' => $p->name,
                'category' => $p->category?->name,
                'direction' => $p->pivot->direction,
                'note' => $p->pivot->note,
            ]);
        }

        return Inertia::render('Products/Show', [
            'product' => array_merge($product->toArray(), [
                'formatted_attributes' => $product->getFormattedAttributes(),
                'breadcrumb' => $product->category?->breadcrumb ?? collect(),
                'effective_price' => $product->getEffectivePrice(),
                'effective_stock' => $product->getEffectiveStock(),
                'is_in_stock' => $product->isInStock(),
            ]),
            'allCompatibilities' => $allCompatibilities->unique('id')->values(),
        ]);
    }

    public function edit(Product $product): Response
    {
        $product->load([
            'brand', 'category', 'currency', 'taxRate', 'images',
            'attributeValues.attribute', 'variants',
            'compatibleWith', 'isCompatibleWith'
        ]);

        // Préparer les attributs de la catégorie
        $categoryAttributes = $product->getCategoryAttributes();
        $currentValues = $product->attributeValues->keyBy('category_attribute_id');

        $attributes = $categoryAttributes->map(function ($attr) use ($currentValues) {
            $value = $currentValues->get($attr->id);
            return [
                'id' => $attr->id,
                'name' => $attr->name,
                'slug' => $attr->slug,
                'type' => $attr->type,
                'options' => $attr->options,
                'unit' => $attr->unit,
                'is_required' => $attr->is_required,
                'description' => $attr->description,
                'validation_rules' => $attr->validation_rules,
                'current_value' => $value ? $value->getCastedValue() : null,
            ];
        });

        // Préparer les compatibilités
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
            'product' => $product,
            'brands' => Brand::orderBy('name')->get(['id', 'name']),
            'categories' => Category::getFlatList(),
            'currencies' => Currency::all(['code', 'symbol']),
            'taxRates' => TaxRate::all(['id', 'name', 'rate']),
            'categoryAttributes' => $attributes,
            'compatibilities' => $compatibilities,
        ]);
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        DB::transaction(function () use ($request, $product) {
            $validated = $request->validated();
            $product->update($validated);

            // Mettre à jour les attributs dynamiques
            if ($request->filled('attributes')) {
                foreach ($request->attributes as $attributeSlug => $value) {
                    if (!is_null($value) && $value !== '') {
                        $product->setAttributeValue($attributeSlug, $value);
                    } else {
                        // Supprimer l'attribut si la valeur est vide
                        $product->attributeValues()
                            ->whereHas('attribute', fn($q) => $q->where('slug', $attributeSlug))
                            ->delete();
                    }
                }
            }

            // Gérer les compatibilités (logique conservée)
            $this->updateCompatibilities($request, $product);
            $this->syncImages($request, $product);
        });

        return to_route('products.show', $product)
            ->with('success', 'Produit mis à jour avec succès.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();
        return back()->with('success', 'Produit supprimé avec succès.');
    }

    public function restore(Product $product): RedirectResponse
    {
        $product->restore();
        return back()->with('success', 'Produit restauré avec succès.');
    }

    /* ------------------------------------------------------------------ */
    /* API pour récupérer les attributs d'une catégorie                  */
    /* ------------------------------------------------------------------ */
    public function getCategoryAttributes(Request $request)
    {
        $categoryId = $request->input('category_id');
        
        if (!$categoryId) {
            return response()->json(['attributes' => []]);
        }

        $category = Category::with('attributes')->find($categoryId);
        
        if (!$category) {
            return response()->json(['attributes' => []]);
        }

        // Récupérer les attributs de la catégorie et de ses parents
        $attributes = collect();
        $current = $category;

        while ($current) {
            $attributes = $attributes->merge($current->attributes);
            $current = $current->parent;
        }

        return response()->json([
            'attributes' => $attributes->unique('id')->sortBy('sort_order')->values()
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Méthodes privées conservées                                        */
    /* ------------------------------------------------------------------ */
    private function updateCompatibilities(ProductRequest $request, Product $product): void
    {
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
        return Product::query()
            ->select('products.id', 'products.name')
            ->join('categories', 'categories.id', '=', 'products.category_id')
            ->whereNull('products.deleted_at')
            ->orderBy('products.name')
            ->get();
    }
}