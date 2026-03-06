<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsTeacher
{
    /**
     * Handle an incoming request.
     * Only allows users with role 'teacher' or 'admin' to proceed.
     * Token must be valid and user must not be blocked.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Valid token required.',
                'errors'  => null,
            ], 401);
        }

        if (!$user->isTeacherOrAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Teacher or admin access required.',
                'errors'  => null,
            ], 403);
        }

        return $next($request);
    }
}
