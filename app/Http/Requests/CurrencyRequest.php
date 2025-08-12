<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CurrencyRequest extends FormRequest
{
       public function authorize(): bool
    {
        return match ($this->method()) {
            'POST'   => $this->user()->can('currency_create'),
            'PATCH'  => $this->user()->can('currency_edit'),
            'DELETE' => $this->user()->can('currency_delete'),
            default  => true,
        };
    }

    public function rules()
    {
        // Récupère le code dans l’URL (par exemple dans route-model binding)
        $currency = $this->route('currency');
        return [
            'code' => [
                'required',
                'string',
                $currency
                    // Si édition, exclut la devise courante
                    ? 'unique:currencies,code,' . $currency->code . ',code'
                    // Si création, simplement unique
                    : 'unique:currencies,code',
            ],
            'symbol' => ['required', 'string', 'max:5'],
            'name'   => ['required', 'string', 'max:255'],
        ];
    }

}
