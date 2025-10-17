<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ValidationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {

        return [
            'item_number' => 'required|string|min:5|max:255',
            'title' => 'required|string|min:5|max:255',
            'price' => 'required|numeric|min:1|max:1000',
            'qty' => 'required|numeric|min:1|max:1000',
            'description' => 'required|string|min:5|max:255',
            'product_category_id' => 'required|min:1|numeric',
            // 'user_id' => 'required|min:1|numeric',

            // 'image' => 'required|file|mimes:jpg,png,pdf,docx|max:2048',
        ];
    }
}
