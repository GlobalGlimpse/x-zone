<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GraphicCard extends SpecializedProduct
{
    protected $primaryKey = 'product_id';       // <- clé primaire personnalisée
    public $incrementing = false;               // <- car UUID
    protected $keyType = 'string';              // <- UUID = string

    protected $casts = [
        'vram'              => 'integer',
        'core_clock'        => 'integer',
        'boost_clock'       => 'integer',
        'power_consumption' => 'integer',
    ];
}
