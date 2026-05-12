<?php

namespace App\Console\Commands;

use App\Models\Post;
use App\Models\TrendingPost;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ComputeTrendingPosts extends Command
{
    protected $signature = 'trending:compute {--window= : Window in hours} {--limit= : Limit of posts}';
    protected $description = 'Compute trending posts for the configured time window.';

    public function handle(): int
    {
        $windowHours = (int) ($this->option('window') ?: config('trending.window_hours', 24));
        $limit = (int) ($this->option('limit') ?: config('trending.limit', 10));
        $weights = config('trending.weights', [
            'like' => 1,
            'comment' => 2,
            'repost' => 3,
            'bookmark' => 1.5,
        ]);

        $windowEnd = now();
        $windowStart = $windowEnd->copy()->subHours($windowHours);

        $posts = Post::global()
            ->where('created_at', '>=', $windowStart)
            ->withCount(['likedByUsers', 'comments', 'reposts', 'bookmarkedByUsers'])
            ->get();

        $ranked = $posts->map(function (Post $post) use ($weights) {
            $score =
                ($post->liked_by_users_count ?? 0) * ($weights['like'] ?? 1) +
                ($post->comments_count ?? 0) * ($weights['comment'] ?? 2) +
                ($post->reposts_count ?? 0) * ($weights['repost'] ?? 3) +
                ($post->bookmarked_by_users_count ?? 0) * ($weights['bookmark'] ?? 1.5);

            return [
                'post' => $post,
                'score' => round($score, 4),
            ];
        })->sortByDesc('score')->values()->take($limit);

        DB::transaction(function () use ($ranked, $windowStart, $windowEnd) {
            $computedAt = now();
            TrendingPost::where('computed_at', '<', $computedAt->copy()->subMinutes(1))
                ->where('window_end', '<', $windowEnd)
                ->delete();

            TrendingPost::where('window_start', $windowStart)
                ->where('window_end', $windowEnd)
                ->delete();

            foreach ($ranked as $index => $item) {
                TrendingPost::create([
                    'post_id' => $item['post']->id,
                    'score' => $item['score'],
                    'rank' => $index + 1,
                    'window_start' => $windowStart,
                    'window_end' => $windowEnd,
                    'computed_at' => $computedAt,
                ]);
            }
        });

        $this->info('Trending posts computed successfully.');

        return self::SUCCESS;
    }
}
