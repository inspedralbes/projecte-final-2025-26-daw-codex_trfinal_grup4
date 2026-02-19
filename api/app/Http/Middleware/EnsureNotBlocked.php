<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureNotBlocked
{
    /**
     * Handle an incoming request.
     * Blocks users who have been blocked by a teacher/admin.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->is_blocked) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been blocked. Contact your center administrator.',
                'errors'  => null,
            ], 403);
        }

        return $next($request);
    }
}
