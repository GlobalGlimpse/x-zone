<?php

namespace App\Http\Controllers;

use App\Http\Requests\CurrencyRequest;
use App\Models\Currency;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CurrencyController extends Controller
{
    public function index()
    {
        // Pagination et withTrashed pour voir les supprimées
        $currencies = Currency::withTrashed()->orderBy('name')->paginate(20);

        return Inertia::render('Currencies/Index', [
            'currencies' => $currencies,
        ]);
    }

    public function create()
    {
        return Inertia::render('Currencies/Create');
    }

    public function store(CurrencyRequest $request)
    {
        Currency::create($request->validated());
        return redirect()->route('currencies.index')->with('success', 'Devise créée avec succès.');
    }

    public function edit(Currency $currency)
    {
        return Inertia::render('Currencies/Edit', [
            'currency' => $currency,
        ]);
    }

    public function update(CurrencyRequest $request, Currency $currency)
    {
        $currency->update($request->validated());
        return redirect()->route('currencies.index')->with('success', 'Devise mise à jour avec succès.');
    }

    public function show(Currency $currency)
    {
        return Inertia::render('Currencies/Show', [
            'currency' => $currency,
        ]);
    }


    public function destroy(Currency $currency)
    {
        $currency->delete();
        return redirect()->route('currencies.index')->with('success', 'Devise supprimée avec succès.');
    }

    public function restore($code)
    {
        $currency = Currency::withTrashed()->findOrFail($code);
        $currency->restore();
        return redirect()->route('currencies.index')->with('success', 'Devise restaurée avec succès.');
    }
}
