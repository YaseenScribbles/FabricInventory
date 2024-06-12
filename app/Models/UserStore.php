<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserStore extends Model
{
    use HasFactory;

    protected $fillable  = [
        'user_id',
        'store_id'
    ];

    public $timestamps = false;

    public function store()
    {
        return $this->hasMany(Store::class,'store_id');
    }

    public function user()
    {
        return $this->hasMany(User::class,'user_id');
    }
}
