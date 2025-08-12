<?php

namespace App\Models;

class RaidController extends SpecializedProduct
{
    protected $casts = [
        'cache_memory'   => 'integer',
        'battery_backup' => 'boolean',
    ];
}
