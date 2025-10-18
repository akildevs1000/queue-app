<?php
namespace App\Jobs;

use App\Models\Token;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CreateTokenJob implements ShouldQueue
{
    use Queueable;

    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function handle(): void
    {
        $validatedData = $this->data;

        $lastTokenNumber       = Token::latest('token_number')->whereDate('created_at', Carbon::today())->value('token_number') ?? 0;
        $predictedTokenNumber  = (int) $lastTokenNumber + 1;
        $predictedTokenDisplay = $validatedData['code'] . str_pad($predictedTokenNumber, 4, '0', STR_PAD_LEFT);

        $tokenData = [
            'language'             => $validatedData['language'],
            'service_id'           => $validatedData['service_id'],
            'token_number'         => $predictedTokenNumber,
            'token_number_display' => $predictedTokenDisplay,
        ];

// Only add VIP-related fields if vip_number is provided
        if (! empty($validatedData['vip_number'])) {
            $tokenData['vip_number']  = $validatedData['vip_number'];
            $tokenData['vip_serving'] = 1;
        }

        Token::create($tokenData);

        $response = [
            'name'                  => User::where("type", "master")->value("name"),
            'token_number_display'  => $tokenData['token_number_display'],
            'service'               => $validatedData['service_name'],
            'already_waiting_count' => Token::whereDate('created_at', Carbon::today())->where('service_id', $tokenData['service_id'])->where("status", Token::PENDING)->count(), // position in queue
            'estimated_wait_time'   => (new Token)->getAverageServingTime($tokenData['service_id']),                                                                             // assuming 10 mins per token
            'date'                  => now()->format('d-M-Y'),
            'time'                  => now()->format('h:i A'),
        ];

        info($response);
    }
}
