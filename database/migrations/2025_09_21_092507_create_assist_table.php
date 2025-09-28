<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assists', function (Blueprint $table) {
            $table->id();

            // Polymorphic relationship untuk bisa pilih fotografer atau editor sebagai assist
            $table->unsignedBigInteger('assistable_id');
            $table->string('assistable_type'); // 'App\Models\Fotografer' atau 'App\Models\Editor'

            $table->date('tanggal');
            $table->time('jamMulai');
            $table->time('jamSelesai');
            $table->timestamps();

            // Index untuk performa
            $table->index(['assistable_id', 'assistable_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assists');
    }
};
