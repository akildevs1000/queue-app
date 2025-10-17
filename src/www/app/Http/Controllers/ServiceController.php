<?php

namespace App\Http\Controllers;

use App\Http\Requests\Service\ValidationRequest;
use App\Models\Service;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function dropDown()
    {
        return response()->json(Service::get(["id", "name", "code"]));
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

        return redirect()->route("services.index");
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidationRequest $request, Service $Service)
    {
        $Service->update($request->validated());

        return redirect()->route("services.index");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Service $Service)
    {
        $Service->delete();

        return redirect()->route("services.index");
    }
}
