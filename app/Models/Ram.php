<?php

namespace App\Models;

class Ram extends SpecializedProduct
{
    protected $casts = [
        'capacity'      => 'integer',
        'speed'         => 'integer',
        'voltage'       => 'decimal:2',
        'ecc'           => 'boolean',
        'buffered'      => 'boolean',
        'module_count'  => 'integer',
    ];
}
