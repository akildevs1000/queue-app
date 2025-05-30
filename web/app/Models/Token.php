<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

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
        return $this->belongsTo(Counter::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
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
}
