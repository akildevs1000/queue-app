<?php

namespace App\Http\Controllers;

use App\Helpers\Translator;
use App\Http\Requests\Service\ValidationRequest;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stichoza\GoogleTranslate\GoogleTranslate;

class ServiceController extends Controller
{

    public function dropDown(Request $request)
    {
        $language = $request->get('language', 'en');

        $services = Service::all()->map(function ($service) use ($language) {
            return Translator::translateModel($service, $language, ['name', 'code']);
        });

        return response()->json([["id" => null, "name" => "All Services"], ...$services]);
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
}
