<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('product_id');
            $table->integer('quantity');            // + / -
            $table->string('type');                 // purchase, sale, adjust…
            $table->string('reference')->nullable();// PO‑num, invoice‑num…
            $table->foreignId('user_id')->nullable()->constrained();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->foreign('product_id')
                  ->references('id')->on('products')
                  ->onDelete('cascade');
        });
    }
    public function down(): void { Schema::dropIfExists('stock_transactions'); }
};
