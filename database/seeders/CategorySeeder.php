<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'rams' => 'Mémoire vive',
            'processors' => 'Processeurs',
            'hard_drives' => 'Disques durs',
            'power_supplies' => 'Alimentations',
            'motherboards' => 'Cartes mères',
            'network_cards' => 'Cartes réseau',
            'graphic_cards' => 'Cartes graphiques',
            'licenses' => 'Licences',
            'softwares' => 'Logiciels',
            'accessories' => 'Accessoires',
            'laptops' => 'Ordinateurs portables',
            'desktops' => 'Ordinateurs de bureau',
            'servers' => 'Serveurs',
        ];

        foreach ($categories as $slug => $name) {
            Category::firstOrCreate(
                ['slug' => $slug],
                ['name' => $name]
            );
        }
    }
}
