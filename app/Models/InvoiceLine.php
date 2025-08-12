<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class InvoiceLine extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'invoice_id',
        'product_id',
        'designation',
        'quantity',
        'unit_price_ht',
        'discount_rate',
        'tax_rate',
        'line_total_ht',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
