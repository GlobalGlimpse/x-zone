<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Illuminate\Database\Eloquent\SoftDeletes;

class CategoryAttribute extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id', 'name', 'slug', 'type', 'options', 'unit',
        'is_required', 'is_filterable', 'is_searchable', 'show_in_listing',
        'sort_order', 'description', 'validation_rules'
    ];

    protected $casts = [
        'options' => 'array',
        'is_required' => 'boolean',
        'is_filterable' => 'boolean',
        'is_searchable' => 'boolean',
        'show_in_listing' => 'boolean',
        'sort_order' => 'integer',
    ];

    /* ------------------------------------------------------------------ */
    /* Relations                                                          */
    /* ------------------------------------------------------------------ */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function values(): HasMany
    {
        return $this->hasMany(ProductAttributeValue::class);
    }

    /* ------------------------------------------------------------------ */
    /* Accessors                                                          */
    /* ------------------------------------------------------------------ */
    public function getFormattedNameAttribute(): string
    {
        return $this->unit ? "{$this->name} ({$this->unit})" : $this->name;
    }

    public function getValidationRulesArrayAttribute(): array
    {
        if (!$this->validation_rules) {
            return [];
        }

        return explode('|', $this->validation_rules);
    }

    /* ------------------------------------------------------------------ */
    /* Méthodes utilitaires                                               */
    /* ------------------------------------------------------------------ */
    public function getDistinctValues(): array
    {
        return $this->values()
            ->distinct('value')
            ->whereNotNull('value')
            ->pluck('value')
            ->filter()
            ->sort()
            ->values()
            ->toArray();
    }

    public function formatValue($value): string
    {
        if (is_null($value)) {
            return '';
        }

        return match ($this->type) {
            'boolean' => $value ? 'Oui' : 'Non',
            'number', 'decimal' => $this->unit ? "{$value} {$this->unit}" : (string) $value,
            'select', 'multiselect' => is_array($value) ? implode(', ', $value) : (string) $value,
            'json' => is_array($value) ? implode(', ', $value) : (string) $value,
            default => (string) $value,
        };
    }
}