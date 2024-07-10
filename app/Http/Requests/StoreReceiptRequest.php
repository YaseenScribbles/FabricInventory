<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReceiptRequest extends FormRequest
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
            'lot_no' => 'required|string',
            'brand' => 'nullable|string',
            'cloth' => 'required|string',
            'contact_id' => 'required|integer',
            'fabric_id' => 'required|integer|exists:fabrics,id',
            'remarks' => 'nullable|string',
            'user_id' => 'required|integer|exists:users,id',
            'receipt_items' => 'required|array',
            'receipt_items.*.color_id' => 'required|integer|exists:colors,id',
            'receipt_items.*.dia' => 'required|integer',
            'receipt_items.*.rolls' => 'required|integer',
            'receipt_items.*.weight' => 'required',
        ];
    }
}
