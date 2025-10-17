<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\ValidationRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $userId = Auth::id();
        $perPage = (int) request()->input('per_page', 10);

        $products = Product::with(['product_category:id,name']) // load only needed columns
            // ->where('user_id', $userId)
            ->latest()
            ->paginate($perPage);

        $categories = ProductCategory::where('user_id', $userId)
            ->select('id', 'name')
            ->get();

        return [
            'items' => $products,
            'categories' => $categories,
        ];
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidationRequest $request)
    {
        $data = $request->validated();

        if (request()->hasFile('image')) {
            $path = request()->file('image')->store('images', 'public');
            $data["image"] = Storage::url($path);
        }

        $data["user_id"] = Auth::id();

        return Product::create($data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidationRequest $request, Product $Product)
    {
        $Product->update($request->validated());

        return $Product;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $Product)
    {
        $Product->delete();

        // Check if the post has an attachment and delete it
        if ($Product->image) {
            $oldPath = str_replace(Storage::url(''), '', $Product->image);
            Storage::disk('public')->delete($oldPath);
        }

        return response()->noContent();
    }
}
