<?php

namespace App\Http\Controllers;

use App\Events\GroupUpdatedEvent;
use App\Events\GroupMemberChangedEvent;
use App\Models\Group;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\ChatService;
use App\Services\SanitizationService;
use Illuminate\Support\Facades\Log;
use Throwable;

class GroupChatController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly SanitizationService $sanitization,
        private readonly ChatService $chatService
    ) {}

    /**
     * GET /api/users/mutual-followers
     * Return list of users with mutual follows.
     */
    public function mutualFollowers(Request $request): JsonResponse
    {
        $user = $request->user();
        $mutuals = $user->mutualFollowers()
            ->where('users.id', '!=', $user->id)
            ->select(['users.id', 'name', 'username', 'avatar'])
            ->get();

        return $this->success(['users' => $mutuals]);
    }

    /**
     * POST /api/groups
     * Create a new group.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'member_ids' => 'required|array|min:2', // Creator + 2 others = 3 total
            'member_ids.*' => 'exists:users,id',
            'image_url' => 'nullable|url',
        ]);

        $creator = $request->user();
        $name = $this->sanitization->sanitizeHtml($request->input('name'));
        $memberIds = $request->input('member_ids');

        // Verify all members are mutual followers of the creator
        $mutualIds = $creator->mutualFollowers()->pluck('users.id')->toArray();
        $invalidMembers = array_diff($memberIds, $mutualIds);

        if (!empty($invalidMembers)) {
            return $this->error('Algunos usuarios no son seguidores mutuos: ' . implode(', ', $invalidMembers), 403);
        }

        try {
            return DB::transaction(function () use ($creator, $name, $memberIds, $request) {
                $group = Group::create([
                    'name' => $name,
                    'creator_id' => $creator->id,
                    'image_url' => $request->input('image_url'),
                ]);

                // Combine all members and set roles
                $pivotData = [];
                foreach ($memberIds as $id) {
                    $pivotData[$id] = ['is_admin' => false];
                }
                // Creator is always admin, and might be in memberIds too
                $pivotData[$creator->id] = ['is_admin' => true];

                $group->members()->sync($pivotData);

                $allMemberIds = array_unique(array_merge([$creator->id], $memberIds));

                // Notify all members that they've been added to a new group
                foreach ($allMemberIds as $memberId) {
                    $member = User::find($memberId);
                    if ($member) {
                        event(new \App\Events\GroupMemberChangedEvent($group, $member, 'added'));
                    }
                }

                return $this->success([
                    'group' => [
                        'id' => $group->id,
                        'name' => $group->name,
                        'image_url' => $group->image_url,
                        'creator_id' => $group->creator_id,
                        'members_count' => count($allMemberIds),
                    ]
                ], 'Grupo creado correctamente.', 201);
            });
        } catch (Throwable $e) {
            Log::error('Error al crear el grupo: ' . $e->getMessage(), [
                'creator_id' => $creator->id,
                'member_ids' => $memberIds,
                'trace' => $e->getTraceAsString()
            ]);
            return $this->error('Error al crear el grupo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/groups
     * List groups the user belongs to.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $groups = $user->groups()
            ->withCount('members')
            ->orderBy('groups.created_at', 'desc')
            ->get();

        return $this->success(['groups' => $groups]);
    }

    /**
     * PUT /api/groups/{groupId}
     * Update group name and image. Admin only.
     */
    public function update(Request $request, int $groupId): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'image_url' => 'nullable|url',
        ]);

        $user = $request->user();
        $group = Group::find($groupId);

        if (!$group) {
            return $this->error('Grupo no encontrado.', 404);
        }

        // Verify user is admin
        $member = $group->members()->where('user_id', $user->id)->first();
        if (!$member || !$member->pivot->is_admin) {
            return $this->error('No tienes permisos de administrador para este grupo.', 403);
        }

        $group->update([
            'name' => $this->sanitization->sanitizeHtml($request->input('name')),
            'image_url' => $this->sanitization->sanitizeHtml($request->input('image_url')),
        ]);

        // Broadcast update
        event(new GroupUpdatedEvent($group));

        return $this->success([
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'image_url' => $group->image_url,
            ]
        ], 'Grupo actualizado correctamente.');
    }

    /**
     * DELETE /api/groups/{groupId}/members/{userId}
     * Remove a member from the group. Admin only.
     */
    public function removeMember(Request $request, int $groupId, int $userId): JsonResponse
    {
        $currentUser = $request->user();
        $group = Group::find($groupId);

        if (!$group) {
            return $this->error('Grupo no encontrado.', 404);
        }

        // Verify current user is admin
        $adminMember = $group->members()->where('user_id', $currentUser->id)->first();
        if (!$adminMember || !$adminMember->pivot->is_admin) {
            return $this->error('No tienes permisos de administrador para este grupo.', 403);
        }

        // Cannot kick yourself (creators should transfer ownership or leave, but for simplicity we prevent kicking oneself)
        if ($currentUser->id === $userId) {
            return $this->error('No puedes expulsarte a ti mismo.', 400);
        }

        // Verify target user is in the group
        $targetMember = $group->members()->where('user_id', $userId)->first();
        if (!$targetMember) {
            return $this->error('El usuario no pertenece a este grupo.', 404);
        }

        // Remove the member
        $group->members()->detach($userId);

        // Broadcast removal
        $targetUser = User::find($userId);
        if ($targetUser) {
            event(new GroupMemberChangedEvent($group, $targetUser, 'removed'));
        }

        return $this->success(null, 'Miembro expulsado correctamente.');
    }

    /**
     * POST /api/groups/{groupId}/members
     * Add a member to the group. Admin only.
     */
    public function addMember(Request $request, int $groupId): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $currentUser = $request->user();
        $group = Group::find($groupId);
        $userId = $request->input('user_id');

        if (!$group) {
            return $this->error('Grupo no encontrado.', 404);
        }

        // Verify current user is admin
        $adminMember = $group->members()->where('user_id', $currentUser->id)->first();
        if (!$adminMember || !$adminMember->pivot->is_admin) {
            return $this->error('No tienes permisos de administrador para este grupo.', 403);
        }

        // Verify target user is NOT in the group
        if ($group->members()->where('user_id', $userId)->exists()) {
            return $this->error('El usuario ya pertenece a este grupo.', 400);
        }

        // Add the member
        $group->members()->attach($userId, ['is_admin' => false]);

        // Broadcast addition
        $targetUser = User::find($userId);
        if ($targetUser) {
            event(new GroupMemberChangedEvent($group, $targetUser, 'added'));
        }

        return $this->success([
            'user' => [
                'id' => $targetUser->id,
                'name' => $targetUser->name,
                'username' => $targetUser->username,
                'avatar' => $targetUser->avatar,
                'is_admin' => false
            ]
        ], 'Miembro añadido correctamente.');
    }

    /**
     * POST /api/groups/{groupId}/leave
     * Leave the group.
     */
    public function leave(Request $request, int $groupId): JsonResponse
    {
        $user = $request->user();
        $group = Group::find($groupId);

        if (!$group) {
            return $this->error('Grupo no encontrado.', 404);
        }

        // Verify user is in the group
        if (!$group->members()->where('user_id', $user->id)->exists()) {
            return $this->error('No perteneces a este grupo.', 403);
        }

        // Remove the member
        $group->members()->detach($user->id);

        // Broadcast leave
        event(new GroupMemberChangedEvent($group, $user, 'left'));

        return $this->success(null, 'Has abandonado el grupo correctamente.');
    }

    /**
     * POST /api/groups/{groupId}/read
     * Mark a group as read.
     */
    public function markAsRead(Request $request, int $groupId): JsonResponse
    {
        $user = $request->user();
        $group = Group::find($groupId);

        if (!$group) {
            return $this->error('Grupo no encontrado.', 404);
        }

        // Verify user is in the group
        if (!$group->members()->where('user_id', $user->id)->exists()) {
            return $this->error('No perteneces a este grupo.', 403);
        }

        $this->chatService->markGroupAsRead($user, $group->id);

        return $this->success(null, 'Grupo marcado como leído.');
    }
}
