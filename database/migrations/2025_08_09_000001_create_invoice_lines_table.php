<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('invoice_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // FK vers invoices (UUID)
            $table->uuid('invoice_id')->index();
            $table->foreign('invoice_id')
                  ->references('id')->on('invoices')
                  ->cascadeOnDelete();

            // Produit lié (UUID) — nullable car on stocke un snapshot
            $table->uuid('product_id')->nullable()->index();
            // Si ta table products a bien un UUID comme PK, dé-commente la ligne suivante :
            // $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();

            // Snapshot / montants
            $table->string('designation');
            $table->decimal('quantity', 12, 2);         // aligné sur QuoteItem (decimal:2)
            $table->decimal('unit_price_ht', 12, 2);
            $table->decimal('discount_rate', 5, 2)->default(0); // si pas de remise côté devis → 0
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('line_total_ht', 12, 2)->default(0);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void {
        Schema::dropIfExists('invoice_lines');
    }
};
