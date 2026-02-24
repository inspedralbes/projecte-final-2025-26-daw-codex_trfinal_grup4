<?php

namespace App\Http\Controllers;

use App\Events\PostDeleted;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\Tag;
use App\Services\NotificationService;
use App\Services\SanitizationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly SanitizationService $sanitizer,
        private readonly NotificationService $notificationService
    ) {}

    /**
     * GET /api/posts
     * List all posts (global feed) with pagination.
     * Supports filters: ?tag=slug, ?type=question|news
     */
    public function index(Request $request): JsonResponse
    {
        $query = Post::global()
            ->with(['user', 'center', 'tags', 'originalPost.user'])
            ->withCount(['likedByUsers', 'comments', 'bookmarkedByUsers', 'reposts'])
            ->latest();

        // Optional tag filter
        if ($request->has('tag')) {
            $query->whereHas('tags', fn ($q) => $q->where('slug', $request->input('tag')));
        }

        // Optional type filter (questions only, etc.)
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        $posts = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Posts retrieved successfully',
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
     * GET /api/center/posts
     * List posts from the authenticated user's center (Walled Garden).
     * Uses CenterScope Global Scope for automatic filtering.
     */
    public function centerPosts(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->center_id) {
            return $this->error('You are not associated with any center', 403);
        }

        $query = Post::centerFiltered()
            ->with(['user', 'center', 'tags', 'originalPost.user'])
            ->withCount(['likedByUsers', 'comments', 'bookmarkedByUsers', 'reposts'])
            ->latest();

        // Optional tag filter
        if ($request->has('tag')) {
            $query->whereHas('tags', fn ($q) => $q->where('slug', $request->input('tag')));
        }

        $posts = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Center posts retrieved successfully',
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
     * GET /api/feed/following
     * Posts from users the authenticated user follows.
     */
    public function followingFeed(Request $request): JsonResponse
    {
        $user = $request->user();
        $followingIds = $user->following()->pluck('followed_id');

        if ($followingIds->isEmpty()) {
            return response()->json([
                'success' => true,
                'message' => 'You are not following anyone yet',
                'data'    => [],
                'meta'    => [
                    'current_page' => 1,
                    'last_page'    => 1,
                    'per_page'     => 15,
                    'total'        => 0,
                ],
            ]);
        }

        $query = Post::whereIn('user_id', $followingIds)
            ->where(function ($q) use ($user) {
                // Show global posts + posts from user's own center
                $q->whereNull('center_id');
                if ($user->center_id) {
                    $q->orWhere('center_id', $user->center_id);
                }
            })
            ->with(['user', 'center', 'tags', 'originalPost.user'])
            ->withCount(['likedByUsers', 'comments', 'bookmarkedByUsers', 'reposts'])
            ->latest();

        $posts = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Following feed retrieved successfully',
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
     * POST /api/posts
     * Create a new post. Authenticated user only.
     */
    public function store(StorePostRequest $request): JsonResponse
    {
        $post = Post::create([
            'user_id'       => $request->user()->id,
            'center_id'     => $request->user()->center_id, // null if global user
            'type'          => $request->input('type', 'news'),
            'content'       => $this->sanitizer->sanitizeHtml($request->input('content')),
            'code_snippet'  => $this->sanitizer->sanitizeCode($request->input('code_snippet')),
            'code_language' => $this->sanitizer->sanitizePlain($request->input('code_language')),
        ]);

        // Attach tags (create if they don't exist)
        if ($request->has('tags')) {
            $tagIds = collect($request->input('tags'))->map(function ($tagName) {
                return Tag::firstOrCreate(
                    ['slug' => Str::slug($tagName)],
                    ['name' => $tagName]
                )->id;
            });
            $post->tags()->sync($tagIds);
        }

        $post->load(['user', 'center', 'tags', 'originalPost.user']);
        $post->loadCount(['likedByUsers', 'comments', 'bookmarkedByUsers', 'reposts']);

        return $this->success(
            new PostResource($post),
            'Post created successfully',
            201
        );
    }

    /**
     * GET /api/posts/{post}
     * Show a single post with details.
     * Center posts are protected by the EnsureSameCenter middleware (applied in routes).
     */
    public function show(Post $post): JsonResponse
    {
        // If the post belongs to a center, verify the user has access
        if ($post->center_id !== null) {
            $user = auth('sanctum')->user();
            if (!$user || $user->center_id !== $post->center_id) {
                return $this->error('Access denied. This content belongs to a center.', 403);
            }
        }

        $post->load(['user', 'center', 'tags', 'comments.user', 'originalPost.user']);
        $post->loadCount(['likedByUsers', 'comments', 'bookmarkedByUsers', 'reposts']);

        return $this->success(new PostResource($post));
    }

    /**
     * DELETE /api/posts/{post}
     * Soft-delete a post. Only the author can delete.
     */
    public function destroy(Request $request, Post $post): JsonResponse
    {
        if ($request->user()->id !== $post->user_id) {
            return $this->error('Unauthorized', 403);
        }

        $post->delete();

        event(new PostDeleted($post->id, $post->user_id));

        return $this->success(null, 'Post deleted successfully');
    }

    /**
     * PUT /api/posts/{post}
     * Update a post. Only the author can edit.
     */
    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        if ($request->user()->id !== $post->user_id) {
            return $this->error('Unauthorized', 403);
        }

        $data = [];

        if ($request->has('content')) {
            $data['content'] = $this->sanitizer->sanitizeHtml($request->input('content'));
        }
        if ($request->has('code_snippet')) {
            $data['code_snippet'] = $this->sanitizer->sanitizeCode($request->input('code_snippet'));
        }
        if ($request->has('code_language')) {
            $data['code_language'] = $this->sanitizer->sanitizePlain($request->input('code_language'));
        }

        if (!empty($data)) {
            $post->update($data);
        }

        // Update tags if provided
        if ($request->has('tags')) {
            $tagIds = collect($request->input('tags'))->map(function ($tagName) {
                return Tag::firstOrCreate(
                    ['slug' => Str::slug($tagName)],
                    ['name' => $tagName]
                )->id;
            });
            $post->tags()->sync($tagIds);
        }

        $post->load(['user', 'center', 'tags', 'originalPost.user']);
        $post->loadCount(['likedByUsers', 'comments', 'bookmarkedByUsers', 'reposts']);

        return $this->success(
            new PostResource($post),
            'Post updated successfully'
        );
    }

    /**
     * POST /api/posts/{post}/repost
     * Repost an existing post. Optionally add commentary.
     */
    public function repost(Request $request, Post $post): JsonResponse
    {
        $user = $request->user();

        // Can't repost your own post
        if ($user->id === $post->user_id) {
            return $this->error('You cannot repost your own post.', 422);
        }

        // Can't repost a repost — always repost the original
        $originalId = $post->original_post_id ?? $post->id;

        // Check if already reposted
        $existing = Post::where('user_id', $user->id)
            ->where('original_post_id', $originalId)
            ->first();

        if ($existing) {
            return $this->error('You have already reposted this.', 409);
        }

        $request->validate([
            'content' => 'nullable|string|max:5000',
        ]);

        $repost = Post::create([
            'user_id'          => $user->id,
            'center_id'        => $user->center_id,
            'original_post_id' => $originalId,
            'type'             => 'news',
            'content'          => $request->input('content')
                ? $this->sanitizer->sanitizeHtml($request->input('content'))
                : null,
        ]);

        // Notify original post author
        $originalPost = Post::find($originalId);
        if ($originalPost) {
            $this->notificationService->create(
                $originalPost->user_id,
                $user->id,
                'repost',
                Post::class,
                $originalId,
                $user->name . ' ha reposteado tu publicación'
            );
        }

        $repost->load(['user', 'center', 'tags', 'originalPost.user']);
        $repost->loadCount(['likedByUsers', 'comments', 'bookmarkedByUsers', 'reposts']);

        return $this->success(
            new PostResource($repost),
            'Reposted successfully',
            201
        );
    }
}
