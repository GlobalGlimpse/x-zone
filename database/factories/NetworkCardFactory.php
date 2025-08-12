<?php

namespace Database\Factories;

use App\Models\NetworkCard;
use Illuminate\Database\Eloquent\Factories\Factory;

class NetworkCardFactory extends Factory
{
    protected $model = NetworkCard::class;

    public function definition(): array
    {
        return [
            'interface'      => 'PCIe x4',
            'speed'          => $this->faker->randomElement([1, 10, 25, 40]),
            'ports'          => $this->faker->randomElement([1, 2, 4]),
            'connector_type' => $this->faker->randomElement(['RJ‑45', 'SFP+', 'QSFP28']),
            'chipset'        => 'Intel '.$this->faker->bothify('i####'),
        ];
    }
}
