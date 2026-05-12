<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrendingPost extends Model
{
    protected $fillable = [
        'post_id',
        'score',
        'rank',
        'window_start',
        'window_end',
        'computed_at',
    ];

    protected $casts = [
        'score' => 'float',
        'window_start' => 'datetime',
        'window_end' => 'datetime',
        'computed_at' => 'datetime',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
