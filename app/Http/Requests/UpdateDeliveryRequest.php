<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDeliveryRequest extends FormRequest
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
            'receipt_id' => 'required|exists:receipts,id',
            'contact_id' => 'required|integer',
            'remarks' => 'nullable|string',
            'user_id' => 'required|exists:users,id',
            'delivery_items' => 'required|array',
            'delivery_items.*.color_id' => 'required|exists:colors,id',
            'delivery_items.*.dia' => 'required|integer',
            'delivery_items.*.rolls' => 'required|integer',
            'delivery_items.*.weight' => 'required'
        ];
    }
}
