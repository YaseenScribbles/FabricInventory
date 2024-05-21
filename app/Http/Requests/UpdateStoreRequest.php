<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStoreRequest extends FormRequest
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
            'code' => 'required|string|unique:stores,code,' . $this->route('store.id'),
            'name' =>  'required|string|unique:stores,name,' . $this->route('store.id'),
            'supervisor' => 'nullable|string',
            'phone' => 'nullable|string',
            'user_id' => 'required|exists:users,id'
        ];
    }
}
