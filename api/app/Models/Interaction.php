<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Interaction extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'interactable_id',
        'interactable_type',
        'type',
    ];

    /* ------------------------------------------------------------------ */
    /*  Relationships                                                      */
    /* ------------------------------------------------------------------ */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The resource being interacted with (Post, Comment, etc.)
     */
    public function interactable(): MorphTo
    {
        return $this->morphTo();
    }
}
