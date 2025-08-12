<?php

namespace App\Models;

class Motherboard extends SpecializedProduct
{
    protected $casts = [
        'ram_slots'     => 'integer',
        'max_ram'       => 'integer',
        'sata_ports'    => 'integer',
        'nvme_slots'    => 'integer',
        'pcie_slots'    => 'integer',
        'usb_ports'     => 'integer',
        'lan_ports'     => 'integer',
        'supports_raid' => 'boolean',
    ];
}
