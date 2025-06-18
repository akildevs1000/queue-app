<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FeedBackController extends Controller
{

    public function feedback()
    {
        return Inertia::render('feedback', [
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function store(Request $request)
    {
        // Validate incoming request
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:10',
            'token_id' => 'required|integer',
        ]);

        // Prevent duplicate feedback for the same token
        $feedback = Feedback::where('token_id', $validated['token_id'])->first();

        if ($feedback) {
            return redirect()->route("feedback.index")->with('error', "Feedback for {$feedback->token_number_display} has already been submitted.");
        }

        // Create feedback
        Feedback::create([
            'rating' => $validated['rating'],
            'token_id' => $validated['token_id'],
            'counter_id' => Auth::user()->counter_id ?? null,
            'user_id' => Auth::user()->id ?? null,
        ]);

        return redirect()->route("feedback.index")->with('success', "Feedback has been submitted.");
    }


    public function feedbackByCounter()
    {
        return  response()->json(Feedback::feedbackRating(Auth::user()->counter_id));
    }
}
