<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_id',
        'color_id',
        'dia',
        'rolls',
        'weight',
        's_no'
    ];

    public $timestamps = false;

    public function delivery()
    {
        return $this->belongsTo(Delivery::class);
    }
}
