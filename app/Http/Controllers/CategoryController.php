<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Requests\CategoryRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Categories/Index', [
            'categories' => Category::orderBy('name')->paginate(15),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Categories/Create');
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (blank($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        Category::create($data);

        return to_route('categories.index')
            ->with('success', 'Catégorie créée.');
    }


    public function edit(Category $category): Response
    {
        return Inertia::render('Categories/Edit', compact('category'));
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();

        if (blank($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

       return to_route('categories.index')
            ->with('success', 'Catégorie mise à jour.');
    }

     public function show(Category $category): Response
    {
        // Charge les produits et leur marque
        $category->load([
            'products' => function ($q) {
                $q->select('id', 'name', 'model', 'brand_id', 'category_id')
                  ->with('brand:id,name');
            },
        ]);

        return Inertia::render('Categories/Show', [
            'category' => [
                'id'         => $category->id,
                'name'       => $category->name,
                'slug'       => $category->slug,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
                'deleted_at' => $category->deleted_at,

                // On envoie id, name, model et brand
                'products'   => $category->products->map(fn ($p) => [
                    'id'    => $p->id,
                    'name'  => $p->name,
                    'model' => $p->model,
                    'brand' => $p->brand?->name,
                ]),
            ],
        ]);
    }

    public function destroy(Category $category): RedirectResponse
    {
        $category->delete();
        return back()->with('success', 'Catégorie supprimée.');
    }
}
