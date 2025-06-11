<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use WebSocket\Client;

class Token extends Model
{
    // Status constants
    public const PENDING = 0;
    public const NOT_SHOW = 1;
    public const SERVING = 2;
    public const SERVED = 3;

    protected $guarded = [];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function counter()
    {
        return $this->belongsTo(Counter::class)->withDefault([
            "name" => "---"
        ]);
    }

    public function user()
    {
        return $this->belongsTo(User::class)->withDefault([
            "name" => "---"
        ]);
    }


    public function getAverageServingTime($service_id)
    {
        $totalTimes = self::where('service_id', $service_id)
            ->whereDate('created_at', Carbon::today())
            ->where('status', Token::SERVED)
            ->whereNotNull('total_serving_time')
            ->pluck('total_serving_time')
            ->toArray();

        if (empty($totalTimes)) {
            return '00:00:00';
        }

        $avg = round(array_sum($totalTimes) / count($totalTimes)); // average in seconds

        // Convert average seconds to HH:MM:SS
        $hours = floor($avg / 3600);
        $minutes = floor(($avg % 3600) / 60);
        $seconds = $avg % 60;

        $averageDisplay = sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);

        return $averageDisplay;

        return response()->json([
            'average_display' => $averageDisplay,
            'average_seconds' => $avg,
            'raw_values' => $totalTimes,
        ]);
    }

    // protected static function booted()
    // {
    //     static::saved(function ($token) {
    //         if ($token->status === self::SERVING) {
    //             $token->sendTrigger(); // ✅ Corrected
    //         }
    //     });
    // }

    public function sendTrigger()
    {
        $this->loadMissing('counter:id,name');

        try {
            $client = new Client("wss://192.168.2.6:8080", [
                'context' => stream_context_create([
                    'ssl' => [
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                        'allow_self_signed' => true,
                    ]
                ])
            ]);

            $client->send(json_encode([
                'event' => 'token-serving',
                'data' => [
                    "token" => $this->token_number_display . "-----",
                    "counter" => $this->counter->name ?? ""
                ]
            ]));

            $client->close();
        } catch (\Exception $e) {
            Log::error('WebSocket error: ' . $e->getMessage());
        }
    }

    public function writeLatestEvent()
    {
        $this->loadMissing('counter:id,name');

        $data = [
            "token" => $this->token_number_display,
            "counter" => $this->counter->name ?? ""
        ];

        $path = public_path('latest-event.json');

        File::put($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }

    public function scopeFilter($query, array $filters)
    {
        if (!empty($filters['service_id']) && $filters['service_id'] != -1) {
            $query->where('service_id', $filters['service_id']);
        }

        if (!empty($filters['counter_id']) && $filters['counter_id'] != -1) {
            $query->where('counter_id', $filters['counter_id']);
        }

        if (isset($filters['status']) && $filters['status'] != -1) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['language']) && $filters['language'] != -1) {
            $query->where('language', $filters['language']);
        }

        return $query;
    }

    public static function getFilteredTokens(array $filters = [], int $perPage = 15)
    {
        return self::with(['service', 'counter', 'user'])
            ->latest()
            ->filter($filters)
            ->paginate($perPage);
    }
}
