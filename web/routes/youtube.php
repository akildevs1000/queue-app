<?php

use App\Http\Controllers\YoutubeController;
use Illuminate\Support\Facades\Route;

Route::get("get-youtube-video-ids",  [YoutubeController::class, 'getYoutubeVideoIds']);
