<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $guarded = [];

    public static function feedbackRating($counter_id)
    {

        $ratings = Feedback::where("counter_id", $counter_id)->pluck('rating')->toArray();

        if (empty($ratings)) {
            return  "No Rating"; // Output: "Poor"
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

        return key($performance); // Get the category with highest %
    }

    public static function feedbackRatingInNumber($counter_id)
    {
        $ratings = Feedback::where("counter_id", $counter_id)->pluck('rating')->toArray();

        if (empty($ratings)) {
            return "No Rating";
        }

        $average = array_sum($ratings) / count($ratings);

        // Optional: Round to 2 decimal places
        return round($average, 2);
    }
}
