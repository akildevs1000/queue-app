<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\CounterController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoginLogController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\UserController;
use App\Models\Counter;
use App\Models\Service;
use App\Models\Token;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/setup', function () {
    return Inertia::render('Setup/Index', [
        'services'  =>  Service::latest()->paginate(request("per_page", 10)),
        'counters'  =>  Counter::latest()->with('service')->paginate(request("per_page", 10)),
        'users'     =>  User::with("service", "counter")->latest()->where("type", "user")->paginate(request("per_page", 10)),
    ]);
})->name('setup');

Route::get('/guest', function () {
    return Inertia::render('guest', [
        'ticketInfo' => session('ticketInfo'),
    ]);
})->name('guest');

Route::get('/tv', function () {
    return Inertia::render('tv', [
        'ticketInfo' => session('ticketInfo'),
    ]);
})->name('tv');

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
    Route::get('/report/download', [ReportController::class, 'download'])->name('report.download');
    Route::get('/peak-hour-report', [ReportController::class, 'peakHourReport'])->name('report.peak_hour_report');
    Route::get('/peak-day-report', [ReportController::class, 'peakDayReport'])->name('report.peak_day_report');
});


Route::resource("services", ServiceController::class)->middleware("auth");
Route::get("service-list", [ServiceController::class, 'dropDown']);
Route::get("socket-ip-and-port", [UserController::class, 'socketIpAndPort']);
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

Route::resource("customers", CustomerController::class)->middleware("auth");
Route::get("customers-list", [CustomerController::class, 'dropDown'])->middleware("auth");
Route::get("next-vipnumber", [CustomerController::class, 'nextVipNumber'])->middleware("auth");


use Mpdf\Mpdf;
use App\Helpers\Translator;

Route::get('/pdf-ticket-test', function () {

    $lang = request('lang', 'en'); // default to Arabic

    // Set content based on lang
    if ($lang === 'ar') {
        $font = 'notonaskharabic';
        $direction = 'rtl';
    } else {
        $font = 'arial'; // system font or any English font
        $direction = 'ltr';
    }

    $headingTest = Translator::translateText('Welcome to', $lang);
    $nameText = Translator::translateText('ABC Hospital', $lang);
    $titleText = Translator::translateText('Ticket', $lang);
    $token = Translator::translateText('0012', $lang);
    $serviceText = Translator::translateText('Example Service', $lang);
    $infoText = Translator::translateText('Total: 5 tokens waiting<br/>Average waiting time: 10 minutes', $lang);
    $datetimeText = '10:30 AM 30-Oct-2025';

    $html = "
    <!DOCTYPE html>
    <html lang='{$lang}' dir='{$direction}'>
    <head>
        <meta charset='UTF-8'>
        <title>Ticket Preview</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                font-size: 16px;
                color: black;
                line-height: 1.5;
                margin: 0;
                padding: 0;
                direction: {$direction};
                text-align: " . ($direction === 'rtl' ? 'right' : 'left') . ";
            }
            .ticket {
                width: 260px;
                border: 2px dashed #000;
                padding: 12px;
                text-align: center;
            }
            .ticket .heading { font-weight: ; font-size: 16px; margin-bottom: 10px; }
            .ticket .name { font-weight: bold; font-size: 20px; margin-bottom: 10px; }
            .ticket .title { font-size: 18px; margin-bottom: 8px; }
            .ticket .token { font-size: 40px; font-weight: bold; margin: 12px 0; }
            .ticket .service { font-size: 18px; font-weight: bold; margin: 10px 0; }
            .ticket .info { font-size: 16px; margin-top: 10px; }
            .ticket .datetime { font-size: 16px; margin-top: 20px; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class='ticket'>
            <div class='heading'>{$headingTest}</div>
            <div class='name'>{$nameText}</div>
            <div class='title'>{$titleText}</div>
            <div class='token'>{$token}</div>
            <div class='service'>{$serviceText}</div>
            <div class='info'>{$infoText}</div>
            <div class='datetime'>{$datetimeText}</div>
        </div>
    </body>
    </html>
    ";

    $mpdf = new Mpdf([
        'mode' => 'utf-8',
        'format' => [75, 115],
        'margin_left' => 5,
        'margin_right' => 5,
        'margin_top' => 5,
        'margin_bottom' => 5,
    ]);

    // Arabic font registration
    if ($lang === 'ar') {
        $mpdf->AddFontDirectory(storage_path('fonts'));
        $mpdf->fontdata['notonaskharabic'] = [
            'R' => 'NotoNaskhArabic-Regular.ttf',
            'B' => 'NotoNaskhArabic-Bold.ttf',
            'I' => 'NotoNaskhArabic-Regular.ttf',
            'BI' => 'NotoNaskhArabic-Bold.ttf',
        ];
    }

    $tempPdf = storage_path('app/temp_ticket.pdf'); // will be saved in storage/app/temp/ticket.pdf

    $mpdf->SetFont($font, '', 16);
    $mpdf->WriteHTML($html);
    $mpdf->Output($tempPdf);

    $printExe = base_path('print.exe');

    $command = "\"$printExe\" -print-to-default \"$tempPdf\"";

    exec($command, $output, $status);

    return $status === 0 ? "Ticket printed successfully" : "Failed to print ticket.";
});
