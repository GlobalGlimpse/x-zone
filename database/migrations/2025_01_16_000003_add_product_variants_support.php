<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ajouter le support des variantes à la table products
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('has_variants')->default(false)->after('is_active');
            $table->string('meta_title')->nullable()->after('description');
            $table->text('meta_description')->nullable()->after('meta_title');
            $table->text('meta_keywords')->nullable()->after('meta_description');
        });

        // Table pour les attributs dynamiques des catégories
        Schema::create('category_attributes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('name'); // ex: "RAM", "Capacité", "Couleur"
            $table->string('slug'); // ex: "ram", "capacity", "color"
            $table->enum('type', [
                'text', 'number', 'decimal', 'boolean', 'select', 'multiselect', 
                'date', 'url', 'email', 'textarea', 'json'
            ])->default('text');
            $table->json('options')->nullable(); // Pour select/multiselect
            $table->string('unit')->nullable(); // ex: "GB", "MHz", "cm"
            $table->boolean('is_required')->default(false);
            $table->boolean('is_filterable')->default(true);
            $table->boolean('is_searchable')->default(false);
            $table->boolean('show_in_listing')->default(false);
            $table->integer('sort_order')->default(0);
            $table->text('description')->nullable();
            $table->string('validation_rules')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['category_id', 'slug']);
            $table->index(['category_id', 'sort_order']);
        });

        // Table pour les valeurs des attributs des produits
        Schema::create('product_attribute_values', function (Blueprint $table) {
            $table->id();
            $table->uuid('product_id');
            $table->foreignId('category_attribute_id')->constrained()->onDelete('cascade');
            $table->text('value')->nullable();
            $table->timestamps();
            
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->unique(['product_id', 'category_attribute_id']);
            $table->index(['category_attribute_id', 'value']);
        });

        // Table pour les variantes de produits
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

        // Table pour les images des variantes
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
        
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['has_variants', 'meta_title', 'meta_description', 'meta_keywords']);
        });
    }
};