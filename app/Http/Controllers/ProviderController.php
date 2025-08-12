<?php

namespace App\Http\Controllers;

use App\Models\Provider;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProviderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Provider::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $providers = $query->withTrashed()
            ->orderBy('name')
            ->paginate($request->input('per_page', 15))
            ->appends($request->all());

        return Inertia::render('Providers/Index', [
            'providers' => $providers,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Providers/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'contact_person' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        Provider::create($validated);

        return redirect()->route('providers.index')
            ->with('success', 'Fournisseur créé avec succès.');
    }

    public function show(Provider $provider): Response
    {
        $provider->load(['stockMovements.product']);

        return Inertia::render('Providers/Show', [
            'provider' => $provider,
        ]);
    }

    public function edit(Provider $provider): Response
    {
        return Inertia::render('Providers/Edit', [
            'provider' => $provider,
        ]);
    }

    public function update(Request $request, Provider $provider): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'contact_person' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $provider->update($validated);

        return redirect()->route('providers.index')
            ->with('success', 'Fournisseur mis à jour avec succès.');
    }

    public function destroy(Provider $provider): RedirectResponse
    {
        $provider->delete();

        return back()->with('success', 'Fournisseur supprimé.');
    }

    public function restore($id): RedirectResponse
    {
        $provider = Provider::withTrashed()->findOrFail($id);
        $provider->restore();

        return back()->with('success', 'Fournisseur restauré.');
    }
}
