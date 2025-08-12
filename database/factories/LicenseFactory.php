<?php

namespace Database\Factories;

use App\Models\License;
use Illuminate\Database\Eloquent\Factories\Factory;

class LicenseFactory extends Factory
{
    protected $model = License::class;

    public function definition(): array
    {
        return [
            'software_name'   => $this->faker->randomElement(['Windows Server', 'VMware vSphere', 'Red Hat RHEL']),
            'version'         => $this->faker->randomElement(['2022', '8', '7.0']),
            'license_type'    => $this->faker->randomElement(['OEM', 'Retail', 'Volume']),
            'validity_period' => $this->faker->randomElement(['1 year', '3 years', 'lifetime']),
            'activation_method'=> $this->faker->randomElement(['Key', 'KMS', 'OEM‑BIOS']),
            'platform'        => $this->faker->randomElement(['Windows', 'Linux']),
        ];
    }
}
