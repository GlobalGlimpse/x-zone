<?php

namespace Database\Factories;

use App\Models\Motherboard;
use Illuminate\Database\Eloquent\Factories\Factory;

class MotherboardFactory extends Factory
{
    protected $model = Motherboard::class;

    public function definition(): array
    {
        $socket = $this->faker->randomElement(['LGA1700', 'AM5']);
        $chipset = $socket === 'LGA1700'
            ? $this->faker->randomElement(['Z790', 'B760'])
            : $this->faker->randomElement(['X670', 'B650']);

        return [
            'socket'           => $socket,
            'chipset'          => $chipset,
            'form_factor'      => $this->faker->randomElement(['ATX', 'mATX', 'mITX']),
            'ram_slots'        => 4,
            'max_ram'          => $this->faker->randomElement([128, 192]),
            'supported_ram_type'=> 'DDR5',
            'sata_ports'       => $this->faker->numberBetween(4, 8),
            'nvme_slots'       => $this->faker->numberBetween(1, 4),
            'pcie_slots'       => $this->faker->numberBetween(2, 4),
            'usb_ports'        => $this->faker->numberBetween(6, 12),
            'lan_ports'        => 1,
            'supports_raid'    => $this->faker->boolean(60),
        ];
    }
}
