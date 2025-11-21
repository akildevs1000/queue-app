<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Set this to true to allow validation; modify based on your auth logic.
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'sender_id' => ['required', 'exists:users,id'],
            'receiver_id' => ['required', 'exists:users,id'],
            'message' => ['required', 'string', 'max:500'],
        ];
    }
}
