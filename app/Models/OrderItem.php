<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name_snapshot',
        'product_description_snapshot',
        'product_sku_snapshot',
        'unit_price_ht_snapshot',
        'tax_rate_snapshot',
        'quantity',
        'line_total_ht',
        'line_tax_amount',
        'line_total_ttc',
        'sort_order',
    ];

    protected $casts = [
        'unit_price_ht_snapshot' => 'decimal:2',
        'tax_rate_snapshot' => 'decimal:2',
        'quantity' => 'decimal:2',
        'line_total_ht' => 'decimal:2',
        'line_tax_amount' => 'decimal:2',
        'line_total_ttc' => 'decimal:2',
    ];

    /* Relations */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}