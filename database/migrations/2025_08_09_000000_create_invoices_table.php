<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('invoices', function (Blueprint $table) {
            // PK facture en UUID
            $table->uuid('id')->primary();

            // FKs vers clients & devis
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('quote_id')->nullable()->constrained('quotes')->nullOnDelete();

            // Métadonnées
            $table->string('number')->unique(); // ex: FAC-2025-000123
            $table->date('date')->index();
            $table->date('due_date')->nullable()->index(); // Date d’échéance
            $table->enum('status', ['draft','sent','issued','paid','partially_paid','cancelled','refunded'])
                  ->default('draft');
            $table->text('notes')->nullable(); // Notes / commentaires internes ou client
            $table->text('internal_notes')->nullable();
            $table->text('terms_conditions')->nullable();

            // Totaux
            $table->decimal('total_ht', 12, 2)->default(0);
            $table->decimal('total_tva', 12, 2)->default(0);
            $table->decimal('total_ttc', 12, 2)->default(0);




            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void {
        Schema::dropIfExists('invoices');
    }
};
