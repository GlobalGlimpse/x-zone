<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();

            // Informations générales
            $table->string('company_name');
            $table->string('contact_name')->nullable();
            $table->string('email');
            $table->string('phone')->nullable();
            $table->text('address');
            $table->string('city');
            $table->string('postal_code')->nullable();
            $table->string('country')->default('Maroc');

            // Données fiscales marocaines
            $table->string('ice')->nullable()->comment('Identifiant Commun de l\'Entreprise');
            $table->string('rc')->nullable()->comment('Registre de Commerce');
            $table->string('patente')->nullable()->comment('Numéro de patente');
            $table->string('cnss')->nullable()->comment('Caisse Nationale de Sécurité Sociale');
            $table->string('if_number')->nullable()->comment('Identifiant Fiscal');
            $table->enum('tax_regime', ['normal', 'auto_entrepreneur', 'exonere'])->default('normal');
            $table->boolean('is_tva_subject')->default(true)->comment('Assujetti à la TVA');

            // Métadonnées
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();


            // Index
            $table->index(['company_name', 'is_active']);
            $table->index('ice');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
