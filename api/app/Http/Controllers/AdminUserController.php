<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Enums\UserRole;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

class AdminUserController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/admin/users
     * Admin: list all users with pagination and filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('center:id,name');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('status')) {
            $status = $request->status;
            if ($status === 'blocked') {
                $query->where('is_blocked', true);
            } elseif ($status === 'active') {
                $query->where('is_blocked', false);
            }
        }

        if ($request->has('ban_status')) {
            $query->where('ban_status', $request->ban_status);
        }

        $users = $query->latest()->paginate(20);

        return $this->success($users);
    }

    /**
     * GET /api/admin/users/{user}
     * Admin: get user details.
     */
    public function show(User $user): JsonResponse
    {
        return $this->success($user->load('center:id,name'));
    }

    /**
     * GET /api/admin/users/{user}/posts
     * Fetch all posts by a specific user for auditing.
     */
    public function userPosts(User $user): JsonResponse
    {
        $posts = $user->posts()->latest()->get();
        return $this->success($posts);
    }

    /**
     * PUT /api/admin/users/{user}
     * Admin: update user role, block status, ban status, reason and expiry.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'role'           => [new Enum(UserRole::class)],
            'is_blocked'     => 'boolean',
            'ban_status'     => 'in:active,flagged,banned,timeout',
            'ban_reason'     => 'nullable|string|max:500',
            'ban_expires_at' => 'nullable|date|after:now',
        ]);

        $user->update($request->only([
            'role', 'is_blocked', 'ban_status', 'ban_reason', 'ban_expires_at',
        ]));

        return $this->success($user, 'User updated successfully.');
    }

    /**
     * POST /api/admin/users/{user}/ban
     * Admin: apply a permanent ban or timeout with a reason.
     */
    public function ban(Request $request, User $user): JsonResponse
    {
        if (auth()->id() === $user->id) {
            return $this->error('You cannot ban yourself.', 422);
        }

        $request->validate([
            'type'           => 'required|in:ban,timeout',
            'ban_reason'     => 'required|string|max:500',
            'ban_expires_at' => 'nullable|date|after:now', // required for timeout
        ]);

        $isPermanent = $request->type === 'ban';

        $user->update([
            'is_blocked'     => true,
            'ban_status'     => $isPermanent ? 'banned' : 'timeout',
            'ban_reason'     => $request->ban_reason,
            'ban_expires_at' => $isPermanent ? null : $request->ban_expires_at,
        ]);

        return $this->success(
            $user->only(['id', 'name', 'username', 'ban_status', 'ban_reason', 'ban_expires_at', 'is_blocked']),
            $isPermanent ? 'User permanently banned.' : 'User timeout applied.'
        );
    }

    /**
     * POST /api/admin/users/{user}/unban
     * Admin: lift a ban or timeout.
     */
    public function unban(User $user): JsonResponse
    {
        $user->update([
            'is_blocked'     => false,
            'ban_status'     => 'active',
            'ban_reason'     => null,
            'ban_expires_at' => null,
        ]);

        return $this->success(
            $user->only(['id', 'name', 'username', 'ban_status', 'is_blocked']),
            'User ban lifted.'
        );
    }

    /**
     * DELETE /api/admin/users/{user}
     * Admin: delete user.
     */
    public function destroy(User $user): JsonResponse
    {
        // Don't allow admin to delete themselves
        if (auth()->id() === $user->id) {
            return $this->error('You cannot delete your own admin account.', 422);
        }

        $user->delete();

        return $this->success(null, 'User deleted successfully.');
    }
}
