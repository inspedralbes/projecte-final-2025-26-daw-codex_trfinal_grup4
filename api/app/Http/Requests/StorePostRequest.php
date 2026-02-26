<?php

namespace App\Http\Requests;

use App\Enums\PostType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StorePostRequest extends FormRequest
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
            'type'          => ['sometimes', new Enum(PostType::class)],
            'content'       => ['required_without:code_snippet', 'nullable', 'string', 'max:10000'],
            'code_snippet'  => ['required_without:content', 'nullable', 'string', 'max:50000'],
            'code_language' => ['nullable', 'string', 'max:50'],
            'tags'          => ['nullable', 'array', 'max:5'],
            'tags.*'        => ['string', 'max:30'],
            'visibility'    => ['sometimes', 'string', 'in:global,center'],
        ];
    }

    public function messages(): array
    {
        return [
            'content.required_without'      => 'Content is required when no code snippet is provided.',
            'code_snippet.required_without'  => 'A code snippet is required when no content is provided.',
        ];
    }
}
