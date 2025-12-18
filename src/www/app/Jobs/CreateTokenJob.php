<?php

namespace App\Jobs;

use App\Helpers\Translator;
use App\Models\Service;
use App\Models\Token;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Mpdf\Mpdf;

class CreateTokenJob implements ShouldQueue
{
    use Queueable;

    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function handle()
    {
        $validatedData = $this->data;

        $service = Service::find($validatedData['service_id']);

        $startingNumber = $service ? (int) $service->starting_number : 0;

        // Generate token number
        $lastTokenNumber       = Token::latest('token_number')
            ->whereDate('created_at', Carbon::today())
            ->where('service_id', $validatedData['service_id'])
            ->value('token_number') ?? 0;

        if ($lastTokenNumber) {
            $predictedTokenNumber = (int) $lastTokenNumber + 1;
        } else {
            $predictedTokenNumber = (int) $startingNumber + 1;
        }

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

        $lang = $validatedData['language'];

        $headingTest = Translator::translateText('Welcome to', $lang);
        $nameText = Translator::translateText(User::where("type", "master")->value("name") ?? 'ABC Hospital', $lang);
        $titleText = Translator::translateText('Ticket', $lang);
        $token = Translator::translateText($predictedTokenDisplay, $lang);
        $service = Translator::translateText($validatedData['service_name'], $lang);

        $total = Token::whereDate('created_at', Carbon::today())
            ->where('service_id', $tokenData['service_id'])
            ->where("status", Token::PENDING)
            ->count();

        $estimated_wait_time = (new Token)->getAverageServingTime($tokenData['service_id']);

        $infoText = Translator::translateText("Total: $total tokens waiting<br/>Average waiting time: $estimated_wait_time minutes", $lang);

        $datetimeText = now()->format('d-M-Y h:i A');

        // Set content based on lang
        if ($lang === 'ar') {
            $font = 'notonaskharabic';
            $direction = 'rtl';
        } else {
            $font = 'arial'; // system font or any English font
            $direction = 'ltr';
        }

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
            <div class='service'>{$service}</div>
            <div class='info'>{$infoText}</div>
            <div class='datetime' style='direction:ltr !important;'>{$datetimeText}</div>
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

        $folder = now()->format('Y-m-d'); // e.g., 2025-12-10
        $dirPath = storage_path("app/tickets/$folder");

        // Ensure folder exists
        if (!file_exists($dirPath)) {
            mkdir($dirPath, 0777, true);
        }

        $fileName = $predictedTokenNumber . ".pdf"; // directly use token number
        $tempPdf = $dirPath . DIRECTORY_SEPARATOR . $fileName;

        $mpdf->SetFont($font, '', 16);
        $mpdf->WriteHTML($html);
        $mpdf->Output($tempPdf);


        // $printExe = base_path('print.exe');

        // $command = "\"$printExe\" -print-to-default \"$tempPdf\"";

        // exec($command, $output, $status);

        // $status === 0 ? "Ticket printed successfully" : "Failed to print ticket.";

        // info($status);

        return;
    }
}
