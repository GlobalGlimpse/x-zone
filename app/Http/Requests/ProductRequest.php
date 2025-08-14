<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\{Category, CategoryAttribute};

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return match ($this->method()) {
            'POST' => $this->user()->can('product_create'),
            'PATCH' => $this->user()->can('product_edit'),
            'DELETE' => $this->user()->can('product_delete'),
            default => true,
        };
    }

    public function rules(): array
    {
        $id = $this->route('product');

        $rules = [
            'brand_id' => ['required', 'uuid', 'exists:brands,id'],
            'name' => ['required', 'string', 'max:255'],
            'model' => ['nullable', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:50', Rule::unique('products', 'sku')->ignore($id)],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'currency_code' => ['required', 'exists:currencies,code'],
            'tax_rate_id' => ['required', 'exists:tax_rates,id'],
            'category_id' => ['required', 'exists:categories,id'],
            'is_active' => ['boolean'],
            'has_variants' => ['boolean'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords' => ['nullable', 'string', 'max:500'],
        ];

        // Règles dynamiques pour les attributs de catégorie
        if ($this->filled('category_id')) {
            $category = Category::find($this->category_id);
            if ($category) {
                $attributes = $category->getCategoryAttributes();
                
                foreach ($attributes as $attr) {
                    $fieldName = "attributes.{$attr->slug}";
                    $fieldRules = ['nullable'];

                    if ($attr->is_required) {
                        $fieldRules = ['required'];
                    }

                    // Règles selon le type
                    $fieldRules = array_merge($fieldRules, match ($attr->type) {
                        'text', 'textarea' => ['string', 'max:1000'],
                        'number' => ['integer'],
                        'decimal' => ['numeric'],
                        'boolean' => ['boolean'],
                        'select' => $attr->options ? [Rule::in($attr->options)] : ['string'],
                        'multiselect' => ['array'],
                        'date' => ['date'],
                        'url' => ['url'],
                        'email' => ['email'],
                        'json' => ['array'],
                        default => ['string'],
                    });

                    // Règles de validation personnalisées
                    if ($attr->validation_rules) {
                        $customRules = explode('|', $attr->validation_rules);
                        $fieldRules = array_merge($fieldRules, $customRules);
                    }

                    $rules[$fieldName] = $fieldRules;
                }
            }
        }

        // Règles pour les images et compatibilités (conservées)
        if ($this->isMethod('post') || $this->isMethod('patch')) {
            $rules += [
                'images' => ['nullable', 'array'],
                'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
                'primary_image_index' => ['nullable', 'integer', 'min:0'],
                'deleted_image_ids' => ['nullable', 'array'],
                'deleted_image_ids.*' => ['integer', 'exists:product_images,id'],
                'restored_image_ids' => ['nullable', 'array'],
                'restored_image_ids.*' => ['integer', 'exists:product_images,id'],
                'compatibilities' => ['nullable', 'array'],
                'compatibilities.*.compatible_with_id' => ['required', 'uuid', 'exists:products,id'],
                'compatibilities.*.direction' => ['required', 'in:bidirectional,uni'],
                'compatibilities.*.note' => ['nullable', 'string', 'max:500'],
            ];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'attributes.*.required' => 'Ce champ est requis.',
            'attributes.*.string' => 'Ce champ doit être une chaîne de caractères.',
            'attributes.*.integer' => 'Ce champ doit être un nombre entier.',
            'attributes.*.numeric' => 'Ce champ doit être un nombre.',
            'attributes.*.boolean' => 'Ce champ doit être vrai ou faux.',
            'attributes.*.date' => 'Ce champ doit être une date valide.',
            'attributes.*.url' => 'Ce champ doit être une URL valide.',
            'attributes.*.email' => 'Ce champ doit être une adresse email valide.',
        ];
    }
}