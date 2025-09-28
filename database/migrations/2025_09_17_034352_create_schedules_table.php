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
            $table->string('namaEvent');
            $table->foreignId('fotografer_id')->nullable()->constrained('fotografers')->onDelete('cascade');
            $table->foreignId('editor_id')->nullable()->constrained('editors')->onDelete('cascade');
            $table->foreignId('lapangan_id')->constrained('lapangans')->onDelete('cascade'); // ✅ Ubah ke foreign key
            $table->decimal('jamFotografer', 4, 1)->default(0);
            $table->decimal('jamEditor', 4, 1)->nullable();
            $table->text('catatan')->nullable();
            $table->text('linkGdrive')->nullable();
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
