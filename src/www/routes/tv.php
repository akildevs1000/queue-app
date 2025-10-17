<?php

use App\Http\Controllers\YoutubeController;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get("fetch_tv_settings", function () {
    $found = User::whereNotNull(["ip", "port"])
        ->where("type", "master")
        ->first();

    if (!$found) {
        return response()->json(['message' => 'No TV settings found'], 404);
    }

    if (in_array($found->media_type, ['image', 'video', 'gif']) && is_array($found->media_url)) {
        $found->media_url = array_map(function ($path) {
            return url(Storage::url($path));
        }, $found->media_url);
    }

    $found->media_url = [
        'https://th.bing.com/th/id/R.74f2895f6c587593e4251126cc0f7b0c?rik=m%2f7eDkdzYXej%2fQ&riu=http%3a%2f%2fahfootwear.co.uk%2fcdn%2fshop%2fcollections%2fCLEARANCE.jpg%3fv%3d1675347547&ehk=VTfKgQB2vW6zPK4wKwYphopJa4VHeWx2EteEjCOeJHw%3d&risl=&pid=ImgRaw&r=0',
        'https://images.unsplash.com/photo-1492447166138-50c3889fccb1',
        'https://images.unsplash.com/photo-1526045612212-70caf35c14df',
    ];

    $found->timeout = 10000;
    

    return response()->json($found);
});
