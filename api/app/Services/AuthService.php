<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\Center;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthService
{
    /**
     * Register a new user (local auth).
     * Detects the email domain to auto-assign a center and role.
     *
     * Flow:
     * - If domain matches an ACTIVE center → student role + center_id
     * - If domain matches NO center → userNormal role (can request center creation)
     * - Pending/rejected centers are not matched
     */
    public function register(array $data): User
    {
        $domain = $this->extractDomain($data['email']);
        $center = Center::where('domain', $domain)->where('status', 'active')->first();

        $role = UserRole::UserNormal;
        $centerId = null;

        if ($center) {
            $centerId = $center->id;
            $role = UserRole::Student;
        }

        $user = User::create([
            'name'            => $data['name'],
            'username'        => $data['username'],
            'email'           => $data['email'],
            'password'        => Hash::make($data['password']),
            'password_set_at' => now(),
            'role'            => $role,
            'center_id'       => $centerId,
            'auth_provider'   => 'local',
        ]);

        return $user;
    }

    /**
     * Handle Google OAuth login/register.
     *
     * Logic:
     * 1. If user exists by google_id → login (update name if changed, keep avatar)
     * 2. If user exists by email (local account) → link Google, keep existing avatar
     * 3. If new user → create with Google data, set avatar from Google, auto-verify email
     *
     * Avatar policy:
     * - New user from Google → use Google avatar
     * - Existing user already has avatar → keep it
     * - Existing user has no avatar → use Google avatar
     */
    public function handleGoogleUser(object $googleUser): array
    {
        // 1. Find by google_id (returning Google user)
        $user = User::where('google_id', $googleUser->getId())->first();

        if ($user) {
            // Update name in case it changed on Google
            $user->update(['name' => $googleUser->getName()]);

            return ['user' => $user, 'is_new' => false];
        }

        // 2. Find by email (existing local account → link Google)
        $user = User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            $updateData = [
                'google_id'     => $googleUser->getId(),
                'auth_provider' => $user->auth_provider === 'local' ? 'google' : $user->auth_provider,
            ];

            // Only set avatar if the user doesn't already have one
            if (!$user->avatar && $googleUser->getAvatar()) {
                $updateData['avatar'] = $googleUser->getAvatar();
            }

            // Auto-verify email if not yet verified (Google already verified it)
            if (!$user->hasVerifiedEmail()) {
                $updateData['email_verified_at'] = now();
            }

            $user->update($updateData);

            return ['user' => $user, 'is_new' => false];
        }

        // 3. New user → create from Google data
        $domain = $this->extractDomain($googleUser->getEmail());
        $center = Center::where('domain', $domain)->where('status', 'active')->first();

        $role = UserRole::UserNormal;
        $centerId = null;

        if ($center) {
            $centerId = $center->id;
            $role = UserRole::Student;
        }

        $user = User::create([
            'name'              => $googleUser->getName(),
            'username'          => $this->generateUniqueUsername($googleUser),
            'email'             => $googleUser->getEmail(),
            'password'          => Hash::make(Str::random(32)), // Temp random password
            'password_set_at'   => null, // User needs to set their own password
            'google_id'         => $googleUser->getId(),
            'auth_provider'     => 'google',
            'avatar'            => $googleUser->getAvatar(),
            'email_verified_at' => now(), // Google-verified email
            'role'              => $role,
            'center_id'         => $centerId,
        ]);

        return ['user' => $user, 'is_new' => true];
    }

    /**
     * Generate a unique username from Google user data.
     * Uses the email local part, sanitized, with a random suffix if needed.
     */
    public function generateUniqueUsername(object $googleUser): string
    {
        // Take the part before @ and sanitize it
        $base = Str::before($googleUser->getEmail(), '@');
        $base = preg_replace('/[^a-zA-Z0-9_]/', '_', $base);
        $base = Str::limit($base, 40, '');

        // If the base username is available, use it
        if (!User::where('username', $base)->exists()) {
            return $base;
        }

        // Otherwise, append random digits until unique
        do {
            $candidate = $base . '_' . rand(100, 9999);
        } while (User::where('username', $candidate)->exists());

        return $candidate;
    }

    /**
     * Extract the domain part from an email address.
     * e.g. "john@inspedralbes.cat" → "inspedralbes.cat"
     */
    public function extractDomain(string $email): string
    {
        return strtolower(substr(strrchr($email, '@'), 1));
    }

    /**
     * Check if a given email domain matches a registered active center.
     * Also indicates if the user can request creating a center for that domain.
     */
    public function detectCenter(string $email): array
    {
        $domain = $this->extractDomain($email);

        $activeCenter = Center::where('domain', $domain)->where('status', 'active')->first();
        $pendingCenter = Center::where('domain', $domain)->where('status', 'pending')->first();

        return [
            'has_center'      => $activeCenter !== null,
            'center_name'     => $activeCenter?->name,
            'center_city'     => $activeCenter?->city,
            'is_pending'      => $pendingCenter !== null,
            'can_request'     => $activeCenter === null && $pendingCenter === null,
        ];
    }
}
