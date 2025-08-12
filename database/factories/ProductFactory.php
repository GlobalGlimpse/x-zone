<?php
namespace Database\Factories;

use App\Models\Product;
use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        // Récupère un brand_id déjà seedé
        $brandId = Brand::inRandomOrder()->value('id');

        // génère un petit nom réaliste
        $baseName = $this->faker->words(2, true);

        return [
            'id'             => Str::uuid()->toString(),
            'brand_id'       => $brandId,
            'name'           => "{$baseName}",
            'sku'            => strtoupper(substr(Brand::find($brandId)->name, 0, 3))
                                . '-' . $this->faker->bothify('??-#####'),
            'description'    => $this->faker->paragraph(),
            'price'          => $this->faker->randomFloat(2, 50, 2500),
            'stock_quantity' => $this->faker->numberBetween(0, 150),
            'currency_code'  => 'USD',
            'tax_rate_id'    => 1,
            'category_id'    => 1,
            'is_active'      => $this->faker->boolean(90),
        ];
    }
}
