<?php

namespace App\Http\Requests;

use App\Enums\PostType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content'       => ['sometimes', 'nullable', 'string', 'max:10000'],
            'code_snippet'  => ['sometimes', 'nullable', 'string', 'max:50000'],
            'code_language' => ['sometimes', 'nullable', 'string', 'max:50'],
            'tags'          => ['sometimes', 'nullable', 'array', 'max:5'],
            'tags.*'        => ['string', 'max:30'],
        ];
    }
}
