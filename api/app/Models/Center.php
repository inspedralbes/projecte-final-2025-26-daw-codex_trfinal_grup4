<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Center extends Model
{
    protected $fillable = [
        'name',
        'domain',
        'city',
        'logo',
        'website',
        'description',
        'status',
        'is_private',
        'justificante',
        'creator_id',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'status' => 'string',
            'is_private' => 'boolean',
        ];
    }

    /* ------------------------------------------------------------------ */
    /*  Scopes                                                             */
    /* ------------------------------------------------------------------ */

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /* ------------------------------------------------------------------ */
    /*  Relationships                                                      */
    /* ------------------------------------------------------------------ */

    /**
     * The teacher who requested/created this center.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function teachers(): HasMany
    {
        return $this->hasMany(User::class)->where('role', 'teacher');
    }

    public function students(): HasMany
    {
        return $this->hasMany(User::class)->where('role', 'student');
    }
}
