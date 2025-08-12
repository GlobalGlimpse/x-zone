<?php

namespace Database\Seeders;

use App\Models\TaxRate;
use Illuminate\Database\Seeder;

class TaxRateSeeder extends Seeder
{
    public function run(): void
    {
        TaxRate::upsert([
            ['id' => 1, 'name' => 'Standard 20%', 'rate' => 20.00],
            ['id' => 2, 'name' => 'Reduced 10%',  'rate' => 10.00],
        ], ['id']);
    }
}
