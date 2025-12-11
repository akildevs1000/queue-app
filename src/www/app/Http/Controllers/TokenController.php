<?php

namespace App\Http\Controllers;

use App\Http\Requests\Token\StoreRequest;
use App\Http\Requests\Token\UpdateRequest;
use App\Jobs\CreateTokenJob;
use App\Models\Token;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use WebSocket\Client;

class TokenController extends Controller
{
    private $currentTokenNumber = 1;

    public function index()
    {
        return Token::latest()
            ->with("counter")
            ->whereDate('created_at', Carbon::today())->where('status', request("status", Token::SERVING))->paginate(request("per_page", 10));
    }

    public function servingList()
    {
        return Token::orderBy("token", "desc")
            ->with("counter:id,name")
            ->whereDate('created_at', Carbon::today())->where('status', request("status", Token::SERVING))
            ->get(["id", "counter_id", "token_number_display"])
            ->map(function ($token) {
                return [
                    'token'   => $token->token_number_display,
                    'counter' => optional($token->counter)->name,
                ];
            });
    }

    public function getLastserving()
    {
        return Token::whereDate('created_at', Carbon::today())
            ->where('status', request("status", Token::SERVING))
            ->first(["id", "token_number_display"]);
    }

    public function TokenCounts()
    {
        $counts = Token::select('status', DB::raw('count(*) as total'))
            ->where('service_id', Auth::user()->service_id)
            ->where('counter_id', request("counter_id",0))
            ->whereDate('created_at', Carbon::today())
            ->groupBy('status')
            ->pluck('total', 'status');

        $pendingCount = Token::where('service_id', Auth::user()->service_id)
            ->where('status', TOKEN::PENDING)
            ->whereDate('created_at', Carbon::today())
            ->count();

        return response()->json([
            'pending'     => $pendingCount,
            'served'      => $counts[TOKEN::SERVED] ?? 0,
            'serving'     => $counts[TOKEN::SERVING] ?? 0,
            'notAnswered' => $counts[TOKEN::NOT_SHOW] ?? 0,
        ]);
    }

    public function nextToken()
    {

        $nextToken = Token::where('service_id', Auth::user()->service_id ?? 0)
            ->whereDate('created_at', Carbon::today())
            ->where('status', TOKEN::PENDING)
            ->where('vip_serving', 1)
            ->whereNotNull("vip_number")
            ->first(['id', 'token_number_display']);

        if ($nextToken) {
            return $nextToken;
        }

        $nextToken = Token::where('service_id', Auth::user()->service_id ?? 0)
            ->whereDate('created_at', Carbon::today())
            ->where('status', TOKEN::PENDING)
            ->first(['id', 'token_number_display']);

        return response()->json($nextToken);
    }

    public function startServing($id)
    {
        if (! $id) {
            return;
        }

        $token = Token::find($id);

        if (! $token) {
            return response()->json(['error' => 'Token not found'], 404);
        }

        $token->start_serving = now();
        $token->status        = Token::SERVING;
        $token->counter_id    = request("counter_id", 0);
        $token->user_id       = Auth::user()->id;
        $token->save();

        $token->load('counter');

        return response()->json([
            "token"    => $token->token_number_display,
            "counter"  => $token->counter->name,
            "language" => $token->language,
        ]);
    }

