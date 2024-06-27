<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'receipt_id',
        'store_id',
        'contact_id',
        'remarks',
        'user_id',
    ];

    public function delivery_items()
    {
        return $this->hasMany(DeliveryItem::class, 'delivery_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
