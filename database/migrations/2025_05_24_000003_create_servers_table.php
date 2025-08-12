<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servers', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            // CPU et mémoire
            $table->unsignedTinyInteger('cpu_sockets')->default(1);
            $table->string('cpu_model')->nullable();
            $table->unsignedSmallInteger('installed_memory')->default(0); // en Go
            $table->unsignedSmallInteger('max_memory')->default(0);
            $table->enum('memory_type', ['DDR3', 'DDR4', 'DDR5'])->nullable();

            // Stockage
            $table->unsignedTinyInteger('drive_bays')->default(0);
            $table->enum('storage_type', ['HDD', 'SSD', 'Hybrid'])->default('HDD');
            $table->unsignedSmallInteger('storage_capacity')->default(0); // capacité totale en Go
            $table->enum('raid_support', ['None', 'RAID 0', 'RAID 1', 'RAID 5', 'RAID 10'])->default('None');

            // Réseau
            $table->unsignedTinyInteger('ethernet_ports')->default(1);
            $table->enum('ethernet_speed', ['1Gbps', '10Gbps', '25Gbps', '40Gbps', '100Gbps'])->default('1Gbps');
            $table->boolean('fiber_channel')->default(false); // présence de ports fibre (HBA)

            // Divers
            $table->unsignedTinyInteger('rack_units')->default(2);
            $table->enum('form_factor', ['Rack', 'Tower', 'Blade'])->default('Rack');
            $table->boolean('redundant_power_supplies')->default(false);
            $table->enum('condition', ['new', 'used', 'refurbished'])->default('new');

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
        Schema::dropIfExists('servers');
    }
};
