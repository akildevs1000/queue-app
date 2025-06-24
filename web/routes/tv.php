<?php

use App\Http\Controllers\YoutubeController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get("get-youtube-video-ids",  [YoutubeController::class, 'getYoutubeVideoIds']);


Route::get("fetch_tv_settings",  function () {

    $found = User::whereNotNull(["ip", "port"])
        ->where("type", "master")
        ->first();

    if ($found) {
        $found->media_url = explode("\n", $found->media_url);

        // Convert to integers (or float if you expect decimal dimensions)
        $found->media_height = (int) $found->media_height;
        $found->media_width = (int) $found->media_width;
    }

    return $found;
});
