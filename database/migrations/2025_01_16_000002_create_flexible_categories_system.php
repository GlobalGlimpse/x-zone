<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Modifier la table categories pour supporter la hiérarchie
        Schema::table('categories', function (Blueprint $table) {
            $table->unsignedBigInteger('parent_id')->nullable()->after('id');
            $table->tinyInteger('level')->unsigned()->default(0)->after('parent_id');
            $table->integer('sort_order')->unsigned()->default(0)->after('level');
            $table->boolean('is_active')->default(true)->after('sort_order');
            $table->text('description')->nullable()->after('slug');
            $table->string('icon')->nullable()->after('description');
            $table->string('image')->nullable()->after('icon');
            
            // Contrainte de clé étrangère pour parent_id
            $table->foreign('parent_id')->references('id')->on('categories')->onDelete('cascade');
            
            // Index pour les performances
            $table->index(['parent_id', 'sort_order']);
            $table->index(['is_active', 'level']);
        });

        // 2. Table pour les attributs dynamiques des catégories
        Schema::create('category_attributes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('name'); // ex: "RAM", "Capacité", "Couleur"
            $table->string('slug'); // ex: "ram", "capacity", "color"
            $table->enum('type', [
                'text', 'number', 'decimal', 'boolean', 'select', 'multiselect', 
                'date', 'url', 'email', 'textarea', 'json'
            ])->default('text');
            $table->json('options')->nullable(); // Pour select/multiselect: ["option1", "option2"]
            $table->string('unit')->nullable(); // ex: "GB", "MHz", "cm"
            $table->boolean('is_required')->default(false);
            $table->boolean('is_filterable')->default(true);
            $table->boolean('is_searchable')->default(false);
            $table->boolean('show_in_listing')->default(false);
            $table->integer('sort_order')->default(0);
            $table->text('description')->nullable();
            $table->string('validation_rules')->nullable(); // ex: "min:1|max:100"
            $table->timestamps();
            
            $table->unique(['category_id', 'slug']);
            $table->index(['category_id', 'sort_order']);
        });

        // 3. Table pour les valeurs des attributs des produits
        Schema::create('product_attribute_values', function (Blueprint $table) {
            $table->id();
            $table->uuid('product_id');
            $table->foreignId('category_attribute_id')->constrained()->onDelete('cascade');
            $table->text('value')->nullable(); // Stockage flexible (text, json, etc.)
            $table->timestamps();
            
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->unique(['product_id', 'category_attribute_id']);
            $table->index(['category_attribute_id', 'value']);
        });

        // 4. Table pour les variantes de produits (pour l'e-commerce)
        Schema::create('product_variants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('parent_product_id');
            $table->string('sku')->unique();
            $table->decimal('price', 12, 2)->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->json('variant_attributes'); // ex: {"color": "red", "size": "L"}
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('parent_product_id')->references('id')->on('products')->onDelete('cascade');
            $table->index(['parent_product_id', 'is_active']);
        });

        // 5. Table pour les images des variantes
        Schema::create('product_variant_images', function (Blueprint $table) {
            $table->id();
            $table->uuid('variant_id');
            $table->string('path');
            $table->boolean('is_primary')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('variant_id')->references('id')->on('product_variants')->onDelete('cascade');
            $table->index(['variant_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variant_images');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('product_attribute_values');
        Schema::dropIfExists('category_attributes');
        
        Schema::table('categories', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn([
                'parent_id', 'level', 'sort_order', 'is_active', 
                'description', 'icon', 'image'
            ]);
        });
    }
};