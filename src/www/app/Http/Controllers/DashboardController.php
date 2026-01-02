<?php

namespace App\Http\Controllers;

use App\Models\Token;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $counts = Token::select('status', DB::raw('count(*) as total'))
            ->whereDate('created_at', Carbon::today())
            ->groupBy('status')
            ->pluck('total', 'status');

        // ✅ Best counter name (most SERVED tokens today)
        $bestCounterName = Token::join('counters', 'tokens.counter_id', '=', 'counters.id')
            ->whereDate('tokens.created_at', Carbon::today())
            ->where('tokens.status', Token::SERVED)
            ->select('counters.name')
            ->groupBy('counters.name')
            ->orderByRaw('COUNT(tokens.id) DESC')
            ->value('counters.name'); // 👈 returns only name

        $items = [
            'total_visits' => Token::whereDate('created_at', Carbon::today())->count() ?? 0,
            'pending'      => $counts[TOKEN::PENDING] ?? 0,
            'served'       => $counts[TOKEN::SERVED] ?? 0,
            'serving'      => $counts[TOKEN::SERVING] ?? 0,
            'notAnswered'  => $counts[TOKEN::NOT_SHOW] ?? 0,
            'avgTimeInMinutes'  => $this->getAvgTime(),
            'best_counter' => $bestCounterName ?? 'N/A',
        ];

        return Inertia::render('dashboard', [
            "items" => $items
        ]);
    }

    function getAvgTime()
    {
        // 1. Retrieve the data
        $allTimeCounts = Token::whereNotNull("total_serving_time_display")
            ->pluck('total_serving_time_display');

        $totalSeconds = 0;
        $validTimeCount = 0;

        foreach ($allTimeCounts as $timeString) {
            // Skip "00:00:00" values for average calculation if they represent no service
            if ($timeString === "00:00:00") {
                continue;
            }

            // 2. Convert to seconds
            list($hours, $minutes, $seconds) = explode(':', $timeString);
            $currentSeconds = ($hours * 3600) + ($minutes * 60) + $seconds;

            $totalSeconds += $currentSeconds;
            $validTimeCount++;
        }

        if ($validTimeCount > 0) {
            $averageSeconds = $totalSeconds / $validTimeCount;
            return floor(($averageSeconds % 3600) / 60);
        } else {
            return "0";
        }
    }

    public function getAvgTimeByDateRange(array $dateRange): int
    {
        $allTimeCounts = Token::whereNotNull("total_serving_time_display")
            ->whereBetween('created_at', $dateRange)
            ->pluck('total_serving_time_display');

        $totalSeconds = 0;
        $validTimeCount = 0;

        foreach ($allTimeCounts as $timeString) {
            if ($timeString === "00:00:00") {
                continue; // skip invalid times
            }

            [$hours, $minutes, $seconds] = explode(':', $timeString);
            $totalSeconds += ($hours * 3600) + ($minutes * 60) + $seconds;
            $validTimeCount++;
        }

        if ($validTimeCount > 0) {
            $averageSeconds = $totalSeconds / $validTimeCount;
            return floor(($averageSeconds % 3600) / 60); // return average in minutes
        }

        return 0;
    }
}
