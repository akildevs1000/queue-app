<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class YoutubeController extends Controller
{
    function getYoutubeVideoIds()
    {
        return response()->json([
            "tCDvOQI3pco"
        ]);
    }
}
