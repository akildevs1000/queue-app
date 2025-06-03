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
        // return $this->feedbackByCounter();


        return Inertia::render('feedback', [
            'success' => session('success'),
        ]);
    }

    public function store(Request $request)
    {
        // Validate incoming request
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:10',
        ]);

        // Create token with rating and optional counter_id
        Feedback::create([
            'rating' => $validated['rating'],
            'counter_id' => Auth::user()->counter_id ?? null,
            'user_id' => Auth::user()->id ?? null,
        ]);

        return redirect()->route("feedback.index")->with('success', "Feedback has been submitted");
    }

    public function feedbackByCounter()
    {
        $user = Auth::user();

        $ratings = Feedback::where("user_id", $user->id)->where("counter_id", $user->counter_id)->pluck('rating')->toArray();

        if (empty($ratings)) {
            return  response()->json("No Rating"); // Output: "Poor"
        }

        $categorizeRating = function (int $rating): string {
            if ($rating >= 9) return 'Excellent';
            if ($rating >= 7) return 'Good';
            if ($rating >= 4) return 'Average';
            return 'Poor';
        };

        $categories = array_map($categorizeRating, $ratings);

        $counts = array_count_values($categories);
        $total = count($ratings);

        // Calculate percentage per category
        $performance = [];
        foreach (['Poor', 'Average', 'Good', 'Excellent'] as $cat) {
            $count = $counts[$cat] ?? 0;
            $performance[$cat] = round(($count / $total) * 100, 2);
        }

        arsort($performance); // Sort descending by percentage

        $overallLabel = key($performance); // Get the category with highest %

        return  response()->json($overallLabel); // Output: "Poor"
    }
}
