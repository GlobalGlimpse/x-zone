<?php

return [

    'specializations' => [

        // 1 ──────────────────────────  RAMS
        'rams' => [
            'id'    => 1,
            'model' => \App\Models\Ram::class,
            'fields' => [
                'type'         => '',
                'form_factor'  => '',
                'capacity'     => 0,
                'speed'        => 0,
                'voltage'      => '',
                'ecc'          => false,
                'buffered'     => false,
                'rank'         => '',
                'module_count' => 1,
            ],
        ],

        // 2 ──────────────────────────  PROCESSORS
        'processors' => [
            'id'    => 2,
            'model' => \App\Models\Processor::class,
            'fields' => [
                'model'               => '',
                'socket'              => '',
                'cores'               => 0,
                'threads'             => 0,
                'base_clock'          => 0,
                'turbo_clock'         => null,
                'lithography'         => null,
                'tdp'                 => null,
                'cache_l1'            => null,
                'cache_l2'            => null,
                'cache_l3'            => null,
                'integrated_graphics' => false,
            ],
        ],

        // 3 ──────────────────────────  HARD-DRIVES
        'hard_drives' => [
            'model'  => \App\Models\HardDrive::class,
            'fields' => [
                'type'            => '',
                'interface'       => '',
                'capacity'        => 0,
                'form_factor'     => '',
                'rpm'             => null,
                'read_speed'      => null,
                'write_speed'     => null,
                'nand_type'       => null,
                'mtbf'            => null,
                'warranty'        => null,
            ],
        ],

        // 4 ──────────────────────────  POWER-SUPPLIES
        'power_supplies' => [
            'id'    => 4,
            'model' => \App\Models\PowerSupply::class,
            'fields' => [
                'power'               => 0,
                'efficiency_rating'   => '',
                'modular'             => false,
                'form_factor'         => '',
                'connector_types'     => '',
                'protection_features' => '',
            ],
        ],

        // 5 ──────────────────────────  MOTHERBOARDS
        'motherboards' => [
            'model'  => \App\Models\Motherboard::class,
            'fields' => [
                'socket'             => '',
                'chipset'            => '',
                'form_factor'        => '',
                'ram_slots'          => 0,
                'max_ram'            => 0,
                'supported_ram_type' => '',
                'sata_ports'         => 0,
                'nvme_slots'         => 0,
                'pcie_slots'         => 0,
                'usb_ports'          => 0,
                'lan_ports'          => 1,
                'supports_raid'      => null,
            ],
        ],

        // 6 ──────────────────────────  NETWORK CARDS
        'network_cards' => [
            'model'  => \App\Models\NetworkCard::class,
            'fields' => [
                'interface'      => '',
                'speed'          => 0,
                'ports'          => 1,
                'connector_type' => '',
                'chipset'        => null,
            ],
        ],

        // 7 ──────────────────────────  GRAPHIC CARDS
        'graphic_cards' => [
            'id'    => 7,
            'model' => \App\Models\GraphicCard::class,
            'fields' => [
                'gpu_chipset'       => '',
                'vram'              => 0,
                'memory_type'       => '',
                'core_clock'        => 0,
                'boost_clock'       => 0,
                'power_consumption' => 0,
                'ports'             => '',
            ],
        ],

        // 8 ──────────────────────────  LICENSES
        'licenses' => [
            'model' => \App\Models\License::class,
            'fields' => [
                'software_name'     => '',
                'version'           => null,
                'license_type'      => '',
                'validity_period'   => '1 an',
                'activation_method' => null,
                'platform'          => null,
            ],
        ],

        // 9 ──────────────────────────  SOFTWARES
        'softwares' => [
            'id'    => 9,
            'model' => \App\Models\Software::class,
            'fields' => [
            'name'                    => '',
            'version'                 => '',
            'os_support'              => '',
            'type'                    => '',
            'license_included'        => true,
            'download_link'           => null,
            'activation_instructions' => null,
        ],
        ],

        // 10 ─────────────────────────  ACCESSORIES
        'accessories' => [
            'id'    => 10,
            'model' => \App\Models\Accessory::class,
            'fields' => [
                'type'          => '',
                'compatibility' => '',
                'material'      => '',
                'dimensions'    => '',
            ],
        ],

        // 11 ─────────────────────────  LAPTOPS
        'laptops' => [
            'model' => \App\Models\Laptop::class,
            'fields' => [
                'cpu'              => '',
                'ram'              => 8,
                'graphic_card'     => '',
                'keyboard'         => 'AZERTY',
                'condition'        => 'new',
                'storage'          => 512,
                'storage_type'     => 'SSD',
                'screen_size'      => 15.6,
                'weight'           => 1.5,
            ],
        ],

        // 12 ─────────────────────────  DESKTOPS
        'desktops' => [
            'model' => \App\Models\Desktop::class,
            'fields' => [
                'cpu'                   => '',
                'ram'                   => 0,
                'graphic_card'          => '',
                'keyboard'              => '',
                'condition'             => 'new',
                'storage'               => 0,
                'storage_type'          => 'SSD',
                'form_factor'           => '',
                'internal_drives_count' => 1,
            ],
        ],

        // 13 ─────────────────────────  SERVERS
        'servers' => [
            'id'    => 13,
            'model' => \App\Models\Server::class,
            'fields' => [
                'cpu_sockets'              => 1,
                'cpu_model'                => '',
                'installed_memory'         => 0,
                'max_memory'               => 0,
                'memory_type'              => '',
                'drive_bays'               => 0,
                'storage_type'             => 'HDD',
                'storage_capacity'         => 0,
                'raid_support'             => 'None',
                'ethernet_ports'           => 1,
                'ethernet_speed'           => '1Gbps',
                'fiber_channel'            => false,
                'rack_units'               => 2,
                'form_factor'              => 'Rack',
                'redundant_power_supplies' => false,
                'condition'                => 'new',
            ],
        ],

    ],
];
