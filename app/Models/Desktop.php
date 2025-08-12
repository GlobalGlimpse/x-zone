<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Desktop extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'product_id';
    public $incrementing  = false;
    protected $keyType    = 'string';

    protected $fillable = [
        'product_id',
        'cpu',
        'ram',
        'graphic_card',
        'keyboard',
        'condition',
        'storage',
        'storage_type',
        'form_factor',
        'internal_drives_count',
    ];
}
