<?php

namespace App\Http\Requests\Token;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'language' => 'required|string|min:1|max:255',
            'service_id' => 'required|numeric',
            'code' => 'required',
            'service_name' => 'required',
        ];
    }
}