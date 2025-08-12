<?php

namespace App\Models;

class NetworkCard extends SpecializedProduct
{
    protected $casts = [
        'speed' => 'integer',
        'ports' => 'integer',
    ];
}
