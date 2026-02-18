<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCenterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $centerId = $this->route('center')->id;

        return [
            'name'          => 'sometimes|string|max:255',
            'domain'        => 'sometimes|string|max:255|unique:centers,domain,' . $centerId,
            'city'          => 'sometimes|nullable|string|max:255',
            'logo'          => 'sometimes|nullable|string|max:500',
            'website'       => 'sometimes|nullable|url|max:500',
            'status'        => 'sometimes|in:pending,active,rejected',
            'justificante'  => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ];
    }
}
