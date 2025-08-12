<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->string('quote_number')->unique();

            // Relations
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->comment('Créateur du devis');

            // Statuts et dates
            $table->enum('status', [
                'draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted'
            ])->default('draft');
            $table->date('quote_date');
            $table->date('valid_until');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('viewed_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('converted_at')->nullable();

            // Snapshot des données client (au moment de la création)
            $table->json('client_snapshot');

            // Montants
            $table->decimal('subtotal_ht', 12, 2)->default(0);
            $table->decimal('total_tax', 12, 2)->default(0);
            $table->decimal('total_ttc', 12, 2)->default(0);
            $table->char('currency_code', 3)->default('MAD');

            // Conditions et notes
            $table->text('terms_conditions')->nullable();
            $table->text('notes')->nullable();
            $table->text('internal_notes')->nullable();

            // Validité
            $table->boolean('is_expired')->default(false);

            $table->timestamps();
            $table->softDeletes();

            // Index
            $table->index(['status', 'quote_date']);
            $table->index(['client_id', 'status']);
            $table->index('valid_until');
            $table->foreign('currency_code')->references('code')->on('currencies');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
