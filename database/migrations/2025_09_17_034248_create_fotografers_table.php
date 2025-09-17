<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fotografers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('nama');
            $table->string('alamat');
            $table->string('email')->unique();
            $table->string('no_hp', 20);
            $table->string('photo')->nullable(); // ✅ konsisten
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fotographers');
    }
};
