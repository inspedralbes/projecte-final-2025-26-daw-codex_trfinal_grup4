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

        // Search posts (global only for non-auth, + center for auth)
        if (!$type || $type === 'posts') {
            $postsQuery = Post::where(function ($q) use ($query) {
                    $q->where('content', 'LIKE', "%{$query}%")
                      ->orWhere('code_snippet', 'LIKE', "%{$query}%");
                })
                ->whereNull('center_id') // Only global posts for public search
                ->with(['user', 'center', 'tags'])
                ->withCount(['likedByUsers', 'comments', 'bookmarkedByUsers'])
                ->latest()
                ->limit(20)
                ->get();

            $results['posts'] = PostResource::collection($postsQuery);
        }

        // Search users
        if (!$type || $type === 'users') {
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

        // Search tags
        if (!$type || $type === 'tags') {
            $tags = Tag::where(function ($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                      ->orWhere('slug', 'LIKE', "%{$query}%");
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

        $query = $request->input('q');

        // Posts within center
        $posts = Post::where('center_id', $user->center_id)
            ->where(function ($q) use ($query) {
                $q->where('content', 'LIKE', "%{$query}%")
                  ->orWhere('code_snippet', 'LIKE', "%{$query}%");
            })
            ->with(['user', 'center', 'tags'])
            ->withCount(['likedByUsers', 'comments', 'bookmarkedByUsers'])
            ->latest()
            ->limit(20)
            ->get();

        // Members within center
        $members = User::where('center_id', $user->center_id)
            ->where(function ($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('username', 'LIKE', "%{$query}%");
            })
            ->select('id', 'name', 'username', 'avatar', 'role')
            ->limit(20)
            ->get();

        return $this->success([
            'posts'   => PostResource::collection($posts),
            'members' => $members,
        ], 'Center search results');
    }
}
