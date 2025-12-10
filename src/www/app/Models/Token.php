<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
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

    protected $appends = ["created_at_formatted"];

    public function getCreatedAtFormattedAttribute()
    {
        return $this->created_at
            ? $this->created_at->format('d M Y, h:i A')
            : null;
    }

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
        $cacheKey = 'avg_serving_time_' . $service_id . '_' . now()->toDateString();

        return Cache::remember($cacheKey, 3600, function () use ($service_id) {
            // Use DB to calculate average directly
            $avgSeconds = self::where('service_id', $service_id)
                ->whereDate('created_at', Carbon::today())
                ->where('status', self::SERVED)
                ->whereNotNull('total_serving_time')
                ->avg('total_serving_time'); // DB calculates average

            if (!$avgSeconds) {
                $avgSeconds = 0;
            }

            // Convert seconds to HH:MM:SS
            $hours = floor($avgSeconds / 3600);
            $minutes = floor(($avgSeconds % 3600) / 60);
            $seconds = $avgSeconds % 60;

            return sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
        });
    }

    protected static function booted()
    {
        static::creating(function ($token) {
            if ($token->vip_number) {
                // Extract only the first valid VIP pattern
                preg_match('/VIP-\d+/', $token->vip_number, $matches);

                if (! empty($matches)) {
                    $token->vip_number = $matches[0]; // normalize to first VIP number only
                }
            }
        });
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

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereBetween('created_at', [
                $filters['start_date'] . ' 00:00:00',
                $filters['end_date'] . ' 23:59:59',
            ]);
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

    public static function getAvgTime(array $timeStrings): string
    {
        $totalSeconds = 0;
        $validCount = 0;

        foreach ($timeStrings as $time) {
            // Skip invalid or empty time values
            if (!$time || $time === '00:00:00') {
                continue;
            }

            // Convert time string to seconds
            [$hours, $minutes, $seconds] = explode(':', $time);
            $secondsTotal = ((int)$hours * 3600) + ((int)$minutes * 60) + (int)$seconds;

            if ($secondsTotal > 0) {
                $totalSeconds += $secondsTotal;
                $validCount++;
            }
        }

        if ($validCount === 0) {
            return '00:00:00';
        }

        $avgSeconds = (int) round($totalSeconds / $validCount);

        // Convert average seconds back to HH:MM:SS
        $hours = floor($avgSeconds / 3600);
        $minutes = floor(($avgSeconds % 3600) / 60);
        $seconds = $avgSeconds % 60;

        return sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
    }
}
