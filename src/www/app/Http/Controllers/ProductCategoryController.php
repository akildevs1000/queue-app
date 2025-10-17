<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductCategory\ValidationRequest;
use App\Models\ProductCategory;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProductCategoryController extends Controller
{
    public function dropDown()
    {
        return response()->json(ProductCategory::get(["id", "name"]));
    }


    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render("ProductCategory/Index", [
            'items' =>  ProductCategory::latest()->where("user_id", Auth::id())->paginate(request("per_page", 10))
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidationRequest $request)
    {
        $data = $request->validated();

        $data["user_id"] = Auth::id();

        ProductCategory::create($data);

        return redirect()->route("product-categories.index");
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidationRequest $request, ProductCategory $ProductCategory)
    {
        $ProductCategory->update($request->validated());

        return redirect()->route("product-categories.index");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductCategory $ProductCategory)
    {
        $ProductCategory->delete();

        return redirect()->route("product-categories.index");
    }
}
