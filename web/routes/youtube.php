<?php

use App\Http\Controllers\YoutubeController;
use Illuminate\Support\Facades\Route;

Route::get("get-youtube-video-ids",  [YoutubeController::class, 'getYoutubeVideoIds']);


Route::get("fetch_media",  function () {
    return response()->json([
        "type" => "image", // youtube | image | video
        "image" => asset('promotions/image.png'),
        "url" => asset('promotions/video.mp4'),
        "youtubeId" => "tCDvOQI3pco",
    ]);
});
