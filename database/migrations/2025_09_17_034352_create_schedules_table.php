<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->time('jamMulai');
            $table->time('jamSelesai');
            $table->string('namaTim');
            $table->foreignId('fotografer_id')->constrained('fotografer')->onDelete('cascade');
            $table->foreignId('editor_id')->constrained('editor')->onDelete('cascade');
            $table->string('lapangan');
            $table->enum('status', ['completed', 'in_progress', 'pending'])->default('pending');
            $table->decimal('jamFotografer', 4, 1);
            $table->decimal('jamEditor', 4, 1);
            $table->text('catatan')->nullable();
            $table->text('linkGdriveFotografer')->nullable();
            $table->text('linkGdriveEditor')->nullable();
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
