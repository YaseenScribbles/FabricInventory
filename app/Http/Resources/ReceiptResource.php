<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReceiptResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lotNo' => $this->lot_no,
            'brand' => $this->brand,
            'contacId' => $this->contact_id,
            'contact' => $this->contact,
            'fabricId' => $this->fabric_id,
            'fabric' => $this->fabric,
            'remarks' => $this->remarks,
            'rolls' => $this->rolls,
            'weight' => $this->weight,
            'user' => $this->user
        ];
    }
}
