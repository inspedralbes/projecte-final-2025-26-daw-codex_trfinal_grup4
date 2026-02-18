<?php

namespace App\Http\Controllers;

use App\Events\NewInteractionEvent;
use App\Models\Interaction;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InteractionController extends Controller
{
    use ApiResponse;

    /**
     * POST /api/interactions
     * Toggle a like or bookmark on a resource (post or comment).
     * If the interaction already exists, it is removed (toggle off).
     */
    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'interactable_type' => 'required|in:post,comment',
            'interactable_id'   => 'required|integer',
            'type'              => 'required|in:like,bookmark',
        ]);

        $user = $request->user();

        // Map short names to model classes
        $typeMap = [
            'post'    => \App\Models\Post::class,
            'comment' => \App\Models\Comment::class,
        ];

        $morphClass = $typeMap[$request->interactable_type];

        // Verify the resource exists
        $resource = $morphClass::find($request->interactable_id);
        if (!$resource) {
            return $this->error('Resource not found', 404);
        }

        // Check if interaction already exists (toggle)
        $existing = Interaction::where('user_id', $user->id)
            ->where('interactable_type', $morphClass)
            ->where('interactable_id', $request->interactable_id)
            ->where('type', $request->type)
            ->first();

        if ($existing) {
            $existing->delete();
            return $this->success([
                'active' => false,
                'type'   => $request->type,
            ], ucfirst($request->type) . ' removed');
        }

        // Create new interaction
        $interaction = Interaction::create([
            'user_id'           => $user->id,
            'interactable_type' => $morphClass,
            'interactable_id'   => $request->interactable_id,
            'type'              => $request->type,
        ]);

        $interaction->load(['user', 'interactable']);

        // Broadcast to the resource owner (don't notify yourself)
        $ownerId = $resource->user_id ?? null;
        if ($ownerId && $ownerId !== $user->id) {
            event(new NewInteractionEvent($interaction));
        }

        return $this->success([
            'active' => true,
            'type'   => $request->type,
            'id'     => $interaction->id,
        ], ucfirst($request->type) . ' added', 201);
    }

    /**
     * GET /api/posts/{postId}/interactions
     * Get interaction counts and user's status for a post.
     */
    public function postStatus(Request $request, int $postId): JsonResponse
    {
        $likesCount = Interaction::where('interactable_type', \App\Models\Post::class)
            ->where('interactable_id', $postId)
            ->where('type', 'like')
            ->count();

        $bookmarksCount = Interaction::where('interactable_type', \App\Models\Post::class)
            ->where('interactable_id', $postId)
            ->where('type', 'bookmark')
            ->count();

        $userStatus = ['liked' => false, 'bookmarked' => false];

        $user = auth('sanctum')->user();
        if ($user) {
            $userStatus['liked'] = Interaction::where('user_id', $user->id)
                ->where('interactable_type', \App\Models\Post::class)
                ->where('interactable_id', $postId)
                ->where('type', 'like')
                ->exists();

            $userStatus['bookmarked'] = Interaction::where('user_id', $user->id)
                ->where('interactable_type', \App\Models\Post::class)
                ->where('interactable_id', $postId)
                ->where('type', 'bookmark')
                ->exists();
        }

        return $this->success([
            'likes_count'     => $likesCount,
            'bookmarks_count' => $bookmarksCount,
            'user_status'     => $userStatus,
        ]);
    }
}
