<?php

namespace App\Models;

class Chassis extends SpecializedProduct
{
    protected $casts = [
        'drive_bays' => 'integer',
    ];
}
