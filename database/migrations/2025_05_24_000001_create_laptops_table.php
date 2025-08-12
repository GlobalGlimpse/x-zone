<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laptops', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('cpu');                  // ex. "Intel i7-1165G7"
            $table->unsignedSmallInteger('ram');    // GB
            $table->string('graphic_card')->nullable();         // ex. "NVIDIA RTX 3050"
            $table->string('keyboard');             // ex. "AZERTY backlit"
            $table->enum('condition', ['new','used','refurbished'])
                  ->default('new');

            $table->unsignedSmallInteger('storage');
            $table->enum('storage_type', ['SSD','HDD'])->default('SSD');

            $table->decimal('screen_size', 4, 1)->nullable();       // pouces
            $table->decimal('weight', 5, 2)->nullable();            // kg

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')
                  ->references('id')
                  ->on('products')
                  ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laptops');
    }
};
