<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\CounterController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoginLogController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\UserController;
use App\Models\Token;
use Carbon\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/guest', function () {
    return Inertia::render('guest', [
        'ticketInfo' => session('ticketInfo'),
    ]);
})->name('guest');

Route::get('/tv-settings', function () {
    return Inertia::render('tv-settings');
})->name('tv-settings');


Route::get('/serving_list', function () {
    return Inertia::render('serving_list');
});

Route::get('/welcome', function () {})->name('home')->middleware("auth");

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/report', [ReportController::class, 'index'])->name('report.index');
});


Route::resource("services", ServiceController::class)->middleware("auth");
Route::get("service-list", [ServiceController::class, 'dropDown']);

Route::resource("users", UserController::class)->middleware("auth");
Route::get("users-list", [UserController::class, 'dropDown'])->middleware("auth");
Route::put("update-password/{id}", [UserController::class, 'updatePassword'])->middleware("auth");

Route::get("service-by-user", [UserController::class, 'serviceByUser'])->middleware("auth");
Route::get("counter-by-user", [UserController::class, 'counterByUser'])->middleware("auth");

Route::get("login-logs", [LoginLogController::class, 'index'])->middleware("auth");

Route::get("last-login", [LoginLogController::class, 'lastLogin'])->middleware("auth");

Route::resource("counters", CounterController::class)->middleware("auth");
Route::get("counter-list", [CounterController::class, 'dropDown'])->middleware("auth");
Route::get("counter-list-by-service-id/{id}", [CounterController::class, 'counterListByServiceId'])->middleware("auth");



Route::get("contacts/chat/{id}", [ContactController::class, 'show'])->middleware("auth");

Route::post("messages", [MessageController::class, "store"])->middleware("auth");

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/token.php';


Route::get('/fire-serving-token-event', function () {
    $data = [
        "token" => "LQ" . rand(1000, 9999),
        "counter" => "Counter 1"
    ];

    $path = public_path('latest-event.json');
    File::put($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    return response()->json(['status' => 'Event saved'], 201);
});

Route::get('/latest-serving-token-event', function () {
    $path = public_path('latest-event.json');

    if (!File::exists($path)) {
        return response()->json(null);
    }

    $data = json_decode(file_get_contents($path), true);

    File::put($path, json_encode(null));

    return response()->json($data);
});
