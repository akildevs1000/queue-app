<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Token;
use App\Models\Service;
use App\Models\User;
use App\Models\Counter;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class TokenSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // $this->pendingTokenSeeder(20);
            // $this->markSomeAsServing(5); // 30: 20 for endServing, 10 for noShow
            $this->markSomeAsServed(10);  // simulate endServing
            // $this->markSomeAsNoShow(10);  // simulate noShow
        });
    }

    protected function pendingTokenSeeder(int $count): void
    {
        $services = Service::get();

        if ($services->isEmpty()) {
            $this->command->warn('No services found. Please run the ServiceSeeder first.');
            return;
        }

        $lastTokenNumber = Token::max('token_number') ?? 0;

        foreach ($services as $service) {
            $lastTokenNumber = $lastTokenNumber + $service->starting_number ?? 0;
            foreach (range(1, $count) as $i) {
                $lastTokenNumber++; // Increment for each token

                Token::create([
                    'language' => fake()->randomElement(['en', 'ar']),
                    'service_id' => $service->id,
                    'token_number' => $lastTokenNumber,
                    'status' => Token::PENDING,
                    'token_number_display' => $service->code . str_pad($lastTokenNumber, 4, '0', STR_PAD_LEFT),
                ]);

                $this->command->info("Seeding service {$service->name} with token number $lastTokenNumber.");
            }
        }
    }

    protected function markSomeAsServing(int $count): void
    {
        // Eager load counter relationship to access service_id
        $usersWithCounters = User::with('counter')
            ->whereNotNull('counter_id')
            ->whereIn('counter_id', Counter::pluck('id'))
            ->get()
            ->filter(fn($user) => $user->counter && $user->counter->service_id);

        if ($usersWithCounters->isEmpty()) {
            $this->command->warn("No users found with valid counter_id. Skipping serving token assignment.");
            return;
        }

        $tokens = Token::where('status', Token::PENDING)->inRandomOrder()->take($count)->get();

        foreach ($tokens as $token) {
            // Find a user whose counter's service matches the token's service
            $eligibleUsers = $usersWithCounters->filter(function ($user) use ($token) {
                return $user->counter->service_id === $token->service_id;
            });

            if ($eligibleUsers->isEmpty()) {
                $this->command->warn("No matching user found for token ID {$token->id} (service_id: {$token->service_id}). Skipping.");
                continue;
            }

            $user = $eligibleUsers->random();

            $token->update([
                'start_serving' => now()->subMinutes(rand(5, 15)),
                'status' => Token::SERVING,
                'user_id' => $user->id,
                'counter_id' => 18,
            ]);
        }

        $this->command->info("Marked {$tokens->count()} tokens as SERVING.");
    }


    protected function markSomeAsServed(int $count): void
    {
        $tokens = Token::where('status', Token::SERVING)
            ->whereNotNull('start_serving')
            ->inRandomOrder()
            ->take($count)
            ->get();

        foreach ($tokens as $token) {
            $start = Carbon::parse($token->start_serving);

            // Simulate total serving time in seconds (between 1 and 5 mins)
            $totalServingSeconds = rand(60, 300);

            // Simulate pause time in seconds (e.g., wait time or delay)
            $pauseSeconds = rand(10, 60);

            // Calculate actual end_serving by adding both
            $end = $start->copy()->addSeconds($totalServingSeconds + $pauseSeconds);

            // Format display strings
            $totalServingTimeDisplay = gmdate('H:i:s', $totalServingSeconds);
            $pauseTimeDisplay = gmdate('H:i:s', $pauseSeconds);

            $token->update([
                'end_serving' => $end,
                'total_serving_time' => $totalServingSeconds,
                'total_serving_time_display' => $totalServingTimeDisplay,
                'pause_time_display' => $pauseTimeDisplay,
                'status' => Token::SERVED,
            ]);
        }

        $this->command->info("Marked $count tokens as SERVED with full serving metadata.");
    }


    protected function markSomeAsNoShow(int $count): void
    {
        // Pick tokens currently marked as SERVING (so they have counters and users assigned)
        $tokens = Token::where('status', Token::SERVING)
            ->inRandomOrder()
            ->take($count)
            ->get();

        foreach ($tokens as $token) {
            // Update only status, keep counter_id, user_id, and start_serving intact
            $token->update([
                'status' => Token::NOT_SHOW,
                // Optionally, set end_serving if you want
                'end_serving' => now(),
                'total_serving_time' => 0,
                'total_serving_time_display' => '00:00:00',
                'pause_time_display' => '00:00:00',
            ]);
        }

        $this->command->info("Marked $count tokens as NO SHOW.");
    }
}
