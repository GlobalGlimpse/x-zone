<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->uuid('product_id')->nullable();
            
            // Snapshot des données produit (copiées du devis)
            $table->string('product_name_snapshot');
            $table->text('product_description_snapshot')->nullable();
            $table->string('product_sku_snapshot')->nullable();
            $table->decimal('unit_price_ht_snapshot', 12, 2);
            $table->decimal('tax_rate_snapshot', 5, 2)->default(20.00);
            
            // Quantité et calculs
            $table->decimal('quantity', 10, 2);
            $table->decimal('line_total_ht', 12, 2);
            $table->decimal('line_tax_amount', 12, 2);
            $table->decimal('line_total_ttc', 12, 2);
            
            // Ordre d'affichage
            $table->unsignedSmallInteger('sort_order')->default(0);
            
            $table->timestamps();
            
            // Index
            $table->index(['order_id', 'sort_order']);
            $table->foreign('product_id')->references('id')->on('products')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};