<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use WebSocket\Client;

class SendTrigger extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'send-trigger';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            $client = new Client("ws://192.168.2.6:8080", [
                'context' => stream_context_create([
                    'ssl' => [
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                        'allow_self_signed' => true,
                    ]
                ])
            ]);

            $client->send(json_encode([
                'event' => 'token-serving',
                'data' => [
                    'token' => rand(1000,9999),
                    'counter' => 'Counter 1',
                ]
            ]));

            // $client->close();
        } catch (\Exception $e) {
           $this->info('WebSocket error: ' . $e->getMessage());
        }
    }
}
