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

        // Check if there is already a relationship (pending or accepted)
        $existingFollow = $authUser->following()->where('followed_id', $user->id)->first();

        if ($existingFollow) {
            $authUser->following()->detach($user->id);

            // Broadcast real-time profile update for both users
            broadcast(new ProfileUpdatedEvent($user));
            broadcast(new ProfileUpdatedEvent($authUser));

            return $this->success([
                'following' => false,
                'status' => null,
                'followers_count' => $user->followers()->where('status', 'accepted')->count(),
            ], 'Unfollowed or request cancelled successfully');
        }

        // Determine status based on target user's privacy
        $status = $user->is_private ? 'pending' : 'accepted';

        $authUser->following()->attach($user->id, ['status' => $status]);

        // Notify the followed user
        if ($status === 'accepted') {
            $this->notificationService->create(
                $user->id,
                $authUser->id,
                'follow',
                User::class,
                $authUser->id,
                $authUser->name . ' ha comenzado a seguirte'
            );
        } else {
            $this->notificationService->create(
                $user->id,
                $authUser->id,
                'follow_request',
                User::class,
                $authUser->id,
                $authUser->name . ' quiere seguirte (perfil privado)'
            );
        }

        // Broadcast real-time profile update for both users
        broadcast(new ProfileUpdatedEvent($user));
        broadcast(new ProfileUpdatedEvent($authUser));

        return $this->success([
            'following' => $status === 'accepted',
            'status' => $status,
            'followers_count' => $user->followers()->where('status', 'accepted')->count(),
        ], $status === 'accepted' ? 'Followed successfully' : 'Follow request sent', 201);
    }

    /**
     * GET /api/follow-requests
     * List pending follow requests for the auth user.
     */
    public function pendingRequests(Request $request): JsonResponse
    {
        $requests = $request->user()->followers()
            ->where('status', 'pending')
            ->select('users.id', 'name', 'username', 'avatar', 'bio')
            ->get();

        return $this->success($requests);
    }

    /**
     * POST /api/follow-requests/{follower}/accept
     * Accept a pending follow request.
     */
    public function acceptRequest(Request $request, User $follower): JsonResponse
    {
        $authUser = $request->user();

        $follow = $authUser->followers()->where('follower_id', $follower->id)->first();

        if (!$follow || $follow->pivot->status !== 'pending') {
            return $this->error('No pending follow request found from this user.', 404);
        }

        $authUser->followers()->updateExistingPivot($follower->id, ['status' => 'accepted']);

        // Notify the follower that their request was accepted
        $this->notificationService->create(
            $follower->id,
            $authUser->id,
            'follow_accept',
            User::class,
            $authUser->id,
            $authUser->name . ' ha aceptado tu solicitud de seguimiento'
        );

        // Broadcast real-time profile update for both users
        broadcast(new ProfileUpdatedEvent($follower));
        broadcast(new ProfileUpdatedEvent($authUser));

        return $this->success(null, 'Follow request accepted successfully');
    }

    /**
     * POST /api/follow-requests/{follower}/reject
     * Reject/Delete a pending follow request.
     */
    public function rejectRequest(Request $request, User $follower): JsonResponse
    {
        $authUser = $request->user();

        $follow = $authUser->followers()->where('follower_id', $follower->id)->first();

        if (!$follow || $follow->pivot->status !== 'pending') {
            return $this->error('No pending follow request found from this user.', 404);
        }

        $authUser->followers()->detach($follower->id);

        return $this->success(null, 'Follow request rejected successfully');
    }

    /**
     * GET /api/users/{user}/followers
     * List followers of a user.
     */
    public function followers(Request $request, User $user): JsonResponse
    {
        $followers = $user->followers()
            ->where('status', 'accepted')
            ->where('role', '!=', 'admin')
            ->select('users.id', 'name', 'username', 'avatar', 'bio', 'role')
            ->paginate($request->input('per_page', 20));

        // Add is_following flag for auth user
        $authUser = auth('sanctum')->user();
        $followingIds = $authUser
            ? $authUser->following()->where('status', 'accepted')->pluck('followed_id')->toArray()
            : [];
        
        $pendingIds = $authUser
            ? $authUser->following()->where('status', 'pending')->pluck('followed_id')->toArray()
            : [];

        $followers->getCollection()->transform(function ($follower) use ($followingIds, $pendingIds, $authUser) {
            $follower->is_following = in_array($follower->id, $followingIds);
            $follower->is_pending = in_array($follower->id, $pendingIds);
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
            ->where('status', 'accepted')
            ->where('role', '!=', 'admin')
            ->select('users.id', 'name', 'username', 'avatar', 'bio', 'role')
            ->paginate($request->input('per_page', 20));

        // Add is_following flag for auth user
        $authUser = auth('sanctum')->user();
        $followingIds = $authUser
            ? $authUser->following()->where('status', 'accepted')->pluck('followed_id')->toArray()
            : [];
        
        $pendingIds = $authUser
            ? $authUser->following()->where('status', 'pending')->pluck('followed_id')->toArray()
            : [];

        $following->getCollection()->transform(function ($followed) use ($followingIds, $pendingIds, $authUser) {
            $followed->is_following = in_array($followed->id, $followingIds);
            $followed->is_pending = in_array($followed->id, $pendingIds);
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

        $followTo = $authUser->following()->where('followed_id', $user->id)->first();
        $followFrom = $authUser->followers()->where('follower_id', $user->id)->first();

        return $this->success([
            'following'        => $followTo && $followTo->pivot->status === 'accepted',
            'is_pending'       => $followTo && $followTo->pivot->status === 'pending',
            'followed_by'      => $followFrom && $followFrom->pivot->status === 'accepted',
            'followers_count'  => $user->followers()->where('status', 'accepted')->count(),
            'following_count'  => $user->following()->where('status', 'accepted')->count(),
        ]);
    }
}
