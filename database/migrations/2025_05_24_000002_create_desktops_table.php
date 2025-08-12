<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('desktops', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('cpu');
            $table->unsignedSmallInteger('ram');
            $table->string('graphic_card');
            $table->string('keyboard');
            $table->enum('condition', ['new','used','refurbished'])
                  ->default('new');

            $table->unsignedSmallInteger('storage');
            $table->enum('storage_type', ['SSD','HDD'])->default('SSD');

            $table->string('form_factor')->nullable();              // ex. "Tower", "Mini-ITX"
            $table->unsignedTinyInteger('internal_drives_count')   // nombre de disques
                  ->default(1);

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
        Schema::dropIfExists('desktops');
    }
};
