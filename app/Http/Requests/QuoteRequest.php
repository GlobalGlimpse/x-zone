<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Ajuster selon vos permissions
    }

    public function rules(): array
    {
        return [
            'client_id' => 'required|exists:clients,id',
            'quote_date' => 'required|date',
            'valid_until' => 'required|date|after:quote_date',
            'currency_code' => 'required|exists:currencies,code',
            'terms_conditions' => 'nullable|string',
            'notes' => 'nullable|string',
            'internal_notes' => 'nullable|string',
            
            // Items
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01|max:999999.99',
            'items.*.unit_price_ht' => 'required|numeric|min:0|max:999999.99',
            'items.*.tax_rate' => 'required|numeric|min:0|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Au moins un produit doit être ajouté au devis.',
            'items.min' => 'Au moins un produit doit être ajouté au devis.',
            'items.*.product_id.required' => 'Le produit est requis.',
            'items.*.product_id.exists' => 'Le produit sélectionné n\'existe pas.',
            'items.*.quantity.required' => 'La quantité est requise.',
            'items.*.quantity.min' => 'La quantité doit être supérieure à 0.',
            'items.*.unit_price_ht.required' => 'Le prix unitaire HT est requis.',
            'items.*.unit_price_ht.min' => 'Le prix unitaire HT doit être positif.',
            'items.*.tax_rate.required' => 'Le taux de taxe est requis.',
            'valid_until.after' => 'La date de validité doit être postérieure à la date du devis.',
        ];
    }
}