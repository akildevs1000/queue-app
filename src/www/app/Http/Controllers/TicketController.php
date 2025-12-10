<?php

namespace App\Http\Controllers;

use App\Models\Token;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function nextForElectron()
    {
        $ticket = Token::where('is_printed', request("is_printed") ? true : false)
            ->whereDate('created_at', now())   // only today's tickets
            ->orderBy('id', 'asc')
            ->first();

        if (!$ticket) {
            return response()->json([
                'status' => false,
                'message' => 'No Ticket'
            ], 500);
        }

        $folder = now()->format('Y-m-d');
        $fileName = $ticket->token_number . ".pdf";
        $pdfPath = storage_path("app/tickets/$folder/$fileName");

        if (!file_exists($pdfPath)) {
            return response()->json([
                'status' => false,
                'message' => 'PDF not found'
            ], 500);
        }

        $pdfContent = base64_encode(file_get_contents($pdfPath));

        $ticket->update(["is_printed" => true]);

        return response()->json([
            'status' => true,
            'message' => $pdfContent
        ]);
    }
}
