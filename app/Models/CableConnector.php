<?php

namespace App\Models;

class CableConnector extends SpecializedProduct
{
    protected $casts = [
        'length' => 'decimal:2',
    ];
}
