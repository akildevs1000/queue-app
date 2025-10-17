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
        Schema::table('tokens', function (Blueprint $table) {
            $table->timestamp('start_serving')->nullable();
            $table->timestamp('end_serving')->nullable();
            $table->integer('total_serving_time')->nullable(); // total seconds stored here
            $table->string('total_serving_time_display')->nullable(); // new column to store formatted HH:MM:SS
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tokens', function (Blueprint $table) {
            //
        });
    }
};
