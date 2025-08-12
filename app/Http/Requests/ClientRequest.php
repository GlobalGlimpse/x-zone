<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Ajuster selon vos permissions
    }

    public function rules(): array
    {
        $clientId = $this->route('client')?->id;

        return [
            'company_name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                $clientId ? "unique:clients,email,{$clientId}" : 'unique:clients,email'
            ],
            'phone' => 'nullable|string|max:50',
            'address' => 'required|string',
            'city' => 'required|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'required|string|max:255',
            'ice' => [
                'nullable',
                'string',
                'max:50',
                'regex:/^[0-9]{15}$/',
                $clientId ? "unique:clients,ice,{$clientId}" : 'unique:clients,ice'
            ],
            'rc' => 'nullable|string|max:50',
            'patente' => 'nullable|string|max:50',
            'cnss' => 'nullable|string|max:50',
            'if_number' => 'nullable|string|max:50',
            'tax_regime' => 'required|in:normal,auto_entrepreneur,exonere',
            'is_tva_subject' => 'boolean',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'ice.regex' => 'L\'ICE doit contenir exactement 15 chiffres.',
            'ice.unique' => 'Ce numéro ICE est déjà utilisé par un autre client.',
            'email.unique' => 'Cette adresse email est déjà utilisée par un autre client.',
        ];
    }
}