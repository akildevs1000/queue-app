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
            'icon'              => 'nullable|string',
            'name'              => 'required|string|min:3|max:255',
            'code'              => 'required|string|min:1|max:255|unique:services,code,' . $this->service?->id,
            'description'       => 'nullable|string|min:3|max:255',
            'starting_number'   => 'required|integer|unique:services,starting_number,' . $this->service?->id,
        ];
    }
}
