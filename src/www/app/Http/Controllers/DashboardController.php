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



        $items = [
            'total_visits' => Token::whereDate('created_at', Carbon::today())->count() ?? 0,
            'pending'      => $counts[TOKEN::PENDING] ?? 0,
            'served'       => $counts[TOKEN::SERVED] ?? 0,
            'serving'      => $counts[TOKEN::SERVING] ?? 0,
            'notAnswered'  => $counts[TOKEN::NOT_SHOW] ?? 0,
            'avgTimeInMinutes'  => $this->getAvgTime(),
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
            return $avgMinutes = floor(($averageSeconds % 3600) / 60);
        } else {
            return "0";
        }
    }
}
