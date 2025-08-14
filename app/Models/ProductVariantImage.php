<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class ProductVariantImage extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'variant_id', 'path', 'is_primary', 'sort_order'
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'sort_order' => 'integer',
    ];

    /* ------------------------------------------------------------------ */
    /* Relations                                                          */
    /* ------------------------------------------------------------------ */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    /* ------------------------------------------------------------------ */
    /* Accessors                                                          */
    /* ------------------------------------------------------------------ */
    public function getUrlAttribute(): string
    {
        return Storage::url($this->path);
    }
}