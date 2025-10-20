<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\File;

class PrintTicket extends Command
{
    protected $signature = 'ticket:print';
    protected $description = 'Generate and print a ticket PDF silently';

    public function handle()
    {
        $this->info('Generating ticket PDF...');

        // Static / test data
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

        // Generate HTML with bigger fonts and spacing
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

        // Save PDF temporarily
        $tempPdf = storage_path('app/temp_ticket.pdf');
        Pdf::loadHTML($html)
            ->setPaper([0, 0, 280, 600], 'portrait')
            ->save($tempPdf);

        $this->info("PDF generated at $tempPdf");

        // Print PDF silently using SumatraPDF (Windows)
        $sumatraPath = '"C:\\Users\\admin\\Downloads\\SumatraPDF-3.5.2-64\\print.exe"';
        $command = "$sumatraPath -print-to-default \"$tempPdf\"";

        exec($command, $output, $status);

        // Delete temp PDF
        File::delete($tempPdf);

        if ($status === 0) {
            $this->info("Ticket sent to printer successfully!");
        } else {
            $this->error("Failed to print ticket.");
        }

        return 0;
    }
}
