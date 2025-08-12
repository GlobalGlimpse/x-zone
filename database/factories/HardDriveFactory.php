<?php

namespace Database\Factories;

use App\Models\HardDrive;
use Illuminate\Database\Eloquent\Factories\Factory;

class HardDriveFactory extends Factory
{
    protected $model = HardDrive::class;

    public function definition(): array
    {
        $type = $this->faker->randomElement(['HDD', 'SSD', 'NVMe']);

        return [
            'type'          => $type,
            'interface'     => $type === 'NVMe' ? 'PCIe 4.0 x4' : 'SATA III',
            'capacity'      => $this->faker->randomElement([256, 512, 1024, 2048, 4096, 8000]),
            'form_factor'   => $type === 'NVMe' ? 'M.2 2280' : $this->faker->randomElement(['2.5"', '3.5"']),
            'rpm'           => $type === 'HDD' ? $this->faker->randomElement([5400, 7200, 10000]) : 0,
            'read_speed'    => $type === 'HDD'
                               ? $this->faker->numberBetween(120, 250)
                               : $this->faker->numberBetween(550, 7000),
            'write_speed'   => $type === 'HDD'
                               ? $this->faker->numberBetween(120, 250)
                               : $this->faker->numberBetween(500, 6500),
            'nand_type'     => $type === 'HDD' ? null : $this->faker->randomElement(['TLC', 'QLC', 'MLC']),
            'mtbf'          => $this->faker->numberBetween(1000000, 2500000),
            'warranty'      => $this->faker->randomElement([24, 36, 60]),
        ];
    }
}
