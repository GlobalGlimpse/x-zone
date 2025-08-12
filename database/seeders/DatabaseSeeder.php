<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            CategorySeeder::class,
            CurrencySeeder::class,
            TaxRateSeeder::class,
            BrandSeeder::class,
            ProductSeeder::class,
            ProviderSeeder::class,
            StockMovementReasonSeeder::class,
            AppSettingSeeder::class,
            ClientSeeder::class,
        ]);

        \App\Models\User::factory()->create([
            'name' => 'SuperAdmin',
            'email' => 'SuperAdmin@example.com',
        ])->assignRole('SuperAdmin');
    }
}
