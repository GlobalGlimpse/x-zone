<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quote_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_id')->constrained()->onDelete('cascade');
            $table->uuid('product_id')->nullable(); // Peut être null si produit supprimé
            
            // Snapshot des données produit (congélation au moment de la création)
            $table->string('product_name_snapshot');
            $table->text('product_description_snapshot')->nullable();
            $table->string('product_sku_snapshot')->nullable();
            $table->decimal('unit_price_ht_snapshot', 12, 2);
            $table->decimal('tax_rate_snapshot', 5, 2)->default(20.00); // TVA Maroc standard
            
            // Quantité et calculs
            $table->decimal('quantity', 10, 2);
            $table->decimal('line_total_ht', 12, 2);
            $table->decimal('line_tax_amount', 12, 2);
            $table->decimal('line_total_ttc', 12, 2);
            
            // Ordre d'affichage
            $table->unsignedSmallInteger('sort_order')->default(0);
            
            $table->timestamps();
            
            // Index
            $table->index(['quote_id', 'sort_order']);
            $table->foreign('product_id')->references('id')->on('products')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quote_items');
    }
};