<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceHistory extends Model
{
    protected $fillable = [
        'product_id', 'price', 'currency_code', 'starts_at', 'ends_at',
    ];

    protected $casts = [
        'price'     => 'decimal:2',
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
    ];

    /* Relations */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency_code', 'code');
    }
}
