<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ReputationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly ReputationService $reputationService
    ) {}

    /**
     * GET /api/profile/{username}
     * Public profile with aggregated stats, reputation, top tags and badges.
     */
    public function show(string $username): JsonResponse
    {
        $user = User::where('username', $username)
            ->withCount(['posts', 'comments', 'followers', 'following'])
            ->with('center:id,name,domain,logo')
            ->first();

        if (!$user) {
            return $this->error('User not found', 404);
        }

        // Count total likes received on user's posts
        $totalLikesReceived = $user->posts()->withCount('likedByUsers')->get()->sum('liked_by_users_count');

        // Check if auth user is following this profile
        $authUser = auth('sanctum')->user();
        $isFollowing = $authUser ? $authUser->following()->where('followed_id', $user->id)->exists() : false;

        // Reputation system
        $reputation = $this->reputationService->calculateReputation($user);
        $currentBadge = $this->reputationService->getBadge($reputation);
        $allBadges = $this->reputationService->getAllBadges($reputation);

        // Top used tags
        $topTags = $this->reputationService->getTopTags($user);

        return $this->success([
            'id'               => $user->id,
            'name'             => $user->name,
            'username'         => $user->username,
            'role'             => $user->role,
            'avatar'           => $user->avatar,
            'bio'              => $user->bio,
            'linkedin_url'     => $user->linkedin_url,
            'portfolio_url'    => $user->portfolio_url,
            'external_url'     => $user->external_url,
            'center'           => $user->center,
            'is_following'     => $isFollowing,
            'created_at'       => $user->created_at,
            'stats'            => [
                'posts_count'          => $user->posts_count,
                'comments_count'       => $user->comments_count,
                'followers_count'      => $user->followers_count,
                'following_count'      => $user->following_count,
                'total_likes_received' => $totalLikesReceived,
            ],
            'reputation'       => [
                'score'         => $reputation,
                'current_badge' => $currentBadge,
                'all_badges'    => $allBadges,
            ],
            'top_tags'         => $topTags,
        ]);
    }

    /**
     * GET /api/profile/{username}/posts
     * Paginated posts by user.
     */
    public function posts(string $username): JsonResponse
    {
        $user = User::where('username', $username)->first();

        if (!$user) {
            return $this->error('User not found', 404);
        }

        $posts = $user->posts()
            ->with(['user:id,name,username,avatar', 'center:id,name', 'tags:id,name,slug,color'])
            ->withCount(['likedByUsers as likes_count', 'comments', 'bookmarkedByUsers as bookmarks_count'])
            ->latest()
            ->paginate(15);

        return $this->success($posts);
    }

    /**
     * PUT /api/profile
     * Update authenticated user's profile.
     * Accepts both JSON (text fields only) and multipart/form-data (with avatar file).
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'          => 'sometimes|string|max:255',
            'bio'           => 'sometimes|nullable|string|max:1000',
            'avatar'        => 'sometimes|nullable|image|max:5120', // 5 MB max when file
            'linkedin_url'  => 'sometimes|nullable|url|max:500',
            'portfolio_url' => 'sometimes|nullable|url|max:500',
            'external_url'  => 'sometimes|nullable|url|max:500',
        ]);

        // Handle avatar file upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if it was a locally stored file
            if ($user->avatar && str_contains($user->avatar, '/storage/avatars/')) {
                $oldPath = str_replace('/storage/', '', parse_url($user->avatar, PHP_URL_PATH));
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }

            // Store new avatar in public/avatars
            $path = $request->file('avatar')->store('avatars', 'public');

            // Build the full public URL
            $validated['avatar'] = url('storage/' . $path);
        } else {
            // If avatar is not a file, remove it from validated to avoid overwriting with null
            unset($validated['avatar']);
        }

        $user->update($validated);
        $user->refresh();

        return $this->success([
            'id'            => $user->id,
            'name'          => $user->name,
            'username'      => $user->username,
            'role'          => $user->role,
            'avatar'        => $user->avatar,
            'bio'           => $user->bio,
            'linkedin_url'  => $user->linkedin_url,
            'portfolio_url' => $user->portfolio_url,
            'external_url'  => $user->external_url,
        ], 'Profile updated successfully');
    }


    /**
     * GET /api/leaderboard
     * Top contributors ranked by reputation.
     */
    public function leaderboard(Request $request): JsonResponse
    {
        $limit = min($request->input('limit', 10), 50);

        $users = User::withCount(['posts', 'comments', 'followers'])
            ->with('center:id,name')
            ->orderByDesc('posts_count')
            ->take($limit)
            ->get();

        $leaderboard = $users->map(function ($user, $index) {
            $reputation = $this->reputationService->calculateReputation($user);
            $badge = $this->reputationService->getBadge($reputation);

            return [
                'rank'       => $index + 1,
                'id'         => $user->id,
                'name'       => $user->name,
                'username'   => $user->username,
                'avatar'     => $user->avatar,
                'role'       => $user->role,
                'center'     => $user->center?->name,
                'score'      => $reputation,
                'badge'      => $badge['emoji'] ?? '🔰',
                'badge_name' => $badge['name'] ?? 'Novato',
                'stats'      => [
                    'posts'     => $user->posts_count,
                    'comments'  => $user->comments_count,
                    'followers' => $user->followers_count,
                ],
            ];
        })->sortByDesc('score')->values();

        // Re-rank after sorting by score
        $leaderboard = $leaderboard->map(function ($user, $index) {
            $user['rank'] = $index + 1;
            return $user;
        });

        return $this->success($leaderboard, 'Leaderboard retrieved successfully');
    }
}
