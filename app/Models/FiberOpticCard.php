<?php

namespace App\Models;

class FiberOpticCard extends SpecializedProduct
{
    protected $casts = [
        'speed'      => 'integer',
        'wavelength' => 'integer',
    ];
}
