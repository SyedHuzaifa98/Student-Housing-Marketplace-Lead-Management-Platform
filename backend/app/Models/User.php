<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'ban_reason',
        'banned_at',
        'phone',
        'avatar',
        'company_name',
        'last_seen_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'banned_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected $appends = [
        'last_seen_badge',
        'is_active_today',
        'response_time_badge',
    ];

    public function getLastSeenBadgeAttribute(): string
    {
        if (! $this->last_seen_at) {
            return 'Active today';
        }

        $diffHours = now()->diffInHours($this->last_seen_at);

        if ($diffHours < 12) {
            return 'Active today';
        } elseif ($diffHours < 24) {
            return 'Active within 24 hours';
        } elseif ($diffHours < 72) {
            return 'Active this week';
        } else {
            return 'Active recently';
        }
    }

    public function getIsActiveTodayAttribute(): bool
    {
        if (! $this->last_seen_at) {
            return true;
        }

        return now()->diffInHours($this->last_seen_at) < 24;
    }

    public function getResponseTimeBadgeAttribute(): string
    {
        return 'Typically replies within 2 hours';
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class, 'landlord_id');
    }

    public function receivedInquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class, 'landlord_id');
    }

    public function sentInquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class, 'student_id');
    }

    public function savedProperties(): BelongsToMany
    {
        return $this->belongsToMany(Property::class, 'saved_properties')->withTimestamps();
    }

    public function isLandlord(): bool
    {
        return $this->role === 'landlord';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }
}
