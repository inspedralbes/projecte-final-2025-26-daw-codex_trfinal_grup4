<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsAdmin
{
    /**
     * Handle an incoming request.
     * Only allows users with role 'admin' to proceed.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role->value !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Admin access required.',
                'errors'  => null,
            ], 403);
        }

        return $next($request);
    }
}
