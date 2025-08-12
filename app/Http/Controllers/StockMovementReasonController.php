<?php

namespace App\Http\Controllers;

use App\Models\StockMovementReason;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StockMovementReasonController extends Controller
{
    public function index(Request $request): Response
    {
        $query = StockMovementReason::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $reasons = $query->withTrashed()
            ->orderBy('name')
            ->paginate($request->input('per_page', 15))
            ->appends($request->all());

        return Inertia::render('StockMovementReasons/Index', [
            'reasons' => $reasons,
            'filters' => $request->only(['search', 'type', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('StockMovementReasons/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:in,out,adjustment,all',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        StockMovementReason::create($validated);

        return redirect()->route('stock-movement-reasons.index')
            ->with('success', 'Motif créé avec succès.');
    }

    public function show(StockMovementReason $stockMovementReason): Response
    {
        $stockMovementReason->load(['stockMovements.product']);

        return Inertia::render('StockMovementReasons/Show', [
            'reason' => $stockMovementReason,
        ]);
    }

    public function edit(StockMovementReason $stockMovementReason): Response
    {
        return Inertia::render('StockMovementReasons/Edit', [
            'reason' => $stockMovementReason,
        ]);
    }

    public function update(Request $request, StockMovementReason $stockMovementReason): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:in,out,adjustment,all',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $stockMovementReason->update($validated);

        return redirect()->route('stock-movement-reasons.index')
            ->with('success', 'Motif mis à jour avec succès.');
    }

    public function destroy(StockMovementReason $stockMovementReason): RedirectResponse
    {
        $stockMovementReason->delete();

        return back()->with('success', 'Motif supprimé.');
    }

    public function restore($id): RedirectResponse
    {
        $reason = StockMovementReason::withTrashed()->findOrFail($id);
        $reason->restore();

        return back()->with('success', 'Motif restauré.');
    }
}