    public function endServing(Request $request, $id)
    {
        // Validate $id and find the token
        $token = Token::find($id);
        if (! $token) {
            return response()->json(['error' => 'Token not found'], 404);
        }

        // Ensure start_serving is set, otherwise can't calculate duration
        if (! $token->start_serving) {
            return response()->json(['error' => 'Start serving time not set'], 400);
        }

        $timestamp = now();

        // $timestamp = "2025-05-27 18:36:21";

        $timeDisplay = $request->input('total_serving_time_display');

        if (! $timeDisplay || ! preg_match('/^\d{2}:\d{2}:\d{2}$/', $timeDisplay)) {
            return response()->json(['error' => 'Invalid or missing total_serving_time_display format'], 422);
        }

        list($hours, $minutes, $seconds) = explode(':', $timeDisplay);
        $totalSeconds                    = ((int) $hours * 3600) + ((int) $minutes * 60) + (int) $seconds;

        // Calculate total elapsed time in seconds between start and end serving timestamps
        $start          = Carbon::parse($token->start_serving);
        $end            = Carbon::parse($timestamp);
        $elapsedSeconds = $end->diffInSeconds($start);

        // Calculate pause time in seconds (elapsed - active serving)
        $pauseSeconds = (int) abs($elapsedSeconds) - (int) abs($totalSeconds);

        // Format pause time into HH:MM:SS
        $pauseHours       = floor($pauseSeconds / 3600);
        $pauseMinutes     = floor(($pauseSeconds % 3600) / 60);
        $pauseSecs        = $pauseSeconds % 60;
        $pauseTimeDisplay = sprintf('%02d:%02d:%02d', $pauseHours, $pauseMinutes, $pauseSecs);

        $token->end_serving                = $timestamp;
        $token->total_serving_time         = $totalSeconds;
        $token->total_serving_time_display = $request->total_serving_time_display;
        $token->pause_time_display         = $pauseTimeDisplay;
        $token->status                     = Token::SERVED;
        $token->vip_serving                = 0;
        $token->counter_id                 = request("counter_id",0);
        $token->save();

        return response()->json($token);
    }

    public function noShowServing(Request $request, $id)
    {
        // Validate $id and find the token
        $token = Token::find($id);
        if (! $token) {
            return response()->json(['error' => 'Token not found'], 404);
        }

        // Ensure start_serving is set, otherwise can't calculate duration
        if (! $token->start_serving) {
            return response()->json(['error' => 'Start serving time not set'], 400);
        }
        $token->status     = Token::NOT_SHOW;
        $token->counter_id = request("counter_id",0);
        $token->save();

        return response()->json($token);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request)
    {
        $validatedData = $request->validated();
        // Token::create($tokenData);
        CreateTokenJob::dispatch($validatedData);

        return redirect()->route('guest');
    }

    public function apiStore(StoreRequest $request)
    {
        $validatedData = $request->validated();
        // Token::create($tokenData);
        CreateTokenJob::dispatch($validatedData);

        return response()->json(["status" => true, "message" => "token dispatched"]);
    }

    

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, Token $Token)
    {
        $Token->update($request->validated());

        return redirect()->route("tokens.index");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Token $Token)
    {
        $Token->delete();

        return redirect()->route("tokens.index");
    }

    public function manualCall($token_number_display)
    {
        $nextToken = Token::whereDate('created_at', Carbon::today())
            ->where('token_number_display', $token_number_display)
            ->first(['id', 'token_number_display', "language"]);
        return response()->json($nextToken);
    }

    public function sendToken(Request $request)
    {
        $ip   = $request->input('ip', '192.168.3.245');
        $port = $request->input('port', 7777);

        $url = "ws://{$ip}:{$port}";

        try {
            // Connect to WebSocket server
            $client = new Client($url, [
                'context' => stream_context_create([
                    'ssl' => [
                        'verify_peer'      => false,
                        'verify_peer_name' => false,
                    ],
                ]),
            ]);

            // Generate token like "LQ0001"
            $token = 'LQ' . str_pad($this->currentTokenNumber, 4, '0', STR_PAD_LEFT);
            $this->currentTokenNumber++;

            // Create message payload
            $message = [
                'event' => 'token-serving',
                'data'  => [
                    'token'   => $token,
                    'counter' => 'Counter 1',
                ],
            ];

            // Send message
            $client->send(json_encode($message));

            // Optionally receive response
            $response = $client->receive();

            $client->close();

            return response()->json([
                'success'  => true,
                'sent'     => $message,
                'response' => $response,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
