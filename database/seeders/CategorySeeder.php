<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Category, CategoryAttribute};

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Créer les catégories principales
        $electronics = Category::create([
            'name' => 'Électronique',
            'slug' => 'electronics',
            'description' => 'Tous les produits électroniques',
            'level' => 0,
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $computers = Category::create([
            'name' => 'Ordinateurs',
            'slug' => 'computers',
            'parent_id' => $electronics->id,
            'description' => 'Ordinateurs et équipements informatiques',
            'level' => 1,
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $components = Category::create([
            'name' => 'Composants',
            'slug' => 'components',
            'parent_id' => $electronics->id,
            'description' => 'Composants informatiques',
            'level' => 1,
            'sort_order' => 2,
            'is_active' => true,
        ]);

        // Sous-catégories d'ordinateurs
        $laptops = Category::create([
            'name' => 'Ordinateurs portables',
            'slug' => 'laptops',
            'parent_id' => $computers->id,
            'level' => 2,
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $desktops = Category::create([
            'name' => 'Ordinateurs de bureau',
            'slug' => 'desktops',
            'parent_id' => $computers->id,
            'level' => 2,
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $servers = Category::create([
            'name' => 'Serveurs',
            'slug' => 'servers',
            'parent_id' => $computers->id,
            'level' => 2,
            'sort_order' => 3,
            'is_active' => true,
        ]);

        // Sous-catégories de composants
        $processors = Category::create([
            'name' => 'Processeurs',
            'slug' => 'processors',
            'parent_id' => $components->id,
            'level' => 2,
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $memory = Category::create([
            'name' => 'Mémoire',
            'slug' => 'memory',
            'parent_id' => $components->id,
            'level' => 2,
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $storage = Category::create([
            'name' => 'Stockage',
            'slug' => 'storage',
            'parent_id' => $components->id,
            'level' => 2,
            'sort_order' => 3,
            'is_active' => true,
        ]);

        $graphics = Category::create([
            'name' => 'Cartes graphiques',
            'slug' => 'graphics',
            'parent_id' => $components->id,
            'level' => 2,
            'sort_order' => 4,
            'is_active' => true,
        ]);

        // Créer des attributs pour les laptops
        $this->createLaptopAttributes($laptops);
        
        // Créer des attributs pour les processeurs
        $this->createProcessorAttributes($processors);
        
        // Créer des attributs pour la mémoire
        $this->createMemoryAttributes($memory);
        
        // Créer des attributs pour le stockage
        $this->createStorageAttributes($storage);
    }

    private function createLaptopAttributes(Category $category): void
    {
        $attributes = [
            [
                'name' => 'Processeur',
                'slug' => 'cpu',
                'type' => 'text',
                'is_required' => true,
                'is_filterable' => true,
                'show_in_listing' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Mémoire RAM',
                'slug' => 'ram',
                'type' => 'number',
                'unit' => 'GB',
                'is_required' => true,
                'is_filterable' => true,
                'show_in_listing' => true,
                'sort_order' => 2,
                'validation_rules' => 'min:1|max:128',
            ],
            [
                'name' => 'Stockage',
                'slug' => 'storage',
                'type' => 'number',
                'unit' => 'GB',
                'is_required' => true,
                'is_filterable' => true,
                'show_in_listing' => true,
                'sort_order' => 3,
                'validation_rules' => 'min:64',
            ],
            [
                'name' => 'Type de stockage',
                'slug' => 'storage_type',
                'type' => 'select',
                'options' => ['SSD', 'HDD', 'Hybride'],
                'is_required' => true,
                'is_filterable' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Taille écran',
                'slug' => 'screen_size',
                'type' => 'decimal',
                'unit' => 'pouces',
                'is_filterable' => true,
                'show_in_listing' => true,
                'sort_order' => 5,
                'validation_rules' => 'min:10|max:20',
            ],
            [
                'name' => 'Carte graphique',
                'slug' => 'graphics_card',
                'type' => 'text',
                'is_filterable' => true,
                'sort_order' => 6,
            ],
            [
                'name' => 'Poids',
                'slug' => 'weight',
                'type' => 'decimal',
                'unit' => 'kg',
                'is_filterable' => true,
                'sort_order' => 7,
                'validation_rules' => 'min:0.5|max:5',
            ],
            [
                'name' => 'État',
                'slug' => 'condition',
                'type' => 'select',
                'options' => ['Neuf', 'Occasion', 'Reconditionné'],
                'is_required' => true,
                'is_filterable' => true,
                'sort_order' => 8,
            ],
        ];

        foreach ($attributes as $attr) {
            CategoryAttribute::create(array_merge($attr, ['category_id' => $category->id]));
        }
    }

    private function createProcessorAttributes(Category $category): void
    {
        $attributes = [
            [
                'name' => 'Modèle',
                'slug' => 'model',
                'type' => 'text',
                'is_required' => true,
                'is_filterable' => true,
                'show_in_listing' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Socket',
                'slug' => 'socket',
                'type' => 'select',
                'options' => ['LGA1700', 'AM5', 'AM4', 'LGA1200', 'LGA4189'],
                'is_required' => true,
                'is_filterable' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Nombre de cœurs',
                'slug' => 'cores',
                'type' => 'number',
                'is_required' => true,
                'is_filterable' => true,
                'show_in_listing' => true,
                'sort_order' => 3,
                'validation_rules' => 'min:1|max:64',
            ],
            [
                'name' => 'Fréquence de base',
                'slug' => 'base_clock',
                'type' => 'decimal',
                'unit' => 'GHz',
                'is_filterable' => true,
                'sort_order' => 4,
                'validation_rules' => 'min:1|max:6',
            ],
            [
                'name' => 'Fréquence turbo',
                'slug' => 'turbo_clock',
                'type' => 'decimal',
                'unit' => 'GHz',
                'is_filterable' => true,
                'sort_order' => 5,
                'validation_rules' => 'min:1|max:6',
            ],
            [
                'name' => 'TDP',
                'slug' => 'tdp',
                'type' => 'number',
                'unit' => 'W',
                'is_filterable' => true,
                'sort_order' => 6,
                'validation_rules' => 'min:15|max:300',
            ],
        ];

        foreach ($attributes as $attr) {
            CategoryAttribute::create(array_merge($attr, ['category_id' => $category->id]));
        }
    }

    private function createMemoryAttributes(Category $category): void
    {
        $attributes = [
            [
                'name' => 'Type',
                'slug' => 'memory_type',
                'type' => 'select',
                'options' => ['DDR3', 'DDR4', 'DDR5'],
                'is_required' => true,
                'is_filterable' => true,
                'show_in_listing' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Capacité',
                'slug' => 'capacity',
                'type' => 'number',
                'unit' => 'GB',
                'is_required' => true,
                'is_filterable' => true,
                'show_in_listing' => true,
                'sort_order' => 2,
                'validation_rules' => 'min:1|max:128',
            ],
            [
                'name' => 'Fréquence',
                'slug' => 'speed',
                'type' => 'number',
                'unit' => 'MHz',
                'is_filterable' => true,
                'show_in_listing' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Format',
                'slug' => 'form_factor',
                'type' => 'select',
                'options' => ['DIMM', 'SO-DIMM'],
                'is_required' => true,
                'is_filterable' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($attributes as $attr) {
            CategoryAttribute::create(array_merge($attr, ['category_id' => $category->id]));
        }
    }

    private function createStorageAttributes(Category $category): void
    {
        $attributes = [
            [
                'name' => 'Type',
                'slug' => 'storage_type',
                'type' => 'select',
                'options' => ['HDD', 'SSD', 'NVMe'],
                'is_required' => true,
                'is_filterable' => true,
                'show_in_listing' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Capacité',
                'slug' => 'capacity',
                'type' => 'number',
                'unit' => 'GB',
                'is_required' => true,
                'is_filterable' => true,
                'show_in_listing' => true,
                'sort_order' => 2,
                'validation_rules' => 'min:64',
            ],
            [
                'name' => 'Interface',
                'slug' => 'interface',
                'type' => 'select',
                'options' => ['SATA III', 'PCIe 3.0', 'PCIe 4.0', 'M.2'],
                'is_required' => true,
                'is_filterable' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Format',
                'slug' => 'form_factor',
                'type' => 'select',
                'options' => ['2.5"', '3.5"', 'M.2 2280', 'M.2 2242'],
                'is_required' => true,
                'is_filterable' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Vitesse de lecture',
                'slug' => 'read_speed',
                'type' => 'number',
                'unit' => 'MB/s',
                'is_filterable' => true,
                'sort_order' => 5,
            ],
        ];

        foreach ($attributes as $attr) {
            CategoryAttribute::create(array_merge($attr, ['category_id' => $category->id]));
        }
    }
}