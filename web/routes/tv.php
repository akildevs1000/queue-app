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

    return response()->json($found);
});
