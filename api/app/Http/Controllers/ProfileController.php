<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Comment;
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
            'banner'           => $user->banner,
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
            ->with(['user', 'center', 'tags', 'originalPost.user'])
            ->withCount(['likedByUsers', 'comments', 'bookmarkedByUsers', 'reposts'])
            ->latest()
            ->paginate(request()->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'User posts retrieved successfully',
            'data'    => \App\Http\Resources\PostResource::collection($posts),
            'meta'    => [
                'current_page' => $posts->currentPage(),
                'last_page'    => $posts->lastPage(),
                'per_page'     => $posts->perPage(),
                'total'        => $posts->total(),
            ],
        ]);
    }

    /**
     * GET /api/profile/{username}/replies
     * Paginated comments (replies) by user, formatted as post-like objects.
     */
    public function replies(string $username): JsonResponse
    {
        $user = User::where('username', $username)->first();

        if (!$user) {
            return $this->error('User not found', 404);
        }

        $comments = $user->comments()
            ->with([
                'user:id,name,username,avatar',
                'post:id,content,type,user_id',
                'post.user:id,name,username,avatar',
                'parent:id,user_id,content',
                'parent.user:id,name,username',
            ])
            ->latest()
            ->paginate(15);

        // Transform comments to look like posts with reply context
        $transformed = $comments->through(function ($comment) {
            return [
                'id'             => $comment->id,
                'type'           => 'reply', // Mark as reply type
                'content'        => $comment->content,
                'is_solution'    => $comment->is_solution,
                'created_at'     => $comment->created_at,
                'user'           => $comment->user,
                // Reference to the original post being replied to
                'reply_to_post'  => $comment->post ? [
                    'id'       => $comment->post->id,
                    'content'  => mb_substr($comment->post->content, 0, 100),
                    'type'     => $comment->post->type,
                    'user'     => $comment->post->user,
                ] : null,
                // Reference to parent comment (for nested replies)
                'reply_to_comment' => $comment->parent ? [
                    'id'   => $comment->parent->id,
                    'user' => $comment->parent->user,
                ] : null,
                // Mimic post structure for compatibility
                'likes_count'     => 0,
                'comments_count'  => 0,
                'bookmarks_count' => 0,
                'reposts_count'   => 0,
                'tags'            => [],
            ];
        });

        return $this->success($transformed);
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
            'username'      => 'sometimes|string|max:50|unique:users,username,' . $user->id . '|regex:/^[a-zA-Z0-9_]+$/',
            'bio'           => 'sometimes|nullable|string|max:1000',
            'avatar'        => 'sometimes|nullable|image|max:5120', 
            'banner'        => 'sometimes|nullable|image|max:8192', // 8 MB max for banner
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

        // Handle banner file upload
        if ($request->hasFile('banner')) {
            // Delete old banner if it was a locally stored file
            if ($user->banner && str_contains($user->banner, '/storage/banners/')) {
                $oldPath = str_replace('/storage/', '', parse_url($user->banner, PHP_URL_PATH));
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }

            // Store new banner in public/banners
            $path = $request->file('banner')->store('banners', 'public');

            // Build the full public URL
            $validated['banner'] = url('storage/' . $path);
        } else {
            unset($validated['banner']);
        }

        $user->update($validated);
        $user->refresh();

        // Broadcast profile update for real-time synchronization
        broadcast(new \App\Events\ProfileUpdatedEvent($user));

        return $this->success([
            'id'            => $user->id,
            'name'          => $user->name,
            'username'      => $user->username,
            'role'          => $user->role,
            'avatar'        => $user->avatar,
            'banner'        => $user->banner,
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
