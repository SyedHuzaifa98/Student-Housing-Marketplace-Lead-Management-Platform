<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'fileable_type',
        'fileable_id',
        'file_name',
        'file_path',
        'mime_type',
        'file_type',
        'file_size',
        'metadata',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'metadata' => 'array',
    ];

    protected $appends = [
        'url',
    ];

    /**
     * Get parent fileable model (User, Property, etc.).
     */
    public function fileable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get accessible web URL for the file.
     */
    public function getUrlAttribute(): string
    {
        if (empty($this->file_path)) {
            return '';
        }

        // Returns web-accessible URL via public storage
        return Storage::disk('public')->url($this->file_path);
    }

    /**
     * Scope query to a specific semantic file type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('file_type', $type);
    }

    /**
     * Read file content as Base64 string (compatible with MERN pattern).
     */
    public function toBase64(): ?string
    {
        if (! Storage::disk('public')->exists($this->file_path)) {
            return null;
        }

        $content = Storage::disk('public')->get($this->file_path);
        return base64_encode($content);
    }
}
