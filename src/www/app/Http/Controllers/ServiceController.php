<?php

namespace App\Http\Controllers;

use App\Helpers\Translator;
use App\Http\Requests\Service\ValidationRequest;
use App\Models\Service;
use App\Models\Token;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stichoza\GoogleTranslate\GoogleTranslate;

class ServiceController extends Controller
{

    public function dropDown(Request $request)
    {
        $language = $request->get('language', 'en');

        $services = Service::get()->map(function ($service) use ($language) {

            $serviceId = $service->id;

            // Calculate waiting count for the current service
            $waiting_count = Token::whereDate('created_at', Carbon::today())
                ->where('service_id', $serviceId)
                ->where("status", Token::PENDING)
                ->count();

            // Calculate estimated wait time for the current service
            $estimated_wait_time = (new Token)->getAverageServingTime($serviceId);

            $translatedData = Translator::translateModel($service, $language, ['name']); // only name

            // Keep code untouched
            $translatedData['code'] = $service->code;
            $translatedData['description'] = $service->description;
            $translatedData['icon'] = $service->icon;

            info($translatedData);

            // Merge the translated data with the new metrics
            return array_merge($translatedData, [
                'waiting_count' => $waiting_count,
                'estimated_time' => $estimated_wait_time
            ]);
        });

        // 1. Calculate combined metrics for "All Services"
        $allServicesWaitingCount = Token::whereDate('created_at', Carbon::today())
            ->where("status", Token::PENDING)
            ->count();

        $allServicesEstimatedTime = (new Token)->getAverageServingTime(null);

        // --- START: Translation for "All Services" ---
        // Use the Translator to translate the static string "All Services"
        $allServicesName = Translator::translateText("All Services", $language);
        // --- END: Translation for "All Services" ---

        $allServicesOption = [
            "id" => null,
            // Use the translated text here
            "name" => $allServicesName,
            "waiting_count" => $allServicesWaitingCount,
            "estimated_time" => $allServicesEstimatedTime
        ];

        // 2. Return the combined response
        return response()->json([$allServicesOption, ...$services]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render("Service/Index", [
            'items' =>  Service::latest()->paginate(request("per_page", 10))
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidationRequest $request)
    {
        $data = $request->validated();

        Service::create($data);

        return redirect()->route("setup");
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidationRequest $request, Service $Service)
    {
        $Service->update($request->validated());

        return redirect()->route("setup");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Service $Service)
    {
        $Service->delete();

        return redirect()->route("setup");
    }

    public function serviceStats()
    {
        info(Service::statsByServiceToday());
        return response()->json(
            Service::statsByServiceToday()
        );
    }
}
