<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCenterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'          => 'required|string|max:255',
            'domain'        => 'required|string|max:255|unique:centers,domain',
            'city'          => 'nullable|string|max:255',
            'logo'          => 'nullable|string|max:500',
            'website'       => 'nullable|url|max:500',
            'status'        => 'nullable|in:pending,active,rejected',
            'justificante'  => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', // Max 5MB
        ];
    }
}
