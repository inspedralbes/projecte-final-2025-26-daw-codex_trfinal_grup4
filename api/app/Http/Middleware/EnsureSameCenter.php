<?php

namespace App\Http\Middleware;

use App\Models\Post;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSameCenter
{
    /**
     * Verify the authenticated user belongs to the same center as the requested resource.
     * Blocks access to center-specific posts if the user's center_id doesn't match.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Must be authenticated
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required.',
                'errors'  => null,
            ], 401);
        }

        // Resolve post from route (supports {post} and {postId})
        $post = $request->route('post') ?? ($request->route('postId') ? Post::find($request->route('postId')) : null);

        if ($post instanceof Post && $post->center_id !== null) {
            // The post belongs to a center — user must belong to the same center
            if ($user->center_id !== $post->center_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. This content belongs to another center.',
                    'errors'  => null,
                ], 403);
            }
        }

        return $next($request);
    }
}
