<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/tags
     * List all tags with post count.
     */
    public function index(): JsonResponse
    {
        $tags = Tag::withCount('posts')
            ->orderByDesc('posts_count')
            ->get()
            ->map(fn ($tag) => [
                'id'          => $tag->id,
                'name'        => $tag->name,
                'slug'        => $tag->slug,
                'color'       => $tag->color,
                'posts_count' => $tag->posts_count,
            ]);

        return $this->success($tags);
    }

    /**
     * GET /api/center/tags
     * List tags used within the authenticated user's center.
     */
    public function centerTags(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->center_id) {
            return $this->error('You are not associated with any center', 403);
        }

        $tags = Tag::whereHas('posts', fn ($q) => $q->where('center_id', $user->center_id))
            ->withCount(['posts' => fn ($q) => $q->where('center_id', $user->center_id)])
            ->orderByDesc('posts_count')
            ->get()
            ->map(fn ($tag) => [
                'id'          => $tag->id,
                'name'        => $tag->name,
                'slug'        => $tag->slug,
                'color'       => $tag->color,
                'posts_count' => $tag->posts_count,
            ]);

        return $this->success($tags, 'Center tags retrieved successfully');
    }
}
