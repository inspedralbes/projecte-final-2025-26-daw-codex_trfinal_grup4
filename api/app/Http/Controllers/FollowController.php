<?php

namespace App\Http\Controllers;

use App\Events\ProfileUpdatedEvent;
use App\Models\User;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly NotificationService $notificationService
    ) {}

    /**
     * POST /api/users/{user}/follow
     * Toggle follow/unfollow a user.
     */
    public function toggle(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();

        // Cannot follow yourself
        if ($authUser->id === $user->id) {
            return $this->error('You cannot follow yourself.', 422);
        }

        // Check if already following → toggle
        if ($authUser->following()->where('followed_id', $user->id)->exists()) {
            $authUser->following()->detach($user->id);

            // Broadcast real-time profile update for both users
            broadcast(new ProfileUpdatedEvent($user));
            broadcast(new ProfileUpdatedEvent($authUser));

            return $this->success([
                'following' => false,
                'followers_count' => $user->followers()->count(),
            ], 'Unfollowed successfully');
        }

        $authUser->following()->attach($user->id);

        // Notify the followed user
        $this->notificationService->create(
            $user->id,
            $authUser->id,
            'follow',
            User::class,
            $authUser->id,
            $authUser->name . ' ha comenzado a seguirte'
        );

        // Broadcast real-time profile update for both users
        broadcast(new ProfileUpdatedEvent($user));
        broadcast(new ProfileUpdatedEvent($authUser));

        return $this->success([
            'following' => true,
            'followers_count' => $user->followers()->count(),
        ], 'Followed successfully', 201);
    }

    /**
     * GET /api/users/{user}/followers
     * List followers of a user.
     */
    public function followers(Request $request, User $user): JsonResponse
    {
        $followers = $user->followers()
            ->select('users.id', 'name', 'username', 'avatar', 'bio', 'role')
            ->paginate($request->input('per_page', 20));

        // Add is_following flag for auth user
        $authUser = auth('sanctum')->user();
        $followingIds = $authUser
            ? $authUser->following()->pluck('followed_id')->toArray()
            : [];

        $followers->getCollection()->transform(function ($follower) use ($followingIds, $authUser) {
            $follower->is_following = in_array($follower->id, $followingIds);
            $follower->is_self = $authUser && $authUser->id === $follower->id;
            return $follower;
        });

        return $this->success($followers);
    }

    /**
     * GET /api/users/{user}/following
     * List users that a user is following.
     */
    public function following(Request $request, User $user): JsonResponse
    {
        $following = $user->following()
            ->select('users.id', 'name', 'username', 'avatar', 'bio', 'role')
            ->paginate($request->input('per_page', 20));

        // Add is_following flag for auth user
        $authUser = auth('sanctum')->user();
        $followingIds = $authUser
            ? $authUser->following()->pluck('followed_id')->toArray()
            : [];

        $following->getCollection()->transform(function ($followed) use ($followingIds, $authUser) {
            $followed->is_following = in_array($followed->id, $followingIds);
            $followed->is_self = $authUser && $authUser->id === $followed->id;
            return $followed;
        });

        return $this->success($following);
    }

    /**
     * GET /api/users/{user}/follow-status
     * Check if auth user follows the given user.
     */
    public function status(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();

        return $this->success([
            'following'        => $authUser->following()->where('followed_id', $user->id)->exists(),
            'followed_by'      => $authUser->followers()->where('follower_id', $user->id)->exists(),
            'followers_count'  => $user->followers()->count(),
            'following_count'  => $user->following()->count(),
        ]);
    }
}
