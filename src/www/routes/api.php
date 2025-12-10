<?php

use App\Http\Controllers\TicketController;
use App\Http\Controllers\TokenController;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/app-details', function (Request $request) {
    $found = User::where("type", "master")->first();
    return response()->json($found);
});




Route::get('/serving_list', [TokenController::class, "servingList"]);
Route::get('/send-token', [TokenController::class, 'sendToken']);

Route::get('/ticket/view', function () {
    // Static data for testing
    $response = [
        'name'                  => 'ABC Hospital',
        'token_number_display'  => 'A001',
        'service'               => 'General Service',
        'already_waiting_count' => 5,
        'estimated_wait_time'   => 10,
        'date'                  => now()->format('d-M-Y'),
        'time'                  => now()->format('h:i A'),
        'code'                  => 'SEC123',
    ];

    // Build HTML with centered content and nice font
    $html = '
    <style>
        @font-face {
            font-family: "Roboto";
            src: url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap");
        }
        body {
            font-family: "Roboto", sans-serif;
        }
    </style>
    <div style="
        width: 260px;
        border: 1px dashed #ccc;
        padding: 8px;
        font-size: 12px;
        color: black;
        text-align: center;
    ">
        <div style="font-weight: 700; font-size: 12px;">' . $response['name'] . '</div>
        <div style="margin-top: 4px; font-size: 14px;">Ticket</div>
        <div style="margin: 4px 0; font-size: 24px; font-weight: 700;">' . $response['token_number_display'] . '</div>
        <div style="margin-bottom: 4px; font-size: 12px;">' . $response['time'] . ' ' . $response['date'] . '</div>
        <div style="font-size: 12px;">You will be Served</div>
        <div style="font-size: 12px; font-weight: 700;">' . $response['service'] . ' ' . $response['code'] . '</div>
        <div style="margin-top: 8px; font-size: 10px;">
            Total: ' . $response['already_waiting_count'] . ' token(s) waiting for service<br/>
            Average waiting time: ' . $response['estimated_wait_time'] . ' mins
        </div>
    </div>';

    $pdf = Pdf::loadHTML($html)
        ->setPaper([0, 0, 280, 600], 'portrait'); // Ticket size

    return $pdf->stream('ticket.pdf');
});

Route::get('/ticket/print', function () {
    // Static data for testing
    $response = [
        'name'                  => 'ABC Hospital',
        'token_number_display'  => 'A001',
        'service'               => 'General Service',
        'already_waiting_count' => 5,
        'estimated_wait_time'   => 10,
        'date'                  => now()->format('d-M-Y'),
        'time'                  => now()->format('h:i A'),
        'code'                  => 'SEC123',
    ];

    // Build HTML with centered content and nice font
    $html = '
    <style>
        @font-face {
            font-family: "Roboto";
            src: url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap");
        }
        body {
            font-family: "Roboto", sans-serif;
        }
    </style>
    <div style="
        width: 260px;
        border: 1px dashed #ccc;
        padding: 8px;
        font-size: 12px;
        color: black;
        text-align: center;
    ">
        <div style="font-weight: 700; font-size: 12px;">' . $response['name'] . '</div>
        <div style="margin-top: 4px; font-size: 14px;">Ticket</div>
        <div style="margin: 4px 0; font-size: 24px; font-weight: 700;">' . $response['token_number_display'] . '</div>
        <div style="margin-bottom: 4px; font-size: 12px;">' . $response['time'] . ' ' . $response['date'] . '</div>
        <div style="font-size: 12px;">You will be Served</div>
        <div style="font-size: 12px; font-weight: 700;">' . $response['service'] . ' ' . $response['code'] . '</div>
        <div style="margin-top: 8px; font-size: 10px;">
            Total: ' . $response['already_waiting_count'] . ' token(s) waiting for service<br/>
            Average waiting time: ' . $response['estimated_wait_time'] . ' mins
        </div>
    </div>';

    $pdf = Pdf::loadHTML($html)
        ->setPaper([0, 0, 280, 600], 'portrait'); // Ticket size

    return $pdf->download('ticket.pdf');
});

Route::get('/electron/next-ticket', [TicketController::class, 'nextForElectron']);

function generateTicketHtml($response)
{
    return '
    <style>
        @font-face {
            font-family: "Roboto";
            src: url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap");
        }
        body {
            font-family: "Roboto", sans-serif;
        }
    </style>
    <div style="
        width: 260px;
        border: 1px dashed #ccc;
        padding: 8px;
        font-size: 12px;
        color: black;
        text-align: center;
    ">
        <div style="font-weight: 700; font-size: 12px;">' . $response['name'] . '</div>
        <div style="margin-top: 4px; font-size: 14px;">Ticket</div>
        <div style="margin: 4px 0; font-size: 24px; font-weight: 700;">' . $response['token_number_display'] . '</div>
        <div style="margin-bottom: 4px; font-size: 12px;">' . $response['time'] . ' ' . $response['date'] . '</div>
        <div style="font-size: 12px;">You will be Served</div>
        <div style="font-size: 12px; font-weight: 700;">' . $response['service'] . ' ' . $response['code'] . '</div>
        <div style="margin-top: 8px; font-size: 10px;">
            Total: ' . $response['already_waiting_count'] . ' token(s) waiting for service<br/>
            Average waiting time: ' . $response['estimated_wait_time'] . ' mins
        </div>
    </div>';
}

require __DIR__ . '/tv.php';
