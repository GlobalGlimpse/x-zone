<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;
use App\Models\Category;
use App\Models\Product;

class CheckCatalogSpecializations extends Command
{
    protected $signature = 'catalog:check-specializations';
    protected $description = 'Vérifie les slugs, modèles et relations des spécialisations dans config/catalog.php';

    public function handle(): int
    {
        $this->info('🔍 Vérification des spécialisations dans config/catalog.php');

        $config = Config::get('catalog.specializations', []);
        $categorySlugs = Category::pluck('slug')->all();
        $product = new Product;

        foreach ($categorySlugs as $slug) {
            $this->line("→ Catégorie : $slug");

            if (!isset($config[$slug])) {
                $this->warn("  ⚠️  Slug \"$slug\" manquant dans config.");
                continue;
            }

            $entry = $config[$slug];

            if (empty($entry['model'])) {
                $this->warn("  ⚠️  Pas de `model` défini.");
            } elseif (!class_exists($entry['model'])) {
                $this->error("  ❌ Le model {$entry['model']} n'existe pas.");
            } else {
                $this->info("  ✅ Modèle trouvé : {$entry['model']}");
            }

            $relation = Str::camel($slug);
            if (!method_exists($product, $relation)) {
                $this->warn("  ⚠️  Relation `{$relation}()` absente du modèle Product.");
            } else {
                $this->info("  ✅ Relation présente : `$relation()`");
            }
        }

        $this->info("\n🎉 Vérification terminée.");
        return 0;
    }
}
