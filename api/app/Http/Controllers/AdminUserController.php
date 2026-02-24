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
     * Admin: update user role, block status or ban status.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'role'       => [new Enum(UserRole::class)],
            'is_blocked' => 'boolean',
            'ban_status' => 'in:active,flagged,banned',
        ]);

        $user->update($request->only(['role', 'is_blocked', 'ban_status']));

        return $this->success($user, 'User updated successfully.');
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
