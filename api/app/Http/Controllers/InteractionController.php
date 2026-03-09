<?php

namespace App\Http\Controllers;

use App\Events\InteractionRemoved;
use App\Events\NewInteractionEvent;
use App\Http\Resources\PostResource;
use App\Models\Interaction;
use App\Models\Post;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InteractionController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly NotificationService $notificationService
    ) {}

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

            event(new InteractionRemoved(
                $user->id,
                $request->interactable_id,
                $request->interactable_type,
                $request->type
            ));

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

        // Broadcast to the resource owner and performer
        event(new NewInteractionEvent($interaction));

        $ownerId = $resource->user_id;

        // Persist notification for likes (not bookmarks)
        if ($request->type === 'like' && $ownerId) {
            $notifiableType = $request->interactable_type === 'post'
                ? \App\Models\Post::class
                : \App\Models\Comment::class;

            $this->notificationService->create(
                $ownerId,
                $user->id,
                'like',
                $notifiableType,
                $request->interactable_id,
                $user->name . ' ha dado like a tu ' . $request->interactable_type
            );
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

    /**
     * GET /api/bookmarks
     * List the authenticated user's bookmarked posts.
     * Center posts are only shown if the user belongs to that center.
     */
    public function bookmarks(Request $request): JsonResponse
    {
        $user = $request->user();

        $postIds = Interaction::where('user_id', $user->id)
            ->where('interactable_type', Post::class)
            ->where('type', 'bookmark')
            ->orderByDesc('created_at')
            ->pluck('interactable_id')
            ->toArray();

        if (empty($postIds)) {
            return response()->json([
                'success' => true,
                'message' => 'Bookmarked posts retrieved successfully',
                'data'    => [],
                'meta'    => [
                    'current_page' => 1,
                    'last_page'    => 1,
                    'per_page'     => 15,
                    'total'        => 0,
                ],
            ]);
        }

        // Build query with center visibility filter:
        // Only show center posts if the user belongs to the same center
        $postsQuery = Post::whereIn('id', $postIds)
            ->with(['user', 'center', 'tags'])
            ->withCount(['likedByUsers', 'comments', 'bookmarkedByUsers', 'reposts'])
            ->where(function ($query) use ($user) {
                $query->whereNull('center_id'); // Global posts are always visible
                if ($user->center_id) {
                    $query->orWhere('center_id', $user->center_id); // User's own center posts
                }
            })
            ->orderByRaw('FIELD(id, ' . implode(',', $postIds) . ')');

        $posts = $postsQuery->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Bookmarked posts retrieved successfully',
            'data'    => PostResource::collection($posts),
            'meta'    => [
                'current_page' => $posts->currentPage(),
                'last_page'    => $posts->lastPage(),
                'per_page'     => $posts->perPage(),
                'total'        => $posts->total(),
            ],
        ]);
    }

    /**
     * GET /api/liked
     * List the authenticated user's liked posts.
     * Center posts are only shown if the user belongs to that center.
     */
    public function liked(Request $request): JsonResponse
    {
        $user = $request->user();

        $postIds = Interaction::where('user_id', $user->id)
            ->where('interactable_type', Post::class)
            ->where('type', 'like')
            ->orderByDesc('created_at')
            ->pluck('interactable_id')
            ->toArray();

        if (empty($postIds)) {
            return response()->json([
                'success' => true,
                'message' => 'Liked posts retrieved successfully',
                'data'    => [],
                'meta'    => [
                    'current_page' => 1,
                    'last_page'    => 1,
                    'per_page'     => 15,
                    'total'        => 0,
                ],
            ]);
        }

        // Build query with center visibility filter:
        // Only show center posts if the user belongs to the same center
        $postsQuery = Post::whereIn('id', $postIds)
            ->with(['user', 'center', 'tags'])
            ->withCount(['likedByUsers', 'comments', 'bookmarkedByUsers', 'reposts'])
            ->where(function ($query) use ($user) {
                $query->whereNull('center_id'); // Global posts are always visible
                if ($user->center_id) {
                    $query->orWhere('center_id', $user->center_id); // User's own center posts
                }
            })
            ->orderByRaw('FIELD(id, ' . implode(',', $postIds) . ')');

        $posts = $postsQuery->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Liked posts retrieved successfully',
            'data'    => PostResource::collection($posts),
            'meta'    => [
                'current_page' => $posts->currentPage(),
                'last_page'    => $posts->lastPage(),
                'per_page'     => $posts->perPage(),
                'total'        => $posts->total(),
            ],
        ]);
    }
}
