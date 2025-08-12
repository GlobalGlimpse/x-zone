<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /** ---------- RAMS ------------------------------------------------- */
        Schema::create('rams', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('type', 10);          // DDR3/4/5
            $table->string('form_factor', 10);   // DIMM, SO‑DIMM…
            $table->unsignedSmallInteger('capacity');  // GB
            $table->unsignedSmallInteger('speed');     // MHz
            $table->decimal('voltage', 3, 2)->nullable();
            $table->boolean('ecc')->default(false);
            $table->boolean('buffered')->default(false);
            $table->string('rank')->nullable();
            $table->unsignedTinyInteger('module_count')->default(1);

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->index(['type', 'form_factor']);
            $table->index(['capacity', 'speed']);
        });

        /** ---------- PROCESSORS ------------------------------------------ */
        Schema::create('processors', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('model');
            $table->string('socket');
            $table->unsignedTinyInteger('cores');
            $table->unsignedTinyInteger('threads');
            $table->decimal('base_clock', 5, 2);       // GHz
            $table->decimal('turbo_clock', 5, 2)->nullable();
            $table->unsignedTinyInteger('lithography')->nullable(); // nm
            $table->unsignedSmallInteger('tdp')->nullable();        // W
            $table->unsignedSmallInteger('cache_l1')->nullable();   // KB
            $table->unsignedSmallInteger('cache_l2')->nullable();   // KB
            $table->unsignedSmallInteger('cache_l3')->nullable();   // MB
            $table->boolean('hyperthreading')->default(false);
            $table->boolean('integrated_graphics')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->index('socket');
        });

        /** ---------- HARD DRIVES ----------------------------------------- */
        Schema::create('hard_drives', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('type');                           // HDD, SSD, NVMe
            $table->string('interface');                     // SATA, PCIe…
            $table->unsignedInteger('capacity');             // GB
            $table->string('form_factor');                   // 2.5", 3.5"
            $table->unsignedSmallInteger('rpm')->nullable(); // 0 pour SSD/NVMe
            $table->unsignedSmallInteger('read_speed')->nullable();  // MB/s
            $table->unsignedSmallInteger('write_speed')->nullable(); // MB/s
            $table->string('nand_type')->nullable();         // TLC…
            $table->unsignedInteger('mtbf')->nullable();     // h
            $table->unsignedSmallInteger('warranty')->nullable(); // mois

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->index(['type', 'interface']);
        });

        /** ---------- POWER SUPPLIES -------------------------------------- */
        Schema::create('power_supplies', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->unsignedSmallInteger('power');           // W
            $table->string('efficiency_rating');             // 80+ Gold…
            $table->boolean('modular')->default(false);
            $table->string('form_factor');                   // ATX…
            $table->text('connector_types')->nullable();     // json list
            $table->text('protection_features')->nullable(); // OVP, OCP…

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        /** ---------- MOTHERBOARDS --------------------------------------- */
        Schema::create('motherboards', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('socket');
            $table->string('chipset');
            $table->string('form_factor');                   // ATX, mITX…
            $table->unsignedTinyInteger('ram_slots');
            $table->unsignedSmallInteger('max_ram');         // GB
            $table->string('supported_ram_type');
            $table->unsignedTinyInteger('sata_ports')->default(0);
            $table->unsignedTinyInteger('nvme_slots')->default(0);
            $table->unsignedTinyInteger('pcie_slots')->default(0);
            $table->unsignedTinyInteger('usb_ports')->default(0);
            $table->unsignedTinyInteger('lan_ports')->default(1);
            $table->boolean('supports_raid')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->index('socket');
        });

        /** ---------- NETWORK CARDS -------------------------------------- */
        Schema::create('network_cards', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('interface');                     // PCIe…
            $table->unsignedSmallInteger('speed');           // Gbps
            $table->unsignedTinyInteger('ports');
            $table->string('connector_type');                // RJ‑45, SFP+
            $table->string('chipset')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        /** ---------- RAID CONTROLLERS ----------------------------------- */
        Schema::create('raid_controllers', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('interface');                     // PCIe…
            $table->string('supported_raid_levels');         // 0,1,5,10…
            $table->unsignedSmallInteger('cache_memory')->nullable(); // MB
            $table->boolean('battery_backup')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        /** ---------- COOLING SOLUTIONS ---------------------------------- */
        Schema::create('cooling_solutions', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('type');                          // Air, AIO…
            $table->unsignedSmallInteger('fan_size')->nullable(); // mm
            $table->string('rpm_range')->nullable();         // ex “800‑2500”
            $table->decimal('noise_level', 4, 1)->nullable(); // dBA
            $table->text('compatible_sockets')->nullable();
            $table->unsignedSmallInteger('radiator_size')->nullable(); // mm

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        /** ---------- CHASSIS ------------------------------------------- */
        Schema::create('chassis', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('form_factor');                   // Rack 2U, Tower…
            $table->unsignedTinyInteger('drive_bays')->nullable();
            $table->text('fan_support')->nullable();         // json list
            $table->string('material')->nullable();
            $table->string('dimensions')->nullable();        // L×W×H

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        /** ---------- GRAPHIC CARDS ------------------------------------- */
        Schema::create('graphic_cards', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('gpu_chipset');
            $table->unsignedSmallInteger('vram');            // GB
            $table->string('memory_type');                   // GDDR6…
            $table->unsignedSmallInteger('core_clock');      // MHz
            $table->unsignedSmallInteger('boost_clock')->nullable();
            $table->unsignedSmallInteger('power_consumption')->nullable(); // W
            $table->text('ports')->nullable();               // HDMI, DP…

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        /** ---------- FIBER OPTIC CARDS --------------------------------- */
        Schema::create('fiber_optic_cards', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('interface');                     // PCIe…
            $table->unsignedSmallInteger('speed');           // Gbps
            $table->string('connector_type');                // LC, SC…
            $table->unsignedSmallInteger('wavelength')->nullable(); // nm

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        /** ---------- EXPANSION CARDS ----------------------------------- */
        Schema::create('expansion_cards', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('interface_type');                // PCIe x1…
            $table->string('functionality');                 // USB‑C hub…
            $table->string('slot_type')->nullable();         // full/low profile
            $table->string('ports')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        /** ---------- CABLES / CONNECTORS ------------------------------- */
        Schema::create('cables_connectors', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('type');                          // SATA, SAS…
            $table->decimal('length', 5, 2)->nullable();     // m
            $table->string('connector_ends');                // “SFF‑8643 ↔ SATA‑7”

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        /** ---------- BATTERIES ----------------------------------------- */
        Schema::create('batteries', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('type');                          // Li‑ion…
            $table->unsignedSmallInteger('capacity');        // Wh ou mAh
            $table->decimal('voltage', 4, 2);
            $table->unsignedTinyInteger('cells')->nullable();
            $table->text('compatible_devices')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        /** ---------- LICENSES ------------------------------------------ */
        Schema::create('licenses', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('software_name');
            $table->string('version')->nullable();
            $table->string('license_type');                  // OEM, Retail…
            $table->string('validity_period')->nullable();   // 1 year…
            $table->string('activation_method')->nullable(); // Key, OEM…
            $table->string('platform')->nullable();          // Windows…

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        /** ---------- SOFTWARES ----------------------------------------- */
        Schema::create('softwares', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('name');
            $table->string('version')->nullable();
            $table->string('os_support')->nullable();        // Win, Linux…
            $table->string('type');                          // Antivirus…
            $table->boolean('license_included')->default(true);
            $table->string('download_link')->nullable();
            $table->text('activation_instructions')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        /** ---------- ACCESSORIES --------------------------------------- */
        Schema::create('accessories', function (Blueprint $table) {
            $table->uuid('product_id')->primary();

            $table->string('type');                          // Mount kit…
            $table->string('compatibility')->nullable();     // modèle…
            $table->string('material')->nullable();
            $table->string('dimensions')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }

    /** ------------------------------------------------------------------ */
    public function down(): void
    {
        Schema::dropIfExists('accessories');
        Schema::dropIfExists('softwares');
        Schema::dropIfExists('licenses');
        Schema::dropIfExists('batteries');
        Schema::dropIfExists('cables_connectors');
        Schema::dropIfExists('expansion_cards');
        Schema::dropIfExists('fiber_optic_cards');
        Schema::dropIfExists('graphic_cards');
        Schema::dropIfExists('chassis');
        Schema::dropIfExists('cooling_solutions');
        Schema::dropIfExists('raid_controllers');
        Schema::dropIfExists('network_cards');
        Schema::dropIfExists('motherboards');
        Schema::dropIfExists('power_supplies');
        Schema::dropIfExists('hard_drives');
        Schema::dropIfExists('processors');
        Schema::dropIfExists('rams');
    }
};
