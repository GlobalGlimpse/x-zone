<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Server extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'product_id';
    public $incrementing  = false;
    protected $keyType    = 'string';

    protected $fillable = [
    'product_id',
    'cpu_sockets',
    'cpu_model',
    'installed_memory',
    'max_memory',
    'memory_type',
    'drive_bays',
    'storage_type',
    'storage_capacity',
    'raid_support',
    'ethernet_ports',
    'ethernet_speed',
    'fiber_channel',
    'rack_units',
    'form_factor',
    'redundant_power_supplies',
    'condition',
];

}
