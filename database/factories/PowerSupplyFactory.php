<?php

namespace Database\Factories;

use App\Models\PowerSupply;
use Illuminate\Database\Eloquent\Factories\Factory;

class PowerSupplyFactory extends Factory
{
    protected $model = PowerSupply::class;

    public function definition(): array
    {
        return [
            'power'              => $this->faker->randomElement([450, 550, 750, 850, 1000, 1600]),
            'efficiency_rating'  => $this->faker->randomElement(['80+ Bronze', '80+ Gold', '80+ Platinum']),
            'modular'            => $this->faker->boolean(70),
            'form_factor'        => 'ATX',
            'connector_types'    => json_encode(['24‑pin', '8‑pin CPU', 'PCIe 8‑pin x2', 'SATA x4']),
            'protection_features'=> json_encode(['OCP', 'OVP', 'OTP', 'SCP']),
        ];
    }
}
