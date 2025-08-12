<?php

namespace App\Models;

class Battery extends SpecializedProduct
{
    protected $casts = [
        'capacity'  => 'integer',
        'voltage'   => 'decimal:2',
        'cells'     => 'integer',
    ];
}
