<?php

namespace App\Http\Requests\Token;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'counter_id' => 'required|min:1|numeric',
            'user_id' => 'required|min:1|numeric',
            'status' => 'required|min:1|numeric',
        ];
    }
}
