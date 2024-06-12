<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'lot_no',
        'brand',
        'company_id',
        'store_id',
        'contact_id',
        'fabric_id',
        'remarks',
        'user_id'
    ];

    public function receipt_items()
    {
        return $this->hasMany(ReceiptItem::class,'receipt_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
