<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{
    Category, Product, Ram, Processor, HardDrive,
    PowerSupply, Motherboard, NetworkCard,
    GraphicCard, License, Accessory
};
use Illuminate\Support\Arr;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::pluck('id','slug')->all();
        $taxRateId  = 1;

        $counts = [
            'rams'          => 30,
            'processors'    => 20,
            'hard_drives'   => 20,
            'graphic_cards' => 10,
            'licenses'      => 10,
            'accessories'   => 10,
        ];

        foreach ($counts as $slug => $qty) {
            for ($i = 0; $i < $qty; $i++) {
                $p = Product::factory()->create([
                    'category_id'   => $categories[$slug],
                    'currency_code' => Arr::random(['MAD']),
                    'tax_rate_id'   => $taxRateId,
                ]);

                match ($slug) {
                    'rams'          => Ram::factory()->create(['product_id'=>$p->id]),
                    'processors'    => Processor::factory()->create(['product_id'=>$p->id]),
                    'hard_drives'   => HardDrive::factory()->create(['product_id'=>$p->id]),
                    'graphic_cards' => GraphicCard::factory()->create(['product_id'=>$p->id]),
                    'licenses'      => License::factory()->create(['product_id'=>$p->id]),
                    'accessories'   => Accessory::factory()->create(['product_id'=>$p->id]),
                };
            }
        }
    }
}
