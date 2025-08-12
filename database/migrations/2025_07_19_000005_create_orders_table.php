<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();

            // Relations
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->foreignId('quote_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->constrained()->comment('Créateur de la commande');

            // Statuts
            $table->enum('status', [
                'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
            ])->default('pending');

            // Dates
            $table->date('order_date');
            $table->date('expected_delivery_date')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();

            // Snapshot des données client
            $table->json('client_snapshot');

            // Montants (copiés du devis)
            $table->decimal('subtotal_ht', 12, 2)->default(0);
            $table->decimal('total_tax', 12, 2)->default(0);
            $table->decimal('total_ttc', 12, 2)->default(0);
            $table->char('currency_code', 3)->default('MAD');

            // Notes
            $table->text('notes')->nullable();
            $table->text('internal_notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Index
            $table->index(['status', 'order_date']);
            $table->index(['client_id', 'status']);
            $table->foreign('currency_code')->references('code')->on('currencies');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
