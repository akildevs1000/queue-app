<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OperationalHoursUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'operational_start_time' => ['nullable'],
            'operational_end_time' => ['nullable'],
        ];
    }
}
