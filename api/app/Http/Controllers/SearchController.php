<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/search
     * Global search across posts, users, and tags.
     * Requires ?q= query parameter. Optional ?type= filter (posts, users, tags).
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
            'type' => 'sometimes|in:posts,users,tags',
        ]);

        $query = $request->input('q');
        $type = $request->input('type');
        $results = [];

        // Strip # from query for tag searches
        $isTagSearch = str_starts_with($query, '#');
        $tagQuery = $isTagSearch ? ltrim($query, '#') : $query;

        // Search posts (global only for non-auth, + center for auth)
        if (!$type || $type === 'posts') {
            $postsQuery = Post::query();

            if ($isTagSearch) {
                // When searching for a hashtag, search posts by tag name only
                $postsQuery->whereHas('tags', function ($tq) use ($tagQuery) {
                    $tq->where('name', 'LIKE', "%{$tagQuery}%")
                       ->orWhere('slug', 'LIKE', "%{$tagQuery}%");
                });
            } else {
                // Regular search: content, code snippet, and tags
                $postsQuery->where(function ($q) use ($query, $tagQuery) {
                    $q->where('content', 'LIKE', "%{$query}%")
                      ->orWhere('code_snippet', 'LIKE', "%{$query}%")
                      ->orWhereHas('tags', function ($tq) use ($tagQuery) {
                          $tq->where('name', 'LIKE', "%{$tagQuery}%")
                             ->orWhere('slug', 'LIKE', "%{$tagQuery}%");
                      });
                });
            }

            $postsQuery = $postsQuery
                ->with(['user', 'center', 'tags'])
                ->withCount(['likedByUsers', 'comments', 'bookmarkedByUsers'])
                ->latest()
                ->limit(20)
                ->get();

            $results['posts'] = PostResource::collection($postsQuery);
        }

        // Search users (skip when searching hashtags)
        if ((!$type || $type === 'users') && !$isTagSearch) {
            $users = User::where(function ($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                      ->orWhere('username', 'LIKE', "%{$query}%")
                      ->orWhere('bio', 'LIKE', "%{$query}%");
                })
                ->select('id', 'name', 'username', 'avatar', 'bio', 'role', 'center_id')
                ->with('center:id,name')
                ->limit(20)
                ->get();

            $results['users'] = $users;
        }

        // Search tags (use tagQuery without #)
        if (!$type || $type === 'tags') {
            $tags = Tag::where(function ($q) use ($tagQuery) {
                    $q->where('name', 'LIKE', "%{$tagQuery}%")
                      ->orWhere('slug', 'LIKE', "%{$tagQuery}%");
                })
                ->withCount('posts')
                ->orderByDesc('posts_count')
                ->limit(20)
                ->get()
                ->map(fn ($tag) => [
                    'id'          => $tag->id,
                    'name'        => $tag->name,
                    'slug'        => $tag->slug,
                    'color'       => $tag->color,
                    'posts_count' => $tag->posts_count,
                ]);

            $results['tags'] = $tags;
        }

        return $this->success($results, 'Search results');
    }

    /**
     * GET /api/center/search
     * Search within the authenticated user's center.
     */
    public function centerSearch(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
        ]);

        $user = $request->user();

        if (!$user->center_id) {
            return $this->error('You are not associated with any center', 403);
        }

        if ($user->isCenterBlocked()) {
            return $this->error('You have been blocked from accessing your center hub.', 403);
        }

        $query = $request->input('q');

        // Strip # from query for tag searches
        $isTagSearch = str_starts_with($query, '#');
        $tagQuery = $isTagSearch ? ltrim($query, '#') : $query;

        // Posts within center
        $postsQuery = Post::where('center_id', $user->center_id);

        if ($isTagSearch) {
            // When searching for a hashtag, search posts by tag name only
            $postsQuery->whereHas('tags', function ($tq) use ($tagQuery) {
                $tq->where('name', 'LIKE', "%{$tagQuery}%")
                   ->orWhere('slug', 'LIKE', "%{$tagQuery}%");
            });
        } else {
            $postsQuery->where(function ($q) use ($query, $tagQuery) {
                $q->where('content', 'LIKE', "%{$query}%")
                  ->orWhere('code_snippet', 'LIKE', "%{$query}%")
                  ->orWhereHas('tags', function ($tq) use ($tagQuery) {
                      $tq->where('name', 'LIKE', "%{$tagQuery}%")
                         ->orWhere('slug', 'LIKE', "%{$tagQuery}%");
                  });
            });
        }

        $posts = $postsQuery
            ->with(['user', 'center', 'tags'])
            ->withCount(['likedByUsers', 'comments', 'bookmarkedByUsers'])
            ->latest()
            ->limit(20)
            ->get();

        // Members within center (skip when searching hashtags)
        $members = [];
        if (!$isTagSearch) {
            $members = User::where('center_id', $user->center_id)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                      ->orWhere('username', 'LIKE', "%{$query}%");
                })
                ->select('id', 'name', 'username', 'avatar', 'role')
                ->limit(20)
                ->get();
        }

        return $this->success([
            'posts'   => PostResource::collection($posts),
            'members' => $members,
        ], 'Center search results');
    }
}
