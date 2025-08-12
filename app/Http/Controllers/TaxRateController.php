<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaxRateRequest;
use App\Models\TaxRate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaxRateController extends Controller
{
    public function index()
    {
        $taxRates = TaxRate::withTrashed()->orderBy('name')->paginate(15);

        return Inertia::render('TaxRates/Index', [
            'taxRates' => $taxRates,
        ]);
    }

    public function create()
    {
        return Inertia::render('TaxRates/Create');
    }

    public function store(TaxRateRequest $request)
    {
        TaxRate::create($request->validated());

        return redirect()->route('taxrates.index')->with('success', 'Taux de taxe créé avec succès.');
    }

    public function show(TaxRate $taxRate)
    {
        return Inertia::render('TaxRates/Show', [
            'taxRate' => $taxRate,
        ]);
    }

    public function edit(TaxRate $taxRate)
    {
        return Inertia::render('TaxRates/Edit', [
            'taxRate' => $taxRate,
        ]);
    }

    public function update(TaxRateRequest $request, TaxRate $taxRate)
    {
        $taxRate->update($request->validated());

        return redirect()->route('taxrates.index')->with('success', 'Taux de taxe mis à jour avec succès.');
    }

    public function destroy(TaxRate $taxRate)
    {
        $taxRate->delete();

        return redirect()->route('taxrates.index')->with('success', 'Taux de taxe supprimé avec succès.');
    }

    public function restore($id)
    {
        $taxRate = TaxRate::withTrashed()->findOrFail($id);
        $taxRate->restore();

        return redirect()->route('taxrates.index')->with('success', 'Taux de taxe restauré avec succès.');
    }
}
