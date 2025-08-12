<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return match ($this->method()) {
            'POST'   => $this->user()->can('product_create'),
            'PATCH'  => $this->user()->can('product_edit'),
            'DELETE' => $this->user()->can('product_delete'),
            default  => true,
        };
    }

    protected function prepareForValidation(): void
    {
        $spec = $this->input('spec', []);
        if (!empty($spec)) {
            $this->merge(['spec' => $spec]);
        }
    }

    public function rules(): array
    {
        $id       = $this->route('product');
        $slug     = optional(\App\Models\Category::find($this->input('category_id')))->slug;
        $specConf = config("catalog.specializations.$slug.fields", []);

        $rules = [
            'brand_id'        => ['required', 'uuid', 'exists:brands,id'],
            'name'            => ['required', 'string', 'max:255'],
            'model'           => ['nullable', 'string', 'max:255'],
            'sku'             => ['required', 'string', 'max:50', Rule::unique('products', 'sku')->ignore($id)],
            'description'     => ['nullable', 'string'],
            'price'           => ['required', 'numeric', 'min:0'],
            'stock_quantity'  => ['required', 'integer', 'min:0'],
            'currency_code'   => ['required', 'exists:currencies,code'],
            'tax_rate_id'     => ['required', 'exists:tax_rates,id'],
            'category_id'     => ['required', 'exists:categories,id'],
            'is_active'       => ['boolean'],
        ];

        if ($specConf) {
            $rules['spec'] = ['array'];

            foreach ($specConf as $field => $default) {
                $base = ['nullable'];

                $fieldRules = match ($slug) {
                    'laptop' => match ($field) {
                        'cpu', 'graphic_card', 'keyboard'      => array_merge($base, ['string', 'max:100']),
                        'ram'                                   => array_merge($base, ['integer', 'min:1', 'max:128']),
                        'storage'                               => array_merge($base, ['integer', 'min:64', 'max:4096']),
                        'storage_type'                          => array_merge($base, ['in:SSD,HDD']),
                        'screen_size'                           => array_merge($base, ['numeric', 'min:10', 'max:20']),
                        'weight'                                => array_merge($base, ['numeric', 'min:0.5', 'max:5']),
                        'condition'                             => array_merge($base, ['in:new,used,refurbished']),
                        default                                 => array_merge($base, ['string']),
                    },
                    'desktop' => match ($field) {
                        'cpu', 'graphic_card', 'keyboard', 'form_factor' => array_merge($base, ['string', 'max:100']),
                        'ram'                                            => array_merge($base, ['integer', 'min:1', 'max:1024']),
                        'storage'                                        => array_merge($base, ['integer', 'min:64', 'max:8192']),
                        'storage_type'                                   => array_merge($base, ['in:SSD,HDD']),
                        'internal_drives_count'                          => array_merge($base, ['integer', 'min:1', 'max:10']),
                        'condition'                                      => array_merge($base, ['in:new,used,refurbished']),
                        default                                          => array_merge($base, ['string']),
                    },
                    'license' => match ($field) {
                        'software_name', 'license_type'         => array_merge($base, ['string', 'max:100']),
                        'version', 'activation_method', 'platform' => array_merge($base, ['nullable', 'string', 'max:100']),
                        'validity_period'                       => array_merge($base, ['in:6 mois,1 an,2 ans,3 ans,4 ans,5 ans,7 ans,10 ans']),
                        default                                 => array_merge($base, ['string']),
                    },
                    'server' => match ($field) {
                        'cpu_sockets', 'drive_bays', 'rack_units', 'installed_memory', 'max_memory',
                        'ethernet_ports', 'storage_capacity' => array_merge($base, ['integer', 'min:0']),

                        'cpu_model', 'memory_type', 'form_factor', 'ethernet_speed', 'storage_type', 'raid_support'
                            => array_merge($base, ['string', 'max:100']),

                        'fiber_channel', 'redundant_power_supplies' => array_merge($base, ['boolean']),

                        'condition' => array_merge($base, ['in:new,used,refurbished']),

                        default => array_merge($base, ['string']),
                    },
                    'software' => match ($field) {
                        'name', 'type' => array_merge($base, ['string', 'max:255']),
                        'version', 'os_support' => array_merge($base, ['nullable', 'string', 'max:255']),
                        'license_included' => array_merge($base, ['boolean']),
                        'download_link' => array_merge($base, ['nullable', 'url', 'max:2048']),
                        'activation_instructions' => array_merge($base, ['nullable', 'string']),
                        default => array_merge($base, ['string']),
                    },
                    default => array_merge($base, [
                        match (true) {
                            is_int($default)     => 'integer',
                            is_numeric($default) => 'numeric',
                            is_bool($default)    => 'boolean',
                            default              => 'string',
                        }
                    ]),
                };

                $rules["spec.$field"] = $fieldRules;
            }
        }

        if ($this->isMethod('post') || $this->isMethod('patch')) {
            $rules += [
                'images'               => ['nullable', 'array'],
                'images.*'             => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
                'primary_image_index'  => ['nullable', 'integer', 'min:0'],
                'deleted_image_ids'    => ['nullable', 'array'],
                'deleted_image_ids.*'  => ['integer', 'exists:product_images,id'],
                'restored_image_ids'   => ['nullable', 'array'],
                'restored_image_ids.*' => ['integer', 'exists:product_images,id'],
            ];
        }

        return $rules;
    }
}
