<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\Center;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * Register a new user.
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
            'name'      => $data['name'],
            'username'  => $data['username'],
            'email'     => $data['email'],
            'password'  => Hash::make($data['password']),
            'role'      => $role,
            'center_id' => $centerId,
        ]);

        return $user;
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
