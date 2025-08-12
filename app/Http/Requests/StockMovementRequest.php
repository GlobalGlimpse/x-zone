<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return match ($this->method()) {
            'POST'   => $this->user()->can('stock_create'),
            'PATCH'  => $this->user()->can('stock_edit'),
            'DELETE' => $this->user()->can('stock_delete'),
            default  => true,
        };
    }

    public function rules(): array
    {
        return [
            'product_id'    => ['required', 'uuid', 'exists:products,id'],
            'type'          => ['required', 'in:in,out,adjustment'],

            /* quantité : signe +/– géré ci-dessous */
            'quantity'      => ['required', 'integer', function ($att, $val, $fail) {
                if ($this->input('type') === 'out' && $val > 0) {
                    $fail('La quantité doit être négative pour une sortie de stock.');
                }
                if (in_array($this->input('type'), ['in', 'adjustment']) && $val == 0) {
                    $fail('La quantité ne peut pas être zéro.');
                }
            }],

            'reference'     => ['nullable', 'string', 'max:255'],

            /* Nouveau système FK */
            'provider_id'   => ['nullable', 'exists:providers,id'],
            'reason_id'     => ['required', 'exists:stock_movement_reasons,id'],

            'unit_cost'     => ['nullable', 'numeric', 'min:0'],
            'currency_code' => ['required', 'exists:currencies,code', 'size:3'],
            'notes'         => ['nullable', 'string'],
            'movement_date' => ['required', 'date'],

            /* Pièces jointes */
            'attachments'        => ['nullable', 'array'],
            'attachments.*'      => ['file','mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx','max:5120'],
            'delete_attachment_ids'   => ['nullable', 'array'],
            'delete_attachment_ids.*' => ['integer','exists:stock_movement_attachments,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Force sortie négative
        if ($this->input('type') === 'out' && $this->input('quantity') > 0) {
            $this->merge(['quantity' => -abs($this->input('quantity'))]);
        }
    }
}
