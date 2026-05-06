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
                    'group' => $this->formatGroup($group)
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

        $oldName = $group->name;
        $newName = $this->sanitization->sanitizeHtml($request->input('name'));
        $newImage = $this->sanitization->sanitizeHtml($request->input('image_url'));

        $group->update([
            'name' => $newName,
            'image_url' => $newImage,
        ]);

        // Send system message if name changed
        if ($oldName !== $newName) {
            $this->createSystemMessage($group->id, "ha cambiado el nombre del grupo a \"$newName\"", $user->name);
        } else {
            $this->createSystemMessage($group->id, "ha actualizado la información del grupo", $user->name);
        }

        // Broadcast update
        event(new GroupUpdatedEvent($group));

        return $this->success([
            'group' => $this->formatGroup($group)
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

        // Send system message
        $targetUser = User::find($userId);
        if ($targetUser) {
            $this->createSystemMessage($group->id, "ha sido expulsado del grupo", $targetUser->name);
            event(new GroupMemberChangedEvent($group, $targetUser, 'removed'));
        }

        // Refresh group to get updated members list
        $group->load('members');

        return $this->success([
            'group' => $this->formatGroup($group)
        ], 'Miembro expulsado correctamente.');
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

        // Refresh group to get updated members list
        $group->load('members');

        return $this->success([
            'user' => [
                'id' => $targetUser->id,
                'name' => $targetUser->name,
                'username' => $targetUser->username,
                'avatar' => $targetUser->avatar,
                'is_admin' => false
            ],
            'group' => $this->formatGroup($group)
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

        // Send system message
        $this->createSystemMessage($group->id, "ha abandonado el grupo", $user->name);

        // Broadcast leave
        event(new GroupMemberChangedEvent($group, $user, 'left'));

        return $this->success(null, 'Has abandonado el grupo correctamente.');
    }

    /**
     * POST /api/groups/{groupId}/members/{userId}/toggle-admin
     * Toggle admin status for a member. Admin only.
     */
    public function toggleAdmin(Request $request, int $groupId, int $userId): JsonResponse
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

        // Cannot demote the creator (or yourself if you are the only admin)
        if ($currentUser->id === $userId && $group->creator_id === $userId) {
            return $this->error('El creador siempre debe ser administrador.', 400);
        }

        // Verify target user is in the group
        $targetMember = $group->members()->where('user_id', $userId)->first();
        if (!$targetMember) {
            return $this->error('El usuario no pertenece a este grupo.', 404);
        }

        $newStatus = !$targetMember->pivot->is_admin;
        $group->members()->updateExistingPivot($userId, ['is_admin' => $newStatus]);

        // Send system message
        $statusText = $newStatus ? "ahora es administrador" : "ya no es administrador";
        $this->createSystemMessage($group->id, "$statusText", $targetMember->name);

        // Broadcast member changed (to update UI roles)
        event(new GroupMemberChangedEvent($group, $targetMember, 'role_changed'));

        // Refresh group to get updated pivot data
        $group->load('members');

        return $this->success([
            'is_admin' => $newStatus,
            'group' => $this->formatGroup($group)
        ], 'Estado de administrador actualizado.');
    }

    /**
     * Helper to create system messages
     */
    private function createSystemMessage(int $groupId, string $content, ?string $userName = null): void
    {
        $text = $userName ? "**$userName** $content" : $content;

        $message = \App\Models\ChatMessage::create([
            'group_id' => $groupId,
            'content' => $text,
            'type' => 'system',
            'sender_id' => null
        ]);

        event(new \App\Events\NewGroupMessageEvent($message));
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
    /**
     * POST /api/groups/{groupId}/image
     * Upload and update group image.
     */
    public function uploadImage(Request $request, int $groupId): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|max:5120',
        ]);

        $group = Group::find($groupId);
        if (!$group) {
            return $this->error('Grupo no encontrado.', 404);
        }

        // Verify current user is admin
        $adminMember = $group->members()->where('user_id', $request->user()->id)->first();
        if (!$adminMember || !$adminMember->pivot->is_admin) {
            return $this->error('No tienes permisos de administrador.', 403);
        }

        if ($request->hasFile('image')) {
            // Delete old image if it was local
            if ($group->image_url && str_contains($group->image_url, '/storage/groups/')) {
                $oldPath = str_replace('/storage/', '', parse_url($group->image_url, PHP_URL_PATH));
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('groups', 'public');
            $group->image_url = url('storage/' . $path);
            $group->save();

            // Broadcast update
            event(new \App\Events\GroupUpdatedEvent($group));

            return $this->success([
                'image_url' => $group->image_url,
                'group' => $this->formatGroup($group)
            ], 'Imagen del grupo actualizada.');
        }

        return $this->error('No se ha subido ninguna imagen.', 400);
    }

    /**
     * POST /api/center/group
     * Create or get the center group chat for the authenticated user.
     */
    public function createOrGetCenterGroup(Request $request): JsonResponse
    {
        $user = $request->user();
        $centerId = $user->center_id;

        if (!$centerId) {
            return $this->error('No perteneces a ningún centro.', 403);
        }

        try {
            return DB::transaction(function () use ($user, $centerId) {
                // Find existing center group
                $group = Group::where('center_id', $centerId)->first();

                if (!$group) {
                    // Only teachers/admins can create the center group
                    if ($user->role->value !== 'teacher' && $user->role->value !== 'admin') {
                        return $this->error('Solo los profesores pueden crear el chat del centro por primera vez.', 403);
                    }

                    $centerName = $user->center->name ?? 'Centro Oficial';

                    $group = Group::create([
                        'name' => "Chat Oficial - " . $centerName,
                        'creator_id' => $user->id,
                        'center_id' => $centerId,
                        'image_url' => null,
                    ]);

                    // Get all members of the center and add them
                    $centerMembers = User::where('center_id', $centerId)->get();
                    foreach ($centerMembers as $member) {
                        $isAdmin = ($member->role->value === 'teacher' || $member->role->value === 'admin');
                        $group->members()->attach($member->id, ['is_admin' => $isAdmin]);
                        
                        // Send system message
                        $this->createSystemMessage($group->id, "se ha unido al chat del centro", $member->name);
                    }
                } else {
                    // Ensure the current user is a member of the group (for new students)
                    if (!$group->members()->where('user_id', $user->id)->exists()) {
                        $isAdmin = ($user->role->value === 'teacher' || $user->role->value === 'admin');
                        $group->members()->attach($user->id, ['is_admin' => $isAdmin]);

                        // Send system message
                        $this->createSystemMessage($group->id, "se ha unido al chat del centro", $user->name);
                        event(new GroupMemberChangedEvent($group, clone $user, 'added'));
                    }
                }

                $group->load('members');

                return $this->success([
                    'group' => $this->formatGroup($group)
                ], 'Chat del centro listo.');
            });
        } catch (Throwable $e) {
            Log::error('Error al acceder al chat del centro: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'center_id' => $centerId,
                'trace' => $e->getTraceAsString()
            ]);
            return $this->error('Error al acceder al chat del centro: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Format group for consistent API response.
     */
    private function formatGroup(Group $group): array
    {
        return [
            'id' => $group->id,
            'name' => $group->name,
            'image_url' => $group->image_url,
            'creator_id' => $group->creator_id,
            'center_id' => $group->center_id,
            'members' => $group->members->map(function ($m) {
                return [
                    'id' => $m->id,
                    'name' => $m->name,
                    'username' => $m->username,
                    'avatar' => $m->avatar,
                    'is_admin' => (bool)$m->pivot->is_admin,
                ];
            }),
            'members_count' => $group->members()->count(),
            'created_at' => $group->created_at,
        ];
    }
}
