<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Str;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'landlord_id',
        'university_id',
        'title',
        'slug',
        'description',
        'price_per_month',
        'deposit_amount',
        'room_type',
        'distance_km',
        'address',
        'city',
        'latitude',
        'longitude',
        'bills_included',
        'available_from',
        'status',
        'visibility',
        'is_featured',
    ];

    protected $casts = [
        'price_per_month' => 'float',
        'deposit_amount' => 'float',
        'distance_km' => 'float',
        'latitude' => 'float',
        'longitude' => 'float',
        'bills_included' => 'boolean',
        'is_featured' => 'boolean',
        'available_from' => 'date',
    ];

    protected $appends = [
        'updated_recently_badge',
    ];

    public function getUpdatedRecentlyBadgeAttribute(): string
    {
        $updated = $this->updated_at ?? $this->created_at ?? now();
        $diffHours = now()->diffInHours($updated);

        if ($diffHours < 24) {
            return 'Listing updated today';
        }

        $diffDays = now()->diffInDays($updated);
        if ($diffDays <= 7) {
            return 'Listing updated recently';
        } elseif ($diffDays <= 30) {
            return 'Listing updated this month';
        }

        return 'Listing updated recently';
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($property) {
            if (empty($property->slug)) {
                $property->slug = Str::slug($property->title) . '-' . Str::random(6);
            }
        });
    }

    public function landlord(): BelongsTo
    {
        return $this->belongsTo(User::class, 'landlord_id');
    }

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class)->orderBy('is_primary', 'desc')->orderBy('sort_order');
    }

    public function primaryImage()
    {
        return $this->hasOne(PropertyImage::class)->ofMany([
            'is_primary' => 'max',
            'id' => 'min',
        ]);
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class, 'property_amenity');
    }

    public function files(): MorphMany
    {
        return $this->morphMany(File::class, 'fileable');
    }

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }

    public function savedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'saved_properties')->withTimestamps();
    }
}

