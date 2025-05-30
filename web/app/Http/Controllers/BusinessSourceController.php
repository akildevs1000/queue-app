<?php

namespace App\Http\Controllers;

use App\Http\Requests\BusinessSource\ValidationRequest;
use App\Models\BusinessSource;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BusinessSourceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render("BusinessSource/Index", [
            'items' =>  BusinessSource::latest()->paginate(request("per_page", 10))
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidationRequest $request)
    {
        $data = $request->validated();

        BusinessSource::create($data);

        return redirect()->route("business-sources.index");
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidationRequest $request, BusinessSource $BusinessSource)
    {
        $BusinessSource->update($request->validated());

        return redirect()->route("business-sources.index");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BusinessSource $BusinessSource)
    {
        $BusinessSource->delete();

        return redirect()->route("business-sources.index");
    }
}
