<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id ?? $this->user()?->id;

        return [
            'service_id' => 'required|min:1|numeric',
            'counter_id' => 'required|min:1|numeric',
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $userId,
            'number' => 'required|string|max:255|unique:users,number,' . $userId,
        ];
    }
}
