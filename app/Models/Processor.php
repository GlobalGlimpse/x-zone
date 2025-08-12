<?php

namespace App\Models;

class Processor extends SpecializedProduct
{
    protected $casts = [
        'cores'                => 'integer',
        'threads'              => 'integer',
        'base_clock'           => 'decimal:2',
        'turbo_clock'          => 'decimal:2',
        'lithography'          => 'integer',
        'tdp'                  => 'integer',
        'cache_l1'             => 'integer',
        'cache_l2'             => 'integer',
        'cache_l3'             => 'integer',
        'hyperthreading'       => 'boolean',
        'integrated_graphics'  => 'boolean',
    ];
}
