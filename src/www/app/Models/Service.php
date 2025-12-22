<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Service extends Model
{
    protected $guarded = [];

    /**
     * Get all of the counters for the Service
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function counters()
    {
        return $this->hasMany(Counter::class);
    }

    /**
     * Get all of the counters for the Service
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function tokens()
    {
        return $this->hasMany(Token::class);
    }

    public static function statsByServiceToday()
    {
        $today = Carbon::today();

        return self::withCount([
            'tokens as served_count' => function ($query) use ($today) {
                $query->whereDate('created_at', $today)
                    ->where('status', Token::SERVED);
            },
            'tokens as pending_count' => function ($query) use ($today) {
                $query->whereDate('created_at', $today)
                    ->where('status', Token::PENDING);
            }
        ])->get()->map(function ($service) {
            return [
                'name'  => $service->name,
                'code'  => $service->code,
                'stats' => "{$service->served_count} / {$service->pending_count}",
            ];
        });
    }
}
