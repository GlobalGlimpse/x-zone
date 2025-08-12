<?php

namespace Database\Factories;

use App\Models\GraphicCard;
use Illuminate\Database\Eloquent\Factories\Factory;

class GraphicCardFactory extends Factory
{
    protected $model = GraphicCard::class;

    public function definition(): array
    {
        $gpu = $this->faker->randomElement([
            'NVIDIA RTX 4080 Super', 'AMD Radeon RX 7900 XTX', 'NVIDIA RTX A4000'
        ]);

        return [
            'gpu_chipset'      => $gpu,
            'vram'             => $this->faker->randomElement([8, 12, 16, 24]),
            'memory_type'      => 'GDDR6',
            'core_clock'       => $this->faker->numberBetween(1300, 2200),
            'boost_clock'      => $this->faker->numberBetween(1800, 2600),
            'power_consumption'=> $this->faker->numberBetween(200, 420),
            'ports'            => json_encode(['HDMI 2.1', 'DP 1.4a x3']),
        ];
    }
}
