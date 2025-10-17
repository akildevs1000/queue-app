<?php

namespace App\Http\Requests\Service;

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
            'name'          => 'required|string|min:5|max:255',
            'code'          => 'required|string|min:1|max:255',
            'description'   => 'nullable|string|min:5|max:255',
        ];
    }
}
