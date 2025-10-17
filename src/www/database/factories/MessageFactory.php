<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Arr;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sender_id' => Arr::random(array(1, 22)),
            'receiver_id' => Arr::random(array(1, 22)),
            'message' => $this->faker->sentence(),
            'datetime' => $this->faker->dateTime(),
        ];
    }
}
