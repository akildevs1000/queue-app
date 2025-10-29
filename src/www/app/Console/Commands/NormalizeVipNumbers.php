<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class NormalizeVipNumbers extends Command
{
    protected $signature = 'vip:normalize';
    protected $description = 'Normalize VIP numbers to keep only the first value';

    public function handle()
    {
        // Fetch records that might need normalization
        $customers = DB::table('customers')
            ->where('vip_number', 'like', 'VIP-%VIP-%') // only duplicates
            ->get(['id', 'vip_number']);

        foreach ($customers as $customer) {
            preg_match('/VIP-\d+/', $customer->vip_number, $matches);

            if (!empty($matches)) {
                $firstVip = $matches[0];

                // Update only if different
                if ($firstVip !== $customer->vip_number) {
                    DB::table('customers')
                        ->where('id', $customer->id)
                        ->update(['vip_number' => $firstVip]);

                    $this->info("Normalized ID {$customer->id} to {$firstVip}");
                }
            }
        }

        $this->info('VIP number normalization completed.');
    }
}
