<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureNotBlocked
{
    /**
     * Handle an incoming request.
     * Auto-lifts expired timeouts, then blocks active bans/timeouts.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        // Auto-lift expired timeout
        if ($user->ban_expires_at && $user->ban_expires_at->isPast()) {
            $user->update([
                'is_blocked'     => false,
                'ban_status'     => 'active',
                'ban_reason'     => null,
                'ban_expires_at' => null,
            ]);
            return $next($request);
        }

        // Block if user is blocked (permanent ban or active timeout)
        if ($user->is_blocked) {
            $isPermanent = is_null($user->ban_expires_at);
            $message = $isPermanent
                ? 'Tu cuenta ha sido baneada permanentemente.'
                : 'Tu cuenta está en timeout hasta ' . $user->ban_expires_at->format('d/m/Y \a las H:i') . '.';

            if ($user->ban_reason) {
                $message .= ' Motivo: ' . $user->ban_reason;
            }

            return response()->json([
                'success'        => false,
                'message'        => $message,
                'ban_status'     => $user->ban_status,
                'ban_reason'     => $user->ban_reason,
                'ban_expires_at' => $user->ban_expires_at,
                'errors'         => null,
            ], 403);
        }

        return $next($request);
    }
}
