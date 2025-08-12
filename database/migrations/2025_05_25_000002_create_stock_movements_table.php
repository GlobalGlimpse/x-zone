<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /* ---------- stock_movements ---------- */
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();

            // Liens essentiels
            $table->uuid('product_id');
            $table->foreignId('provider_id')->nullable()
                  ->constrained('providers')->nullOnDelete();
            $table->foreignId('reason_id')->nullable()
                  ->constrained('stock_movement_reasons')->nullOnDelete();

            // Données du mouvement
            $table->enum('type', ['in', 'out', 'adjustment']);
            $table->integer('quantity');
            $table->string('reference')->nullable();
            $table->decimal('unit_cost', 12, 2)->nullable();
            $table->decimal('total_cost', 12, 2)->nullable();
            $table->char('currency_code', 3);
            $table->text('notes')->nullable();
            $table->timestamp('movement_date');

            // Audit
            $table->foreignId('user_id')->constrained();
            $table->timestamps();
            $table->softDeletes();

            // Contraintes & index
            $table->foreign('product_id')
                  ->references('id')->on('products')->onDelete('cascade');
            $table->foreign('currency_code')
                  ->references('code')->on('currencies');

            $table->index(['product_id', 'type', 'movement_date']);
            $table->index(['movement_date']);
            $table->index(['currency_code']);
        });

        /* ---------- pièces jointes ---------- */
        Schema::create('stock_movement_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_movement_id')
                  ->constrained()->onDelete('cascade');
            $table->string('filename');
            $table->string('path');
            $table->string('mime_type');
            $table->unsignedBigInteger('size');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movement_attachments');
        Schema::dropIfExists('stock_movements');
    }
};
