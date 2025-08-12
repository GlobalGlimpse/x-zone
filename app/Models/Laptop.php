<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Laptop extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'product_id';   // <── même clef que le produit
    public $incrementing  = false;          // UUID
    protected $keyType    = 'string';

    protected $fillable = [
    'product_id',
    'cpu',
    'ram',
    'storage',
    'graphic_card',
    'keyboard',
    'condition',
    'storage_type',
    'screen_size',
    'weight',
];
}
