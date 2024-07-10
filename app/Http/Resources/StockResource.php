<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'receiptNo' => $this->id,
            'lotNo' => $this->lot_no,
            'brand' => $this->brand,
            'cloth' => $this->cloth,
            'fabric' => $this->fabric,
            'company' => $this->company,
            'store' => $this->store,
            'contact' => $this->contact,
            'rolls' => $this->rolls,
            'weight' => $this->weight,
            'days' => $this->days,
        ];
    }
}
