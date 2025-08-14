<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'parent_product_id', 'sku', 'price', 'stock_quantity', 
        'variant_attributes', 'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'variant_attributes' => 'array',
        'is_active' => 'boolean',
    ];

    /* ------------------------------------------------------------------ */
    /* Relations                                                          */
    /* ------------------------------------------------------------------ */
    public function parentProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'parent_product_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductVariantImage::class, 'variant_id')->orderBy('sort_order');
    }

    /* ------------------------------------------------------------------ */
    /* Scopes                                                             */
    /* ------------------------------------------------------------------ */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /* ------------------------------------------------------------------ */
    /* Accessors                                                          */
    /* ------------------------------------------------------------------ */
    public function getDisplayNameAttribute(): string
    {
        $name = $this->parentProduct->name ?? 'Produit';
        
        if (!empty($this->variant_attributes)) {
            $attributes = collect($this->variant_attributes)
                ->map(fn($value, $key) => "{$key}: {$value}")
                ->implode(', ');
            
            return "{$name} ({$attributes})";
        }
        
        return $name;
    }

    public function getEffectivePriceAttribute(): float
    {
        return $this->price ?? $this->parentProduct->price ?? 0;
    }

    public function getPrimaryImageAttribute(): ?ProductVariantImage
    {
        return $this->images()->where('is_primary', true)->first() 
            ?? $this->images()->first();
    }
}