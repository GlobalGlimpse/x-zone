<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Currency extends Model
{
    use SoftDeletes;
    /** clé primaire = code ISO (char 3) */
    protected $primaryKey = 'code';
    public $incrementing  = false;
    protected $keyType    = 'string';
    public    $timestamps = true;   // migrations → timestamps()

    protected $fillable = ['code', 'symbol', 'name'];

    /* Relations */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'currency_code', 'code');
    }

    public function priceHistories(): HasMany
    {
        return $this->hasMany(PriceHistory::class, 'currency_code', 'code');
    }
}
