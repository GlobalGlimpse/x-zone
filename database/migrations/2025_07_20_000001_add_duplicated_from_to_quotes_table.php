<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->foreignId('duplicated_from_id')->nullable()
                  ->after('user_id')
                  ->constrained('quotes')
                  ->onDelete('set null')
                  ->comment('ID du devis original si ce devis est une duplication');
        });
    }

    public function down(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropForeign(['duplicated_from_id']);
            $table->dropColumn('duplicated_from_id');
        });
    }
};
