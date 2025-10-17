<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaymentMode\ValidationRequest;
use App\Models\PaymentMode;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PaymentModeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render("PaymentMode/Index", [
            'items' =>  PaymentMode::latest()->paginate(request("per_page", 10))
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidationRequest $request)
    {
        $data = $request->validated();

        PaymentMode::create($data);

        return redirect()->route("payment-modes.index");
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidationRequest $request, PaymentMode $PaymentMode)
    {
        $PaymentMode->update($request->validated());

        return redirect()->route("payment-modes.index");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PaymentMode $PaymentMode)
    {
        $PaymentMode->delete();

        return redirect()->route("payment-modes.index");
    }
}
