<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SetDefaultOperationalHoursSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')
            ->whereNull('operational_start_time')
            ->orWhereNull('operational_end_time')
            ->update([
                'operational_start_time' => '09:00:00',
                'operational_end_time'   => '21:00:00',
            ]);
    }
}
