<?php

use App\Http\Controllers\FeedBackController;
use App\Http\Controllers\TokenController;
use Illuminate\Support\Facades\Route;

Route::post("tokens", [TokenController::class, 'store']);

Route::middleware('auth')->group(function () {

    Route::resource("tokens", TokenController::class)->except(['store']);

    Route::get("token-counts",  [TokenController::class, 'TokenCounts']);
    Route::get("next-token",  [TokenController::class, 'nextToken']);
    Route::get("is-previous-token",  [TokenController::class, 'isPreviousToken']);
    Route::get("start-serving/{id}",  [TokenController::class, 'startServing']);
    Route::get("end-serving/{id}",  [TokenController::class, 'endServing']);
    Route::get("no-show-serving/{id}",  [TokenController::class, 'noShowServing']);

    

    Route::get("feedback",  [FeedBackController::class, 'feedback'])->name("feedback.index");
    Route::post("feedback",  [FeedBackController::class, 'store']);
    Route::get("feedback-by-counter",  [FeedBackController::class, 'feedbackByCounter']);
});
