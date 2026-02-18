<?php

namespace App\Services;

use App\Models\Interaction;
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReputationService
{
    /**
     * Reputation tiers and their thresholds.
     */
    private const BADGES = [
        ['name' => 'Newcomer',    'icon' => '🌱', 'min' => 0],
        ['name' => 'Contributor', 'icon' => '⭐', 'min' => 5],
        ['name' => 'Rising Star', 'icon' => '🌟', 'min' => 25],
        ['name' => 'Expert',      'icon' => '💎', 'min' => 100],
        ['name' => 'Master',      'icon' => '👑', 'min' => 500],
        ['name' => 'Legend',      'icon' => '🏆', 'min' => 1000],
    ];

    /**
     * Calculate reputation score based on likes received on code posts.
     * Formula: each like on a post with code_snippet counts as 2 points,
     * each like on a regular post counts as 1 point,
     * each accepted solution (is_solution comment) counts as 5 points.
     */
    public function calculateReputation(User $user): int
    {
        // Likes on code posts (2 pts each)
        $codeLikes = Interaction::where('type', 'like')
            ->where('interactable_type', Post::class)
            ->whereIn('interactable_id', function ($query) use ($user) {
                $query->select('id')
                    ->from('posts')
                    ->where('user_id', $user->id)
                    ->whereNotNull('code_snippet');
            })
            ->count();

        // Likes on regular posts (1 pt each)
        $regularLikes = Interaction::where('type', 'like')
            ->where('interactable_type', Post::class)
            ->whereIn('interactable_id', function ($query) use ($user) {
                $query->select('id')
                    ->from('posts')
                    ->where('user_id', $user->id)
                    ->whereNull('code_snippet');
            })
            ->count();

        // Accepted solutions (5 pts each)
        $solutions = $user->comments()->where('is_solution', true)->count();

        return ($codeLikes * 2) + ($regularLikes * 1) + ($solutions * 5);
    }

    /**
     * Get the current badge based on reputation score.
     */
    public function getBadge(int $reputation): array
    {
        $badge = self::BADGES[0];

        foreach (self::BADGES as $tier) {
            if ($reputation >= $tier['min']) {
                $badge = $tier;
            }
        }

        return $badge;
    }

    /**
     * Get all badges with unlocked status.
     */
    public function getAllBadges(int $reputation): array
    {
        return array_map(function ($badge) use ($reputation) {
            return [
                'name'     => $badge['name'],
                'icon'     => $badge['icon'],
                'min'      => $badge['min'],
                'unlocked' => $reputation >= $badge['min'],
            ];
        }, self::BADGES);
    }

    /**
     * Get the user's most used tags (top N).
     */
    public function getTopTags(User $user, int $limit = 5): array
    {
        return DB::table('post_tag')
            ->join('posts', 'posts.id', '=', 'post_tag.post_id')
            ->join('tags', 'tags.id', '=', 'post_tag.tag_id')
            ->where('posts.user_id', $user->id)
            ->whereNull('posts.deleted_at')
            ->select('tags.id', 'tags.name', 'tags.slug', 'tags.color', DB::raw('COUNT(*) as usage_count'))
            ->groupBy('tags.id', 'tags.name', 'tags.slug', 'tags.color')
            ->orderByDesc('usage_count')
            ->limit($limit)
            ->get()
            ->toArray();
    }
}
