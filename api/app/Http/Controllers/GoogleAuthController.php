<?php

namespace App\Http\Controllers;

use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly AuthService $authService
    ) {}

    /**
     * GET /api/auth/google/redirect
     *
     * Returns the Google OAuth redirect URL.
     * The frontend (React SPA) calls this to get the URL, then redirects the browser.
     *
     * Includes prompt=select_account to allow user to select their Google account.
     */
    public function redirect(): JsonResponse
    {
        $url = Socialite::driver('google')
            ->stateless()
            ->with(['prompt' => 'select_account'])
            ->redirect()
            ->getTargetUrl();

        return $this->success(['url' => $url], 'Google OAuth redirect URL');
    }

    /**
     * POST /api/auth/google/callback
     *
     * Receives the Google OAuth authorization code from the frontend.
     * The frontend captures the code from the Google redirect and sends it here.
     *
     * Flow:
     * 1. Exchange authorization code for Google user info
     * 2. Find or create local user (via AuthService)
     * 3. Return Sanctum token + user data
     *
     * Avatar policy (handled by AuthService):
     * - New user → Google avatar is set
     * - Existing user with avatar → keeps their avatar
     * - Existing user without avatar → gets Google avatar
     */
    public function callback(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        try {
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();
        } catch (\Exception $e) {
            return $this->error('Invalid Google authorization code.', 401);
        }

        // Validate that we got a valid email
        if (!$googleUser->getEmail()) {
            return $this->error('Could not retrieve email from Google.', 422);
        }

        // Handle user creation/login via AuthService
        $result = $this->authService->handleGoogleUser($googleUser);
        $user = $result['user'];
        $isNew = $result['is_new'];

        // Auto-lift expired timeout
        if ($user->ban_status === 'timeout' && $user->ban_expires_at && $user->ban_expires_at->isPast()) {
            $user->update([
                'is_blocked'     => false,
                'ban_status'     => 'active',
                'ban_reason'     => null,
                'ban_expires_at' => null,
            ]);
        }

        // Block banned/timeout users from logging in
        if ($user->is_blocked) {
            $isPermanent = $user->ban_status === 'banned';
            $message = $isPermanent
                ? 'Tu cuenta ha sido baneada permanentemente.'
                : 'Tu cuenta está en timeout hasta ' . ($user->ban_expires_at ? $user->ban_expires_at->format('d/m/Y \a las H:i') : 'nueva orden') . '.';

            if ($user->ban_reason) {
                $message .= ' Motivo: ' . $user->ban_reason;
            }

            if ($isPermanent) {
                $user->tokens()->delete();
            }

            return response()->json([
                'success'        => false,
                'message'        => $message,
                'is_banned'      => true,
                'ban_status'     => $user->ban_status,
                'ban_reason'     => $user->ban_reason,
                'ban_expires_at' => $user->ban_expires_at,
                'errors'         => null,
            ], 403);
        }

        $token = $user->createToken('google_auth_token')->plainTextToken;

        $message = $isNew
            ? 'Account created successfully with Google.'
            : 'Logged in successfully with Google.';

        return $this->success([
            'user'           => $user->load('center'),
            'token'          => $token,
            'email_verified' => $user->hasVerifiedEmail(),
            'is_new_user'    => $isNew,
            'auth_provider'  => $user->auth_provider,
            'needs_password' => $user->needsPassword(),
            'center_check'   => $this->authService->buildCenterCheck($user),
        ], $message, $isNew ? 201 : 200);
    }
}
