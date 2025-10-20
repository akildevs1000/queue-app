<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class NormalizeVipNumbers extends Command
{
    protected $signature = 'vip:normalize';
    protected $description = 'Normalize VIP numbers in tokens table to keep only the first occurrence';

    public function handle()
    {
        // Get tokens that may contain repeated VIP numbers
        $tokens = DB::table('tokens')
            ->whereNotNull('vip_number')
            ->where('vip_number', 'like', 'VIP-%VIP-%') // e.g. VIP-00001VIP-00001
            ->get(['id', 'vip_number']);

        if ($tokens->isEmpty()) {
            $this->info('✅ No duplicate VIP numbers found.');
            return;
        }

        foreach ($tokens as $token) {
            preg_match('/VIP-\d+/', $token->vip_number, $matches);

            if (!empty($matches)) {
                $normalizedVip = $matches[0];

                // Only update if normalization changes the value
                if ($normalizedVip !== $token->vip_number) {
                    DB::table('tokens')
                        ->where('id', $token->id)
                        ->update(['vip_number' => $normalizedVip]);

                    $this->info("✅ Normalized Token ID {$token->id} → {$normalizedVip}");
                }
            }
        }

        $this->info('🎯 VIP number normalization completed successfully.');
    }
}
