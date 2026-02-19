<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordController extends Controller
{
    use ApiResponse;

    /* ================================================================== */
    /*  SET PASSWORD (Google OAuth users who need to create a password)    */
    /* ================================================================== */

    /**
     * POST /api/password/set
     * Allows a Google-authenticated user to set their first password.
     * Only works if password_set_at is null (user hasn't set one yet).
     */
    public function set(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (!$user->needsPassword()) {
            return $this->error('Password already set. Use the update endpoint to change it.', 409);
        }

        $user->update([
            'password'        => Hash::make($request->password),
            'password_set_at' => now(),
        ]);

        return $this->success(null, 'Password set successfully. You can now log in with email and password.');
    }

    /* ================================================================== */
    /*  CHANGE PASSWORD (authenticated user changes their own password)    */
    /* ================================================================== */

    /**
     * PUT /api/password/update
     * Authenticated user changes their password (must provide current password).
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        // Google users who haven't set a password must use /password/set first
        if ($user->needsPassword()) {
            return $this->error('You haven\'t set a password yet. Use the set-password endpoint.', 422);
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->error('Current password is incorrect.', 422);
        }

        $user->update([
            'password'        => Hash::make($request->password),
            'password_set_at' => now(),
        ]);

        return $this->success(null, 'Password updated successfully.');
    }

    /* ================================================================== */
    /*  FORGOT PASSWORD (send reset link via email)                       */
    /* ================================================================== */

    /**
     * POST /api/password/forgot
     * Sends a password reset email with a signed token.
     * Always returns success to prevent email enumeration.
     */
    public function forgot(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            // Delete any previous reset tokens for this email
            DB::table('password_reset_tokens')->where('email', $user->email)->delete();

            // Generate token and store it
            $token = Str::random(64);

            DB::table('password_reset_tokens')->insert([
                'email'      => $user->email,
                'token'      => Hash::make($token),
                'created_at' => now(),
            ]);

            // Send notification
            $user->notify(new ResetPasswordNotification($token));
        }

        // Always return success to prevent email enumeration
        return $this->success(null, 'If that email is registered, you will receive a password reset link.');
    }

    /* ================================================================== */
    /*  RESET PASSWORD (using token from email)                           */
    /* ================================================================== */

    /**
     * POST /api/password/reset
     * Resets the password using a token received via email.
     */
    public function reset(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'token'    => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        // Find the reset record
        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return $this->error('Invalid or expired reset token.', 422);
        }

        // Check token expiry (60 minutes)
        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return $this->error('Reset token has expired. Please request a new one.', 422);
        }

        // Verify the token
        if (!Hash::check($request->token, $record->token)) {
            return $this->error('Invalid or expired reset token.', 422);
        }

        // Find user and update password
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return $this->error('Invalid or expired reset token.', 422);
        }

        $user->update([
            'password'        => Hash::make($request->password),
            'password_set_at' => now(),
        ]);

        // Delete the used token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Revoke all existing tokens (security: log out all sessions)
        $user->tokens()->delete();

        return $this->success(null, 'Password reset successfully. Please log in with your new password.');
    }
}
