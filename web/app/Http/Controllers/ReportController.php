<?php

namespace App\Http\Controllers;

use App\Models\Token;
use App\Services\CacheContainer;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render("Report/Index", [
            'services' => CacheContainer::services(),
        ]);
    }

    public function getReportData()
    {

        $filters = [
            'service_id' => request('service_id', -1),
            'counter_id' => request('counter_id', -1),
            'status' => request('status', -1),
            'language' => request('language', -1),
        ];

        $perPage = request('per_page', 15);

        // $cacheKey = 'tokens_' . md5(json_encode($filters) . '_' . $perPage);

        // $tokens = Cache::remember($cacheKey, now()->addMinutes(60 * 24), function () use ($filters, $perPage) {
        //     return Token::getFilteredTokens($filters, $perPage);
        // });

        return response()->json(Token::getFilteredTokens($filters, $perPage));
    }
}
