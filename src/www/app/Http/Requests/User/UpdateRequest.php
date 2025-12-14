<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_id' => 'required|integer|min:1',
            'name' => 'required|string|max:255',

            'login_pin' => [
                'required',
                'digits_between:4,6',
                Rule::unique('users', 'login_pin')->ignore($this->user),
            ],
        ];
    }
}
