<?php
namespace App\Http\Controllers;

use App\Http\Requests\Customer\StoreRequest;
use App\Http\Requests\Customer\UpdateRequest;
use App\Models\Customer;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function dropDown()
    {
        return response()->json(Customer::get(["id", "name"]));
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render("Customer/Index", [
            'items' => Customer::latest()->paginate(request("per_page", 10)),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request)
    {
        $data = $request->validated();

        Customer::create($data);

        return redirect()->route("customers.index");
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, Customer $Customer)
    {
        $data = $request->validated();

        $Customer->update($data);

        return redirect()->route("users.index");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $Customer)
    {
        $Customer->delete();

        return redirect()->route("users.index");
    }

    public function nextVipNumber()
    {
        return response()->json(["vip_number" => Customer::getNextVipNumber()]);
    }
}
