<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReceiptItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'receipt_id',
        'color_id',
        'dia',
        'rolls',
        'weight',
        's_no'
    ];

    public $timestamps = false;

    public function receipt()
    {
        return $this->belongsTo(Receipt::class,'receipt_id');
    }

}
