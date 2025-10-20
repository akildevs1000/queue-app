<?php
namespace App\Http\Controllers;

use App\Http\Requests\User\PasswordRequest;
use App\Http\Requests\User\StoreRequest;
use App\Http\Requests\User\UpdateRequest;
use App\Models\Counter;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function dropDown()
    {
        return response()->json(User::get(["id", "name"]));
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render("User/Index", [
            'items' => User::with("service", "counter")->latest()->where("type", "user")->paginate(request("per_page", 10)),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request)
    {
        $data = $request->validated();

        $data['password'] = Hash::make($data['password']);

        User::create($data);

        return redirect()->route("users.index");
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, User $User)
    {
        $data = $request->validated();

        $User->update($data);

        return redirect()->route("users.index");
    }

    public function updatePassword(PasswordRequest $request, $id)
    {
        $data = $request->validated();

        $data['password'] = Hash::make($data['password']);

        User::whereId($id)->update($data);

        return redirect()->route("users.index");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $User)
    {
        $User->delete();

        return redirect()->route("users.index");
    }

    public function serviceByUser()
    {
        return Service::where('id', Auth::user()->service_id)->first();
    }

    public function counterByUser()
    {
        return Counter::where('id', Auth::user()->counter_id)->first();
    }

    public function socketIpAndPort()
    {
        $found = User::whereNotNull(["ip", "port"])->where("type", "master")->first();

        $found->ip = gethostbyname(gethostname());

        return $found;
    }

    public function appDetails()
    {
        $found = User::where("type", "master")->first();

        $found->ip = gethostbyname(gethostname());

        return $found;
    }
}
