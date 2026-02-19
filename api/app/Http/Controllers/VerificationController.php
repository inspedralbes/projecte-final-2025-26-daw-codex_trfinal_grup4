<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/email/verify/{id}/{hash}
     * Verify the user's email address.
     * This is the link the user clicks from the email.
     */
    public function verify(Request $request, int $id, string $hash): JsonResponse
    {
        $user = User::findOrFail($id);

        // Check if hash matches
        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return $this->error('Invalid verification link.', 403);
        }

        // Check if already verified
        if ($user->hasVerifiedEmail()) {
            return $this->success(['already_verified' => true], 'Email already verified.');
        }

        // Mark as verified
        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return $this->success(['verified' => true], 'Email verified successfully.');
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
