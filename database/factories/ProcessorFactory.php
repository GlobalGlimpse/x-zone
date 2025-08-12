<?php

namespace Database\Factories;

use App\Models\Processor;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProcessorFactory extends Factory
{
    protected $model = Processor::class;

    public function definition(): array
    {
        $brand  = $this->faker->randomElement(['Intel', 'AMD']);
        $socket = $brand === 'Intel'
            ? $this->faker->randomElement(['LGA1700', 'LGA4189'])
            : $this->faker->randomElement(['AM4', 'AM5']);

        $cores   = $this->faker->randomElement([6, 8, 12, 16]);
        $threads = $cores * 2;

        return [
            'model'               => $this->faker->randomElement([
                'i3-12100F', 'i5-12400', 'i5-13400F', 'i7-13700K', 'i9-13900K',
                'Ryzen 5 5600X', 'Ryzen 7 5800X3D', 'Ryzen 9 7950X', 'Ryzen 9 7900X3D'
            ]),
            'socket'              => $socket,
            'cores'               => $cores,
            'threads'             => $threads,
            'base_clock'          => $this->faker->randomFloat(2, 2.0, 3.9),
            'turbo_clock'         => $this->faker->randomFloat(2, 4.0, 5.4),
            'lithography'         => $this->faker->randomElement([5, 7, 10]),
            'tdp'                 => $this->faker->randomElement([65, 95, 125, 170]),
            'cache_l1'            => 64 * $cores,
            'cache_l2'            => 512 * $cores,
            'cache_l3'            => $this->faker->randomElement([16, 32, 64]),
            'hyperthreading'      => $brand === 'Intel',
            'integrated_graphics' => $this->faker->boolean(50),
        ];
    }
}
