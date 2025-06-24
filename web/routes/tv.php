<?php

use App\Http\Controllers\YoutubeController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get("get-youtube-video-ids",  [YoutubeController::class, 'getYoutubeVideoIds']);


Route::get("fetch_tv_settings",  function () {

    return response()->json([
        "media_type" => "image",
        "media_url" => [
            // "https://i.pinimg.com/originals/46/41/61/4641611401ecb508c625eebe448da663.gif",
            "https://picsum.photos/id/1018/800/600",
            "https://picsum.photos/id/1025/800/600",
            "https://picsum.photos/id/1035/800/600",
            "https://picsum.photos/id/1043/800/600",
            "https://picsum.photos/id/1062/800/600"
        ],
        "media_height" => 500,
        "media_width" => 500,
        "ip" => "192.168.3.244",
        "port" => "7777",
    ]);

    return User::whereNotNull(["ip", "port"])->where("type", "master")->first();

    return response()->json([
        "type" => "image", // youtube | image | video
        "image" => asset('promotions/image.png'),
        "url" => asset('promotions/video.mp4'),
        "youtubeId" => "tCDvOQI3pco",
    ]);
});
