<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('category_create');
    }

    public function rules(): array
    {
        $id = $this->category?->id;   // null sur create

        return [
            'name' => ['required','string','max:255'],
            'slug' => ['required','string','max:255','unique:categories,slug,'.$id],
        ];
    }
}
