<?php

namespace App\Models;

class CoolingSolution extends SpecializedProduct
{
    protected $casts = [
        'fan_size'        => 'integer',
        'noise_level'     => 'decimal:1',
        'radiator_size'   => 'integer',
    ];
}
