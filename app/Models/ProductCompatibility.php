<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductCompatibility extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'product_id', 'compatible_with_id', 'type', 'direction', 'note',
    ];

    /* Relations */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function compatibleWith(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'compatible_with_id');
    }
}
