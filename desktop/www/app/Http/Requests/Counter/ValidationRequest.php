<?php

namespace App\Http\Requests\Counter;

use Illuminate\Foundation\Http\FormRequest;

class ValidationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_id' => 'required|min:1|numeric',
            'name' => 'required|string|min:5|max:255',
            'description' => 'nullable|string|min:5|max:255',
        ];
    }
}
