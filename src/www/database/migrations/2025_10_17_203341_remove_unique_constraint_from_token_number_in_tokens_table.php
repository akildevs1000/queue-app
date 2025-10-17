<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tokens', function (Blueprint $table) {
            $table->dropUnique(['token_number']); // remove unique constraint
        });
    }

    public function down(): void
    {
        Schema::table('tokens', function (Blueprint $table) {
            $table->unique('token_number'); // re-add if rollback
        });
    }
};
