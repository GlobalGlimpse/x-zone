<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\CategoryAttribute;
use App\Http\Requests\CategoryRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Category::with(['parent', 'children'])
            ->withCount(['products', 'children']);

        // Filtres
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('parent_id')) {
            if ($request->parent_id === 'root') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $request->parent_id);
            }
        }

        if ($request->filled('level')) {
            $query->where('level', $request->level);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $categories = $query->orderBy('level')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($request->input('per_page', 15))
            ->appends($request->all());

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'parent_id', 'level', 'status']),
            'categoryTree' => Category::getTree(),
            'rootCategories' => Category::whereNull('parent_id')->orderBy('sort_order')->get(),
        ]);
    }

    public function create(Request $request): Response
    {
        $parentId = $request->input('parent_id');
        $parent = $parentId ? Category::findOrFail($parentId) : null;

        return Inertia::render('Categories/Create', [
            'parent' => $parent,
            'availableParents' => Category::getFlatList(),
        ]);
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (blank($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        // Calculer le niveau automatiquement
        if ($data['parent_id']) {
            $parent = Category::findOrFail($data['parent_id']);
            $data['level'] = $parent->level + 1;
        }

        $category = Category::create($data);

        return to_route('categories.index')
            ->with('success', 'Catégorie créée avec succès.');
    }

    public function show(Category $category): Response
    {
        $category->load([
            'parent',
            'children' => function ($query) {
                $query->withCount('products')->orderBy('sort_order');
            },
            'attributes' => function ($query) {
                $query->orderBy('sort_order');
            },
            'products' => function ($query) {
                $query->with('brand:id,name')
                      ->select('id', 'name', 'model', 'brand_id', 'category_id', 'price', 'currency_code')
                      ->take(10);
            },
        ]);

        return Inertia::render('Categories/Show', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'parent' => $category->parent,
                'level' => $category->level,
                'is_active' => $category->is_active,
                'breadcrumb' => $category->breadcrumb,
                'full_name' => $category->full_name,
                'children' => $category->children,
                'attributes' => $category->attributes,
                'products' => $category->products->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'model' => $p->model,
                    'brand' => $p->brand?->name,
                    'price' => $p->price,
                    'currency_code' => $p->currency_code,
                ]),
                'products_count' => $category->products_count,
                'children_count' => $category->children_count,
                'all_products_count' => $category->getAllProductsCount(),
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
            ],
        ]);
    }

    public function edit(Category $category): Response
    {
        $category->load(['parent', 'attributes']);

        return Inertia::render('Categories/Edit', [
            'category' => $category,
            'availableParents' => Category::getFlatList()
                ->reject(fn($cat) => $cat['id'] === $category->id), // Éviter auto-référence
        ]);
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();

        if (blank($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        // Vérifier qu'on ne crée pas de boucle
        if ($data['parent_id'] && $this->wouldCreateLoop($category->id, $data['parent_id'])) {
            return back()->withErrors(['parent_id' => 'Cette sélection créerait une boucle dans la hiérarchie.']);
        }

        $category->update($data);

        return to_route('categories.index')
            ->with('success', 'Catégorie mise à jour avec succès.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        // Vérifier s'il y a des produits ou des sous-catégories
        if ($category->products()->exists()) {
            return back()->with('error', 'Impossible de supprimer une catégorie qui contient des produits.');
        }

        if ($category->children()->exists()) {
            return back()->with('error', 'Impossible de supprimer une catégorie qui contient des sous-catégories.');
        }

        $category->delete();
        
        return back()->with('success', 'Catégorie supprimée avec succès.');
    }

    public function restore($id): RedirectResponse
    {
        $category = Category::withTrashed()->findOrFail($id);
        $category->restore();

        return back()->with('success', 'Catégorie restaurée avec succès.');
    }

    /* ------------------------------------------------------------------ */
    /* Gestion des attributs                                              */
    /* ------------------------------------------------------------------ */
    public function attributes(Category $category): Response
    {
        $category->load(['attributes' => function ($query) {
            $query->orderBy('sort_order');
        }]);

        return Inertia::render('Categories/Attributes', [
            'category' => $category,
        ]);
    }

    public function storeAttribute(Request $request, Category $category): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'type' => 'required|in:text,number,decimal,boolean,select,multiselect,date,url,email,textarea,json',
            'options' => 'nullable|array',
            'unit' => 'nullable|string|max:50',
            'is_required' => 'boolean',
            'is_filterable' => 'boolean',
            'is_searchable' => 'boolean',
            'show_in_listing' => 'boolean',
            'description' => 'nullable|string',
            'validation_rules' => 'nullable|string',
        ]);

        if (blank($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $data['category_id'] = $category->id;
        $data['sort_order'] = $category->attributes()->max('sort_order') + 1;

        CategoryAttribute::create($data);

        return back()->with('success', 'Attribut ajouté avec succès.');
    }

    public function updateAttribute(Request $request, Category $category, CategoryAttribute $attribute): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'type' => 'required|in:text,number,decimal,boolean,select,multiselect,date,url,email,textarea,json',
            'options' => 'nullable|array',
            'unit' => 'nullable|string|max:50',
            'is_required' => 'boolean',
            'is_filterable' => 'boolean',
            'is_searchable' => 'boolean',
            'show_in_listing' => 'boolean',
            'description' => 'nullable|string',
            'validation_rules' => 'nullable|string',
        ]);

        if (blank($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $attribute->update($data);

        return back()->with('success', 'Attribut mis à jour avec succès.');
    }

    public function destroyAttribute(Category $category, CategoryAttribute $attribute): RedirectResponse
    {
        $attribute->delete();
        
        return back()->with('success', 'Attribut supprimé avec succès.');
    }

    /* ------------------------------------------------------------------ */
    /* Méthodes utilitaires                                               */
    /* ------------------------------------------------------------------ */
    private function wouldCreateLoop(int $categoryId, int $parentId): bool
    {
        $current = Category::find($parentId);
        
        while ($current) {
            if ($current->id === $categoryId) {
                return true;
            }
            $current = $current->parent;
        }
        
        return false;
    }

    /* ------------------------------------------------------------------ */
    /* API pour le frontend                                               */
    /* ------------------------------------------------------------------ */
    public function tree(): Response
    {
        return response()->json([
            'tree' => Category::getTree(),
        ]);
    }

    public function flatList(): Response
    {
        return response()->json([
            'categories' => Category::getFlatList(),
        ]);
    }
}