<?php

namespace App\Models;

class HardDrive extends SpecializedProduct
{
    protected $casts = [
        'capacity'      => 'integer',
        'rpm'           => 'integer',
        'read_speed'    => 'integer',
        'write_speed'   => 'integer',
        'mtbf'          => 'integer',
        'warranty'      => 'integer',
    ];
}
