<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPostController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/admin/posts
     * List all posts for administration.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Post::with(['user', 'center', 'tags'])
            ->withCount(['likedByUsers', 'comments', 'reposts', 'bookmarkedByUsers'])
            ->latest();

        // Search by content or username
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('content', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('username', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by center
        if ($request->has('center_id')) {
            $query->where('center_id', $request->input('center_id'));
        }

        $posts = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'message' => 'All posts retrieved for admin',
            'data'    => PostResource::collection($posts->getCollection()),
            'current_page' => $posts->currentPage(),
            'last_page'    => $posts->lastPage(),
            'per_page'     => $posts->perPage(),
            'total'        => $posts->total(),
        ]);
    }
}
