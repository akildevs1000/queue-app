<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 🛑 Drop the existing string column
            $table->dropColumn('media_url');
        });

        Schema::table('users', function (Blueprint $table) {
            // ✅ Recreate as JSON and nullable
            $table->json('media_url')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 🔁 Revert: drop json column
            $table->dropColumn('media_url');
        });

        Schema::table('users', function (Blueprint $table) {
            // 🔁 Recreate as string (original)
            $table->string('media_url')->nullable();
        });
    }
};
