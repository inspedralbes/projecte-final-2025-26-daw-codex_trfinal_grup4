<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/email/verify/{id}/{hash}
     * Verify the user's email address.
     * This is the link the user clicks from the email.
     * Redirects to frontend after verification.
     */
    public function verify(Request $request, int $id, string $hash): RedirectResponse
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        $user = User::find($id);

        // User not found
        if (!$user) {
            return redirect($frontendUrl . '/welcome?error=invalid_link');
        }

        // Check if hash matches
        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return redirect($frontendUrl . '/welcome?error=invalid_link');
        }

        // Check if already verified
        if ($user->hasVerifiedEmail()) {
            return redirect($frontendUrl . '/?verified=already');
        }

        // Mark as verified
        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect($frontendUrl . '/?verified=success');
    }

    /**
     * POST /api/email/resend
     * Resend the email verification notification.
     */
    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return $this->error('Email already verified.', 422);
        }

        $user->sendEmailVerificationNotification();

        return $this->success(null, 'Verification email resent.');
    }

    /**
     * GET /api/email/status
     * Check if the authenticated user's email is verified.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->success([
            'email'             => $user->email,
            'is_verified'       => $user->hasVerifiedEmail(),
            'verified_at'       => $user->email_verified_at,
        ]);
    }
}
