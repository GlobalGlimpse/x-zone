<?php

namespace Database\Factories;

use App\Models\Accessory;
use Illuminate\Database\Eloquent\Factories\Factory;

class AccessoryFactory extends Factory
{
    protected $model = Accessory::class;

    public function definition(): array
    {
        return [
            'type'          => $this->faker->randomElement(['Rack rail kit', 'Mounting bracket', 'SATA cable', 'Adapter']),
            'compatibility' => $this->faker->optional()->regexify('Dell PowerEdge R[4-7]60'),
            'material'      => $this->faker->randomElement(['Steel', 'Aluminium', 'Plastic']),
            'dimensions'    => $this->faker->numberBetween(5, 50).'×'.$this->faker->numberBetween(5, 40).'×'.$this->faker->numberBetween(1, 10).' cm',
        ];
    }
}
