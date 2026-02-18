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
     */
    public function register(array $data): User
    {
        $domain = $this->extractDomain($data['email']);
        $center = Center::where('domain', $domain)->first();

        $role = UserRole::UserNormal;
        $centerId = null;

        if ($center) {
            $centerId = $center->id;
            // Users from a recognized center default to 'student'.
            // Teachers can be promoted later by an admin.
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
     * Check if a given email domain matches a registered center.
     */
    public function detectCenter(string $email): ?Center
    {
        $domain = $this->extractDomain($email);

        return Center::where('domain', $domain)->first();
    }
}
