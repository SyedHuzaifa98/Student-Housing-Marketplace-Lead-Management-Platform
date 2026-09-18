<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class University extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'city',
        'address',
        'latitude',
        'longitude',
        'logo_url',
    ];

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }
}

