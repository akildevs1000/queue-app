<?php

use App\Http\Controllers\TokenController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::get('/serving_list', [TokenController::class, "servingList"]);
Route::get('/send-token', [TokenController::class, 'sendToken']);


require __DIR__ . '/tv.php';
