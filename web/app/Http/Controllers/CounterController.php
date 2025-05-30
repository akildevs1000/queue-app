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

    public function counterListByServiceId($id)
    {
        return response()->json(Counter::where("service_id", $id)->get(["id", "name"]));
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

        return redirect()->route("counters.index");
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidationRequest $request, Counter $Counter)
    {
        $Counter->update($request->validated());

        return redirect()->route("counters.index");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Counter $Counter)
    {
        $Counter->delete();

        return redirect()->route("counters.index");
    }
}
