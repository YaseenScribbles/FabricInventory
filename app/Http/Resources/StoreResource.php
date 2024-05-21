<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreResource extends JsonResource
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
            'code' => $this->code,
            'name' => $this->name,
            'supervisor' => $this->supervisor,
            'phone' => $this->phone,
            'active' => $this->active,
            'user' => [
                'name' => $this->user->name
            ]
        ];
    }
}
