<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class RegisterMaster extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'register-master';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Register a master user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Check if the master user already exists
        if (User::where('email', 'admin')->exists()) {
            $this->error('Master user already exists.');
            return;
        }

        // Create the user
        User::create([
            'name' => 'admin',
            'number' => '12345678',
            'email' => 'admin',
            'password' => Hash::make('admin'),
            'type' => 'master',
        ]);

        $this->info('Master user registered successfully.');
    }
}
