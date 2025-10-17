<?php

namespace App\Http\Controllers;

use App\Http\Requests\Employee\ValidationRequest;
use App\Models\Employee;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render("Employee/Index", [
            'items' =>  Employee::latest()->paginate(request("per_page", 10)),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ValidationRequest $request)
    {
        $data = $request->validated();

        if (request()->hasFile('profile_picture')) {
            $path = request()->file('profile_picture')->store('profile_pictures', 'public');
            $data["profile_picture"] = Storage::url($path);
        }

        Employee::create($data);

        return redirect()->route("employees.index");
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ValidationRequest $request, Employee $Employee)
    {

        $data = $request->validated();

        if (request()->hasFile('profile_picture')) {
            $path = request()->file('profile_picture')->store('profile_pictures', 'public');
            $data["profile_picture"] = Storage::url($path);
        }

        $Employee->update($data);

        return redirect()->route("employees.index");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $Employee)
    {
        $Employee->delete();

         // Check if the post has an attachment and delete it
         if ($Employee->image) {
            $oldPath = str_replace(Storage::url(''), '', $Employee->image); // Extract relative path
            Storage::disk('public')->delete($oldPath);
        }

        return redirect()->route("employees.index");
    }
}
