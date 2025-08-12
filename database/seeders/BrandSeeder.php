<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            'Apple','Dell','HP','Lenovo','Asus','Acer',
            'Microsoft','MSI','Razer','Alienware','Intel',
            'AMD','NVIDIA','Corsair','Logitech','Seagate',
            'Western Digital','Kingston','Samsung','LG',
        ];

        foreach ($names as $name) {
            Brand::create([
                'id'   => \Illuminate\Support\Str::uuid()->toString(),
                'name' => $name,
                'slug' => \Illuminate\Support\Str::slug($name),
            ]);
        }
    }
}
