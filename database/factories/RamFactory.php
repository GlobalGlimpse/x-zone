<?php

namespace Database\Factories;

use App\Models\Ram;
use Illuminate\Database\Eloquent\Factories\Factory;

class RamFactory extends Factory
{
    protected $model = Ram::class;

    public function definition(): array
    {
        return [
            'type'         => $this->faker->randomElement(['DDR4', 'DDR5']),
            'form_factor'  => $this->faker->randomElement(['DIMM', 'SODIMM']),
            'capacity'     => $this->faker->randomElement([8, 16, 32, 64]),
            'speed'        => $this->faker->randomElement([2666, 2933, 3200, 3600]),
            'voltage'      => $this->faker->randomFloat(2, 1.1, 1.35),
            'ecc'          => $this->faker->boolean(30),
            'buffered'     => $this->faker->boolean(20),
            'rank'         => $this->faker->randomElement(['1R', '2R', '4R']),
            'module_count' => $this->faker->randomElement([1, 2]),
        ];
    }
}
