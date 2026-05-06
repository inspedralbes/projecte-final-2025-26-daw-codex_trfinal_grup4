<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'receiver_id' => ['required_without:group_id', 'nullable', 'integer', 'exists:users,id'],
            'group_id' => ['required_without:receiver_id', 'nullable', 'integer', 'exists:groups,id'],
            'content' => ['required', 'string', 'max:1000', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'receiver_id.required' => 'El destinatario es obligatorio.',
            'receiver_id.exists' => 'El usuario destinatario no existe.',
            'content.required' => 'El mensaje no puede estar vacío.',
            'content.max' => 'El mensaje no puede superar los 1000 caracteres.',
        ];
    }
}
