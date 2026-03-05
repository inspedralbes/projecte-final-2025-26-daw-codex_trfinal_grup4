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
            'content'       => ['required_without_all:code_snippet,image', 'nullable', 'string', 'max:10000'],
            'image'         => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'code_snippet'  => ['required_without_all:content,image', 'nullable', 'string', 'max:50000'],
            'code_language' => ['nullable', 'string', 'max:50'],
            'tags'          => ['nullable', 'array', 'max:5'],
            'tags.*'        => ['string', 'max:30'],
            'visibility'    => ['sometimes', 'string', 'in:global,center'],
        ];
    }

    public function messages(): array
    {
        return [
            'content.required_without_all'      => 'Either content, code snippet, or an image is required.',
            'code_snippet.required_without_all'  => 'Either content, code snippet, or an image is required.',
            'image.image' => 'The uploaded file must be a valid image.',
            'image.max' => 'The image must not be larger than 5MB.',
        ];
    }
}
