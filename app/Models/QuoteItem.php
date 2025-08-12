<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteItem extends Model
{
    protected $fillable = [
        'quote_id',
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
    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /* Methods */
    public function calculateAmounts(): void
    {
        $this->line_total_ht = $this->quantity * $this->unit_price_ht_snapshot;
        $this->line_tax_amount = $this->line_total_ht * ($this->tax_rate_snapshot / 100);
        $this->line_total_ttc = $this->line_total_ht + $this->line_tax_amount;
    }

    /* Boot */
    protected static function boot(): void
    {
        parent::boot();

        static::saving(function (QuoteItem $item) {
            $item->calculateAmounts();
        });

        static::saved(function (QuoteItem $item) {
            $item->quote->calculateTotals();
        });

        static::deleted(function (QuoteItem $item) {
            $item->quote->calculateTotals();
        });
    }
}