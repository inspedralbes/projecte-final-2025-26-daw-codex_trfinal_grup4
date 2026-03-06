<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Enums\UserRole;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CenterMemberController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/center/members
     * Teacher: list all members of their center with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $centerId = $user->center_id;

        if (!$centerId) {
            return $this->error('You are not associated with any center.', 422);
        }

        $query = User::where('center_id', $centerId)
            ->select('id', 'name', 'username', 'email', 'role', 'avatar', 'is_blocked', 'center_blocked', 'created_at');

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filter by center-blocked status
        if ($request->has('is_blocked')) {
            $query->where('center_blocked', filter_var($request->is_blocked, FILTER_VALIDATE_BOOLEAN));
        }

        // Search by name/username/email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $members = $query->orderBy('role')->orderBy('name')->paginate(30);

        return $this->success($members);
    }

    /**
     * GET /api/center/members/{user}
     * Teacher: show details of a center member.
     */
    public function show(Request $request, User $user): JsonResponse
    {
        $teacher = $request->user();

        if ($user->center_id !== $teacher->center_id) {
            return $this->error('This user does not belong to your center.', 403);
        }

        $user->loadCount(['posts', 'comments']);

        return $this->success($user->only([
            'id', 'name', 'username', 'email', 'role', 'avatar', 'bio',
            'is_blocked', 'posts_count', 'comments_count', 'created_at',
        ]));
    }

    /**
     * PATCH /api/center/members/{user}/role
     * Teacher: change a member's role (student <-> teacher).
     * Cannot change own role. Cannot assign admin.
     */
    public function updateRole(Request $request, User $user): JsonResponse
    {
        $teacher = $request->user();

        if ($user->center_id !== $teacher->center_id) {
            return $this->error('This user does not belong to your center.', 403);
        }

        if ($user->id === $teacher->id) {
            return $this->error('You cannot change your own role.', 422);
        }

        if ($user->role->value === 'admin') {
            return $this->error('Cannot modify admin users.', 403);
        }

        $request->validate([
            'role' => 'required|in:student,teacher',
        ]);

        $newRole = $request->input('role');

        $user->update(['role' => $newRole]);

        return $this->success(
            $user->only(['id', 'name', 'username', 'email', 'role', 'is_blocked']),
            "User role updated to {$newRole}."
        );
    }

    /**
     * PATCH /api/center/members/{user}/block
     * Teacher: block a student from center hub. Blocked users cannot access center content.
     * This is a center-level block, NOT a global ban (admin only).
     */
    public function block(Request $request, User $user): JsonResponse
    {
        $teacher = $request->user();

        if ($user->center_id !== $teacher->center_id) {
            return $this->error('This user does not belong to your center.', 403);
        }

        if ($user->id === $teacher->id) {
            return $this->error('You cannot block yourself.', 422);
        }

        // Teachers can only block students, not other teachers (unless admin)
        if ($user->role->value === 'teacher' && $teacher->role->value !== 'admin') {
            return $this->error('Only admins can block teachers.', 403);
        }

        if ($user->role->value === 'admin') {
            return $this->error('Cannot block admin users.', 403);
        }

        if ($user->center_blocked) {
            return $this->error('User is already blocked from this center.', 422);
        }

        $user->update(['center_blocked' => true]);

        return $this->success(
            $user->only(['id', 'name', 'username', 'role', 'center_blocked']),
            'User has been blocked from the center hub.'
        );
    }

    /**
     * PATCH /api/center/members/{user}/unblock
     * Teacher: unblock a student from center hub.
     */
    public function unblock(Request $request, User $user): JsonResponse
    {
        $teacher = $request->user();

        if ($user->center_id !== $teacher->center_id) {
            return $this->error('This user does not belong to your center.', 403);
        }

        if (!$user->center_blocked) {
            return $this->error('User is not blocked from this center.', 422);
        }

        $user->update(['center_blocked' => false]);

        return $this->success(
            $user->only(['id', 'name', 'username', 'role', 'center_blocked']),
            'User has been unblocked from the center hub.'
        );
    }

    /**
     * DELETE /api/center/members/{user}
     * Teacher: remove a user from the center (sets center_id=null, role=userNormal).
     */
    public function removeMember(Request $request, User $user): JsonResponse
    {
        $teacher = $request->user();

        if ($user->center_id !== $teacher->center_id) {
            return $this->error('This user does not belong to your center.', 403);
        }

        if ($user->id === $teacher->id) {
            return $this->error('You cannot remove yourself from the center.', 422);
        }

        if ($user->role->value === 'admin') {
            return $this->error('Cannot remove admin users.', 403);
        }

        $user->update([
            'center_id'      => null,
            'role'           => UserRole::UserNormal->value,
            'center_blocked' => false,
        ]);

        return $this->success(null, 'User removed from center.');
    }
}
