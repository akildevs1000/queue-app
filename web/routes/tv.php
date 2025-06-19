<?php

use App\Http\Controllers\YoutubeController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get("get-youtube-video-ids",  [YoutubeController::class, 'getYoutubeVideoIds']);


Route::get("fetch_tv_settings",  function () {

    return User::whereNotNull(["ip","port"])->where("type","master")->first();

    return response()->json([
        "type" => "image", // youtube | image | video
        "image" => asset('promotions/image.png'),
        "url" => asset('promotions/video.mp4'),
        "youtubeId" => "tCDvOQI3pco",
    ]);
});
