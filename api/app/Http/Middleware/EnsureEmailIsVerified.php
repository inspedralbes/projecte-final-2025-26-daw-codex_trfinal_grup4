<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerified
{
    /**
     * Handle an incoming request.
     * Blocks unverified users from performing write actions.
     * Returns JSON 403 instead of redirecting (API-friendly).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Debes verificar tu email antes de realizar esta acción.',
                'email_verified' => false,
                'errors'  => null,
            ], 403);
        }

        return $next($request);
    }
}
