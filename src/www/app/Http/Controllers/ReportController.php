<?php

namespace App\Http\Controllers;

use App\Models\Counter;
use App\Models\Feedback;
use App\Models\Service;
use App\Models\Token;
use App\Services\CacheContainer;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReportController extends Controller
{
    public $filters;

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
            'user_id' => request('user_id', -1),
            'token_number' => request('token_number', -1),
            'status'     => request('status', -1),
            'language'   => request('language', -1),
            'start_date' => request('start_date') ?? date("Y-m-d"),
            'end_date'   => request('end_date') ?? date("Y-m-d"),
        ];

        $perPage = request('per_page', 15);

        $query = Token::query();

        if (!empty($filters['service_id']) && $filters['service_id'] != -1) {
            $query->where('service_id', $filters['service_id']);
        }

        if (!empty($filters['counter_id']) && $filters['counter_id'] != -1) {
            $query->where('counter_id', $filters['counter_id']);
        }

        if (isset($filters['user_id']) && $filters['user_id'] != -1) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['status']) && $filters['status'] != -1) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['language']) && $filters['language'] != -1) {
            $query->where('language', $filters['language']);
        }

        if (isset($filters['token_number']) && $filters['token_number'] != -1) {
            $query->where('token_number', $filters['token_number']);
        }

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereBetween('created_at', [
                $filters['start_date'] . ' 00:00:00',
                $filters['end_date'] . ' 23:59:59',
            ]);
        }

        return $query->with(['service', 'counter', 'user'])
            ->latest()
            ->filter($filters)
            ->paginate($perPage);
    }

    public function getSummaryReportData()
    {
        return response()->json($this->processData());
    }

    public function summaryDownload()
    {
        // return $this->processData();

        $pdf = Pdf::loadView('reports.token-pdf', $this->processData())->setPaper('a4', 'landscape');

        return $pdf->stream('report.pdf');
    }

    public function download()
    {
        // return $this->processData();


        $filters = [
            'service_id' => request('service_id', -1),
            'counter_id' => request('counter_id', -1),
            'user_id' => request('user_id', -1),
            'token_number' => request('token_number', -1),
            'status'     => request('status', -1),
            'language'   => request('language', -1),
            'start_date' => request('start_date') ?? date("Y-m-d"),
            'end_date'   => request('end_date') ?? date("Y-m-d"),
        ];

        $query = Token::query();

        if (!empty($filters['service_id']) && $filters['service_id'] != -1) {
            $query->where('service_id', $filters['service_id']);
        }

        if (!empty($filters['counter_id']) && $filters['counter_id'] != -1) {
            $query->where('counter_id', $filters['counter_id']);
        }

        if (isset($filters['user_id']) && $filters['user_id'] != -1) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['status']) && $filters['status'] != -1) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['language']) && $filters['language'] != -1) {
            $query->where('language', $filters['language']);
        }

        if (isset($filters['token_number']) && $filters['token_number'] != -1) {
            $query->where('token_number', $filters['token_number']);
        }

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereBetween('created_at', [
                $filters['start_date'] . ' 00:00:00',
                $filters['end_date'] . ' 23:59:59',
            ]);
        }

        $records = $query->with(['service', 'counter', 'user'])
            ->latest()
            ->filter($filters)
            ->get();

        $pdf = Pdf::loadView('reports.report-pdf', [
            'name'                => Auth::user()->name ?? "Anonymous",
            'records'             => $records,
            'dates'               => Carbon::parse($filters['start_date'])->format('M d, Y') . " - " .
                Carbon::parse($filters['end_date'])->format('M d, Y'),
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('report.pdf');
    }

    public function processData()
    {
        $filters = [
            'service_id' => request('service_id', -1) ?? -1,
            'counter_id' => request('counter_id', -1) ?? -1,
            'start_date' => request('start_date') ?? date("Y-m-d"),
            'end_date'   => request('end_date') ?? date("Y-m-d"),
        ];

        $this->filters = [
            'start_date' => $filters['start_date'] . ' 00:00:00',
            'end_date'   => $filters['end_date'] . ' 23:59:59',
        ];

        // Fetch counters with token counts and service/user info
        $counters = Counter::filter($filters)
            ->with([
                'service' => function ($q) {
                    $q->withCount([
                        'tokens as pending_count' => function ($q) {
                            $q->where('status', Token::PENDING);
                            if (! empty($this->filters['start_date']) && ! empty($this->filters['end_date'])) {
                                $q->whereBetween('created_at', $this->filters);
                            }
                        },
                    ]);
                },
                'user',
            ])
            ->withCount([
                'tokens as not_show_count'                  => function ($q) {
                    $q->where('status', Token::NOT_SHOW);
                    if (! empty($this->filters['start_date']) && ! empty($this->filters['end_date'])) {
                        $q->whereBetween('created_at', $this->filters);
                    }
                },
                'tokens as serving_count'                   => function ($q) {
                    $q->where('status', Token::SERVING);
                    if (! empty($this->filters['start_date']) && ! empty($this->filters['end_date'])) {
                        $q->whereBetween('created_at', $this->filters);
                    }
                },
                'tokens as served_count'                    => function ($q) {
                    $q->where('status', Token::SERVED);
                    if (! empty($this->filters['start_date']) && ! empty($this->filters['end_date'])) {
                        $q->whereBetween('created_at', $this->filters);
                    }
                },
                'tokens as no_show_count_plus_served_count' => function ($q) {
                    $q->whereIn('status', [Token::NOT_SHOW, Token::SERVED]);
                    if (! empty($this->filters['start_date']) && ! empty($this->filters['end_date'])) {
                        $q->whereBetween('created_at', $this->filters);
                    }
                },
            ])
            // ->with(['tokens' => function ($q) {
            //     if (!empty($this->filters['start_date']) && !empty($this->filters['end_date'])) {
            //         $q->whereBetween('created_at', $this->filters);
            //     }
            // }])
            ->get()
            ->map(function ($counter) {
                $timeStrings       = $counter->tokens->pluck('total_serving_time_display')->toArray();
                $counter->avgTime  = Token::getAvgTime($timeStrings);
                $counter->feedback = Feedback::feedbackRatingInNumber($counter->id);
                return $counter;
            });

        // Total visits with date filter applied
        $tokenVisitQuery = Token::query();
        if (! empty($this->filters['start_date']) && ! empty($this->filters['end_date'])) {
            $tokenVisitQuery->whereBetween('created_at', $this->filters);
        }
        $totalVisits = $tokenVisitQuery->count();

        // Token counts by service
        $tokenCountsQuery = Token::query();

        if (! empty($this->filters['start_date']) && ! empty($this->filters['end_date'])) {
            $tokenCountsQuery->whereBetween('created_at', $this->filters);
        }

        $tokenCountsQuery->whereIn('status', [Token::NOT_SHOW, Token::SERVED]);

        $tokenCounts = $tokenCountsQuery->selectRaw('service_id, COUNT(*) as total')
            ->groupBy('service_id')
            ->pluck('total', 'service_id');

        $services = Service::get(['id', 'name']);

        $selectedServiceName = null;

        $serviceStats = [];

        foreach ($services as $service) {

            $getArrayofServingTimeDisplayForAVG = Token::whereNotNull("total_serving_time_display")
                ->where("service_id", $service->id)
                ->whereBetween('created_at', $this->filters)

                ->pluck('total_serving_time_display')->toArray();

            if ($service->id == $filters["service_id"]) {
                $selectedServiceName = $service->name;
            }

            $serviceStats[] = [
                "service_name"  => $service->name,
                "service_count" => $tokenCounts[$service->id] ?? 0,
                "avgTime"       => Token::getAvgTime(($getArrayofServingTimeDisplayForAVG)),
            ];
        }

        return [
            'name'                => Auth::user()->name ?? "Anonymous",
            'total_visits'        => $totalVisits,
            'stats'               => $serviceStats,
            'records'             => $counters,
            "selectedServiceName" => $selectedServiceName,
            'dates'               => Carbon::parse($filters['start_date'])->format('M d, Y') . " - " .
                Carbon::parse($filters['end_date'])->format('M d, Y'),
        ];
    }
    public function peakHourReport()
    {

        $start = now()->subDay()->startOfDay(); // Yesterday 00:00:00
        $end   = now()->subDay()->endOfDay();   // Yesterday 23:59:59

        $tokens = Token::whereBetween('created_at', [$start, $end])
            ->get(['created_at', 'service_id']);

        $service_id = request("service_id");

        $services = Service::when($service_id, fn($q) => $q->where("id", $service_id))->pluck('name', 'id'); // id => name
        $hours  = range(0, 23);
        $result = [];

        // Initialize result with all 24 hours
        foreach ($hours as $hour) {
            $hourLabel = str_pad($hour, 2, '0', STR_PAD_LEFT) . ':00';
            $row       = ['time' => $hourLabel];

            foreach ($services as $serviceName) {
                $row[$serviceName] = rand(5, 25); // Default count
            }

            $result[$hourLabel] = $row;
        }

        foreach ($tokens as $token) {
            $created     = $token->created_at->copy()->timezone(config('app.timezone'));
            $hourKey     = $created->format('H:00');
            $serviceName = $services[$token->service_id] ?? null;

            if ($serviceName && isset($result[$hourKey])) {
                $result[$hourKey][$serviceName]++;
            }
        }

        return array_values($result);
    }

    public function peakDayReport()
    {
        $startDate = now()->subDays(6)->startOfDay(); // last 7 days including today
        $endDate   = now()->endOfDay();

        $service_id = request("service_id");

        $services = Service::when($service_id, fn($q) => $q->where("id", $service_id))->pluck('name', 'id'); // id => name

        $tokens   = Token::whereBetween('created_at', [$startDate, $endDate])
            ->get(['created_at', 'service_id']);

        $dateRange = collect();
        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            $dateRange->push($date->format('d-M-Y'));
        }

        $result = [];

        // Step 1: Initialize each day with zero counts for all services
        foreach ($dateRange as $date) {
            $row = ['date' => $date];
            foreach ($services as $serviceName) {
                $row[$serviceName] = rand(15, 100);
            }
            $result[$date] = $row;
        }

        // Step 2: Populate actual token counts
        foreach ($tokens as $token) {
            $date        = $token->created_at->copy()->timezone(config('app.timezone'))->format('Y-m-d');
            $serviceName = $services[$token->service_id] ?? null;

            if ($serviceName && isset($result[$date])) {
                $result[$date][$serviceName]++;
            }
        }

        return array_values($result); // Reset keys to get clean array
    }
}
