<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Currency;

class CurrencySeeder extends Seeder
{
    public function run(): void
    {
        Currency::upsert([
            ['code' => 'MAD', 'symbol' => 'Dhs', 'name' => 'Dirham Marocain'],
        ], ['code']);
    }
}
