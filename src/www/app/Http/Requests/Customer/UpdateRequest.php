<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
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
     */
    public function rules(): array
    {
        $customerId = $this->route('customer'); // assumes route model binding or {customer} param

        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email,' . $customerId,
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'vip_number' => 'nullable|string|max:15|unique:customers,vip_number,' . $customerId,
            'date_of_birth' => 'nullable|date|before:today',

            'rfid' => 'nullable'
        ];
    }

    /**
     * Custom error messages (optional)
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Customer name is required.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'vip_number.unique' => 'This VIP number already exists.',
            'date_of_birth.before' => 'Date of birth must be before today.',
        ];
    }
}
