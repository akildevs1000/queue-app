<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class PrintPdf extends Command
{
    protected $signature = 'pdf:print {path}';
    protected $description = 'Print a local PDF silently on Windows using SumatraPDF';

    public function handle()
    {
        $path = $this->argument('path');

        if (!File::exists($path)) {
            $this->error("File not found: $path");
            return 1;
        }

        $this->info("Printing PDF: $path");

        if (PHP_OS_FAMILY === 'Windows') {
            // Your SumatraPDF path
            $sumatraPath = '"C:\\Program Files\\SmartQueue\\resources\\print.exe"';

            // Silent print to default printer
            $command = "$sumatraPath -print-to-default \"$path\"";

            exec($command, $output, $status);
        } else {
            // Linux / Mac
            exec("lp \"$path\"", $output, $status);
        }

        if ($status === 0) {
            $this->info("PDF sent to printer successfully!");
        } else {
            $this->error("Failed to print PDF.");
        }

        return 0;
    }
}
