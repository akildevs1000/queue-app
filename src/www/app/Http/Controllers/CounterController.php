<?php

namespace App\Http\Controllers;

use App\Http\Requests\Counter\ValidationRequest;
use App\Models\Counter;
use Inertia\Inertia;

class CounterController extends Controller
{
    public function dropDown()
    {
        return response()->json(Counter::get(["id", "name"]));
    }

    public function counterListByServiceId($serviceId)
    {

        $counters = Counter::where("service_id", $serviceId)
            ->select('id', 'name')
            ->get()->toArray();

        if (!count($counters)) return [];

        $defaultArr = [
            "id" => -1,
            "name" => "All Counters"
        ];

        return response()->json(array_merge([$defaultArr, ...$counters]));
    }

    public function index()
    {
        return Inertia::render("Counter/Index", [
            'items' =>  Counter::latest()->with('service')->paginate(request("per_page", 10))
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidationRequest $request)
    {
        $data = $request->validated();

        Counter::create($data);

        return redirect()->route("setup");
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidationRequest $request, Counter $Counter)
    {
        $Counter->update($request->validated());

        return redirect()->route("setup");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Counter $Counter)
    {
        $Counter->delete();

        return redirect()->route("setup");
    }
}
