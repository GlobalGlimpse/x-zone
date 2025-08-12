<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TaxRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return match ($this->method()) {
            'POST'   => $this->user()->can('taxrate_create'),
            'PATCH'  => $this->user()->can('taxrate_edit'),
            'DELETE' => $this->user()->can('taxrate_delete'),
            default  => true,
        };
    }

    public function rules()
    {
        $taxRateId = $this->route('taxRate') ? $this->route('taxRate')->id : null;

        return [
            'name' => 'required|string|max:255',
            'rate' => 'required|numeric|min:0|max:100',
        ];
    }
}
