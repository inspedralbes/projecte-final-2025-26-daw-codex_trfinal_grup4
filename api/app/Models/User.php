<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'center_id',
        'name',
        'username',
        'email',
        'password',
        'password_set_at',
        'role',
        'avatar',
        'banner',
        'bio',
        'is_blocked',
        'center_blocked',
        'ban_status',
        'ban_reason',
        'ban_expires_at',
        'ai_moderation_strikes',
        'google_id',
        'auth_provider',
        'email_verified_at',
        'linkedin_url',
        'portfolio_url',
        'external_url',
        'center_prompt_dismissed',
        'is_private',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'email_verified_at' => 'datetime',
            'password_set_at' => 'datetime',
            'ban_expires_at' => 'datetime',
            'role' => UserRole::class,
            'is_blocked' => 'boolean',
            'center_blocked' => 'boolean',
            'ban_status' => 'string',
            'ai_moderation_strikes' => 'integer',
            'center_prompt_dismissed' => 'boolean',
            'is_private' => 'boolean',
        ];
    }

    /* ------------------------------------------------------------------ */
    /*  Helpers                                                            */
    /* ------------------------------------------------------------------ */

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isTeacher(): bool
    {
        return $this->role === UserRole::Teacher;
    }

    public function isStudent(): bool
    {
        return $this->role === UserRole::Student;
    }

    public function isTeacherOrAdmin(): bool
    {
        return $this->isTeacher() || $this->isAdmin();
    }

    /**
     * Check if the user has been blocked from their center by a teacher.
     */
    public function isCenterBlocked(): bool
    {
        return (bool) $this->center_blocked;
    }

    /**
     * Check if the user needs to set a password.
     * Google OAuth users have a random temp password until they set their own.
     */
    public function needsPassword(): bool
    {
        return $this->password_set_at === null;
    }

    public function getAvatarAttribute($value): ?string
    {
        if (!$value) {
            return null;
        }

        if (Str::startsWith($value, ['http://', 'https://'])) {
            return $value;
        }

        $baseUrl = rtrim(config('app.url'), '/');

        if (Str::startsWith($value, '/')) {
            return $baseUrl . $value;
        }

        return $baseUrl . '/' . $value;
    }

    /**
     * Send the email verification notification (custom).
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification());
    }

    /* ------------------------------------------------------------------ */
    /*  Relationships                                                      */
    /* ------------------------------------------------------------------ */

    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'followed_id', 'follower_id')->withPivot('status')->withTimestamps();
    }

    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'followed_id')->withPivot('status')->withTimestamps();
    }

    public function likedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'likes');
    }

    public function bookmarkedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'bookmarks');
    }

    public function followedTags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'tag_user')->withPivot('notify');
    }

    public function createdCenters(): HasMany
    {
        return $this->hasMany(Center::class, 'creator_id');
    }

    public function centerRequests(): HasMany
    {
        return $this->hasMany(CenterRequest::class);
    }
}
