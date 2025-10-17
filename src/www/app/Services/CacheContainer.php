<?php

namespace App\Services;

use App\Models\Service;
use App\Models\Counter;
use App\Models\Token;
use Illuminate\Support\Facades\Cache;

class CacheContainer
{
    public static function services($additionalCols = [])
    {
        return Cache::remember('services_list', now()->addMinutes(60 * 24), function () use ($additionalCols) {
            $services = Service::get(array_merge(["id", "name"], $additionalCols))->toArray();
            return array_merge([["id" => -1, "name" => "All Services"]], $services);
        });
    }

    public static function counters($additionalCols = [])
    {
        return Cache::remember('counters_list', now()->addMinutes(60 * 24), function () use ($additionalCols) {
            $counters = Counter::get(array_merge(["id", "name"], $additionalCols))->toArray();
            return array_merge([["id" => -1, "name" => "All Counters"]], $counters);
        });
    }

    public static function tokens($filters = [], $perPage = 15)
    {
        $cacheKey = 'tokens_' . md5(json_encode($filters) . '_' . $perPage);

        return Cache::remember($cacheKey, now()->addMinutes(60 * 24), function () use ($filters, $perPage) {
            return Token::getFilteredTokens($filters, $perPage);
        });
    }
}
