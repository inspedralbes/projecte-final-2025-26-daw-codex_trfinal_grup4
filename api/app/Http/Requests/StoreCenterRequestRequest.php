<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCenterRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'center_name' => 'required|string|max:255',
            'domain'      => 'required|string|max:255|unique:centers,domain',
            'city'        => 'nullable|string|max:255',
            'website'     => 'nullable|url|max:500',
            'full_name'   => 'required|string|max:255',
            'justificante' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'message'     => 'nullable|string|max:2000',
        ];
    }

    public function messages(): array
    {
        return [
            'justificante.required' => 'A supporting document is required to verify your teacher status.',
            'full_name.required' => 'Your full legal name is required for verification.',
            'domain.unique' => 'A center with this domain already exists.',
        ];
    }
}
