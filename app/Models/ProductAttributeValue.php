<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductAttributeValue extends Model
{
    protected $fillable = [
        'product_id', 'category_attribute_id', 'value'
    ];

    protected $casts = [
        'value' => 'string', // On stocke tout en string, on cast selon le type de l'attribut
    ];

    /* ------------------------------------------------------------------ */
    /* Relations                                                          */
    /* ------------------------------------------------------------------ */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(CategoryAttribute::class, 'category_attribute_id');
    }

    /* ------------------------------------------------------------------ */
    /* Accessors                                                          */
    /* ------------------------------------------------------------------ */
    public function getFormattedValueAttribute(): string
    {
        if (!$this->attribute) {
            return (string) $this->value;
        }

        return $this->attribute->formatValue($this->getCastedValue());
    }

    public function getCastedValue()
    {
        if (!$this->attribute) {
            return $this->value;
        }

        return match ($this->attribute->type) {
            'number' => (int) $this->value,
            'decimal' => (float) $this->value,
            'boolean' => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            'json', 'multiselect' => json_decode($this->value, true) ?: [],
            'date' => $this->value ? \Carbon\Carbon::parse($this->value) : null,
            default => $this->value,
        };
    }
}