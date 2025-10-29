<?php
namespace App\Jobs;

use App\Models\Token;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Barryvdh\DomPDF\Facade\Pdf;


class CreateTokenJob implements ShouldQueue
{
    use Queueable;

    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function handle(): void
{
    $validatedData = $this->data;

    // Generate token number
    $lastTokenNumber       = Token::latest('token_number')->whereDate('created_at', Carbon::today())->value('token_number') ?? 0;
    $predictedTokenNumber  = (int) $lastTokenNumber + 1;
    $predictedTokenDisplay = $validatedData['code'] . str_pad($predictedTokenNumber, 4, '0', STR_PAD_LEFT);

    $tokenData = [
        'language'             => $validatedData['language'],
        'service_id'           => $validatedData['service_id'],
        'token_number'         => $predictedTokenNumber,
        'token_number_display' => $predictedTokenDisplay,
    ];

    if (! empty($validatedData['vip_number'])) {
        $tokenData['vip_number']  = $validatedData['vip_number'];
        $tokenData['vip_serving'] = 1;
    }

    Token::create($tokenData);

    // Prepare response data for the ticket
    $response = [
        'name'                  => User::where("type", "master")->value("name") ?? 'ABC Hospital',
        'token_number_display'  => $tokenData['token_number_display'],
        'service'               => $validatedData['service_name'],
        'already_waiting_count' => Token::whereDate('created_at', Carbon::today())
                                        ->where('service_id', $tokenData['service_id'])
                                        ->where("status", Token::PENDING)
                                        ->count(),
        'estimated_wait_time'   => (new Token)->getAverageServingTime($tokenData['service_id']),
        'date'                  => now()->format('d-M-Y'),
        'time'                  => now()->format('h:i A'),
        'code'                  => $validatedData['code'],
    ];

    info($response);

    // ----------------------------
    // Generate PDF
    // ----------------------------
     $html = '
<style>
    body {
        font-family: Arial, sans-serif;
        font-size: 16px;
        color: black;
        line-height: 1.5;
        margin: 0;
        padding: 0;
    }
    .ticket {
        width: 260px;
        border: 2px dashed #000;
        padding: 12px;
        text-align: center;
    }
    .ticket .name {
        font-weight: bold;
        font-size: 20px;
        margin-bottom: 10px;
    }
    .ticket .title {
        font-size: 18px;
        margin-bottom: 8px;
    }
    .ticket .token {
        font-size: 40px;
        font-weight: bold;
        margin: 12px 0;
    }
    .ticket .service {
        font-size: 18px;
        font-weight: bold;
        margin: 10px 0;
    }
    .ticket .info {
        font-size: 16px;
        margin-top: 10px;
    }
    .ticket .datetime {
        font-size: 16px;
        margin-top: 20px;
        margin-bottom: 20px;
    }
</style>

<div class="ticket">
    <div class="name">' . $response['name'] . '</div>
    <div class="title">Ticket</div>
    <div class="token">' . $response['token_number_display'] . '</div>
    <div class="service">' . $response['service'] . ' ' . $response['code'] . '</div>
    <div class="info">
        Total: ' . $response['already_waiting_count'] . ' token(s) waiting<br/>
        Average waiting time: ' . $response['estimated_wait_time'] . ' mins
    </div>
    <div class="datetime">' . $response['time'] . ' ' . $response['date'] . '</div>
</div>';

    // Save temporary PDF
    $tempPdf = storage_path('app/temp_ticket.pdf');
    Pdf::loadHTML($html)
        ->setPaper([0, 0, 280, 600], 'portrait')
        ->save($tempPdf);

    // ----------------------------
    // Print PDF silently (Windows example using SumatraPDF)
    // ----------------------------
    $sumatraPath = '"C:\\Users\\admin\\Downloads\\SumatraPDF-3.5.2-64\\print.exe"';
    $command = "$sumatraPath -print-to-default \"$tempPdf\"";

    exec($command, $output, $status);

    // Delete temp PDF
    //File::delete($tempPdf);

    if ($status === 0) {
        info("Ticket printed successfully!");
    } else {
        info("Failed to print ticket.");
    }
}


    public function handle_old(): void
    {
        $validatedData = $this->data;

        $lastTokenNumber       = Token::latest('token_number')->whereDate('created_at', Carbon::today())->value('token_number') ?? 0;
        $predictedTokenNumber  = (int) $lastTokenNumber + 1;
        $predictedTokenDisplay = $validatedData['code'] . str_pad($predictedTokenNumber, 4, '0', STR_PAD_LEFT);

        $tokenData = [
            'language'             => $validatedData['language'],
            'service_id'           => $validatedData['service_id'],
            'token_number'         => $predictedTokenNumber,
            'token_number_display' => $predictedTokenDisplay,
        ];

// Only add VIP-related fields if vip_number is provided
        if (! empty($validatedData['vip_number'])) {
            $tokenData['vip_number']  = $validatedData['vip_number'];
            $tokenData['vip_serving'] = 1;
        }

        Token::create($tokenData);

        $response = [
            'name'                  => User::where("type", "master")->value("name"),
            'token_number_display'  => $tokenData['token_number_display'],
            'service'               => $validatedData['service_name'],
            'already_waiting_count' => Token::whereDate('created_at', Carbon::today())->where('service_id', $tokenData['service_id'])->where("status", Token::PENDING)->count(), // position in queue
            'estimated_wait_time'   => (new Token)->getAverageServingTime($tokenData['service_id']),                                                                             // assuming 10 mins per token
            'date'                  => now()->format('d-M-Y'),
            'time'                  => now()->format('h:i A'),
        ];

        info($response);
    }
}
