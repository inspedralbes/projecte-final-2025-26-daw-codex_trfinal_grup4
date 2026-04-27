<?php

namespace App\Http\Controllers;

use App\Events\MessageReadEvent;
use App\Events\NewMessageEvent;
use App\Http\Requests\StoreMessageRequest;
use App\Models\ChatMessage;
use App\Models\User;
use App\Models\Group;
use App\Services\ChatService;
use App\Services\NotificationService;
use App\Services\SanitizationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly ChatService $chatService,
        private readonly SanitizationService $sanitization,
        private readonly NotificationService $notificationService
    ) {}

    /**
     * GET /api/chat/conversations
     * Get all conversations for the authenticated user.
     */
    public function conversations(Request $request): JsonResponse
    {
        $user = $request->user();
        $conversations = $this->chatService->getConversations($user);

        return $this->success([
            'conversations' => $conversations,
            'unread_total' => $this->chatService->getUnreadCount($user),
        ]);
    }

    /**
     * GET /api/chat/conversations/{userId}
     * Get messages with a specific user.
     */
    public function messages(Request $request, int $userId): JsonResponse
    {
        $currentUser = $request->user();
        $otherUser = User::find($userId);

        if (!$otherUser) {
            return $this->error('Usuario no encontrado.', 404);
        }

        $beforeId = $request->query('before_id');
        $limit = min((int) $request->query('limit', 50), 100);

        $messages = $this->chatService->getMessages(
            $currentUser,
            $otherUser,
            $limit,
            $beforeId ? (int) $beforeId : null
        );

        $status = $this->chatService->getConversationStatus($currentUser, $otherUser);

        // Mark messages as read
        $this->chatService->markAsRead($currentUser, $otherUser);

        return $this->success([
            'messages' => $messages,
            'partner' => [
                'id' => $otherUser->id,
                'name' => $otherUser->name,
                'username' => $otherUser->username,
                'avatar' => $otherUser->avatar,
                'role' => $otherUser->role,
            ],
            'conversation_status' => $status,
        ]);
    }

    /**
     * GET /api/chat/groups/{groupId}
     * Get messages for a specific group.
     */
    public function groupMessages(Request $request, int $groupId): JsonResponse
    {
        $user = $request->user();
        $group = Group::find($groupId);

        if (!$group) {
            return $this->error('Grupo no encontrado.', 404);
        }

        $beforeId = $request->query('before_id');
        $limit = min((int) $request->query('limit', 50), 100);

        try {
            $messages = $this->chatService->getGroupMessages(
                $user,
                $groupId,
                $limit,
                $beforeId ? (int) $beforeId : null
            );

            // Mark group as read
            $this->chatService->markGroupAsRead($user, $group->id);

            return $this->success([
                'messages' => $messages,
                'group' => [
                    'id' => $group->id,
                    'name' => $group->name,
                    'image_url' => $group->image_url,
                    'members' => $group->members->map(function ($m) {
                        return [
                            'id' => $m->id,
                            'name' => $m->name,
                            'username' => $m->username,
                            'avatar' => $m->avatar,
                            'is_admin' => (bool)$m->pivot->is_admin,
                        ];
                    }),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 403);
        }
    }

    /**
     * POST /api/chat/messages
     * Send a new message.
     */
    public function store(StoreMessageRequest $request): JsonResponse
    {
        $sender = $request->user();
        $receiverId = $request->input('receiver_id');
        $groupId = $request->input('group_id');
        $content = $request->input('content');

        // Case 1: Group Message
        if ($groupId) {
            $group = Group::find($groupId);
            if (!$group) {
                return $this->error('Grupo no encontrado.', 404);
            }

            // Verify membership
            if (!$sender->groups()->where('groups.id', $groupId)->exists()) {
                return $this->error('No perteneces a este grupo.', 403);
            }

            $sanitizedContent = $this->sanitization->sanitizeHtml($content);

            $message = ChatMessage::create([
                'sender_id' => $sender->id,
                'group_id' => $group->id,
                'content' => $sanitizedContent,
            ]);

            // Broadcast the event (skip if called from Socket P2P to avoid duplicate)
            if (!$request->hasHeader('X-Socket-P2P')) {
                event(new \App\Events\NewGroupMessageEvent($message));
            }

            $memberIds = $group->members()->pluck('users.id')->toArray();

            return $this->success([
                'message' => [
                    'id' => $message->id,
                    'content' => $message->content,
                    'sender_id' => $message->sender_id,
                    'group_id' => $message->group_id,
                    'is_own' => true,
                    'created_at' => $message->created_at->toISOString(),
                    'sender' => [
                        'id' => $sender->id,
                        'name' => $sender->name,
                        'avatar' => $sender->avatar,
                    ]
                ],
                'member_ids' => $memberIds
            ], 'Mensaje enviado al grupo.', 201);
        }

        // Case 2: Private Message
        $receiver = User::find($receiverId);
        if (!$receiver) {
            return $this->error('Usuario destinatario no encontrado.', 404);
        }

        // Check if user can send
        $canSend = $this->chatService->canSendMessage($sender, $receiver);

        if (!$canSend['can_send']) {
            $errorMessages = [
                'cannot_message_self' => 'No puedes enviarte mensajes a ti mismo.',
                'message_limit_reached' => 'Solo puedes enviar un mensaje a usuarios que no te siguen. Espera a que te sigan para continuar la conversación.',
            ];

            return $this->error(
                $errorMessages[$canSend['reason']] ?? 'No puedes enviar este mensaje.',
                403
            );
        }

        // Sanitize content
        $sanitizedContent = $this->sanitization->sanitizeHtml($content);

        // Create message
        $message = ChatMessage::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'content' => $sanitizedContent,
            'is_read' => false,
        ]);

        // Broadcast the event (skip if called from Socket P2P to avoid duplicate)
        if (!$request->hasHeader('X-Socket-P2P')) {
            event(new NewMessageEvent($message, $canSend['is_mutual']));
        }

        // Create notification for the receiver
        $this->notificationService->create(
            userId: $receiver->id,
            senderId: $sender->id,
            type: 'message',
            notifiableType: ChatMessage::class,
            notifiableId: $message->id,
            message: 'te ha enviado un mensaje'
        );

        return $this->success([
            'message' => [
                'id' => $message->id,
                'content' => $message->content,
                'sender_id' => $message->sender_id,
                'receiver_id' => $message->receiver_id,
                'is_own' => true,
                'is_read' => $message->is_read,
                'created_at' => $message->created_at->toISOString(),
            ],
            'is_mutual' => $canSend['is_mutual'],
        ], 'Mensaje enviado correctamente.', 201);
    }

    /**
     * POST /api/chat/conversations/{userId}/read
     * Mark all messages from a user as read.
     */
    public function markAsRead(Request $request, int $userId): JsonResponse
    {
        $currentUser = $request->user();
        $sender = User::find($userId);

        if (!$sender) {
            return $this->error('Usuario no encontrado.', 404);
        }

        $count = $this->chatService->markAsRead($currentUser, $sender);

        if ($count > 0) {
            event(new MessageReadEvent($currentUser->id, $sender->id, $count));
        }

        return $this->success([
            'messages_read' => $count,
        ]);
    }

    /**
     * GET /api/chat/unread
     * Get unread messages count.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = $this->chatService->getUnreadCount($request->user());

        return $this->success([
            'unread_count' => $count,
        ]);
    }

    /**
     * GET /api/chat/can-message/{userId}
     * Check if the current user can message another user.
     */
    public function canMessage(Request $request, int $userId): JsonResponse
    {
        $currentUser = $request->user();
        $targetUser = User::find($userId);

        if (!$targetUser) {
            return $this->error('Usuario no encontrado.', 404);
        }

        $status = $this->chatService->getConversationStatus($currentUser, $targetUser);
        $canSend = $this->chatService->canSendMessage($currentUser, $targetUser);

        return $this->success([
            'can_send' => $canSend['can_send'],
            'is_mutual' => $status['is_mutual'],
            'restriction_reason' => $canSend['can_send'] ? null : $canSend['reason'],
            'user' => [
                'id' => $targetUser->id,
                'name' => $targetUser->name,
                'username' => $targetUser->username,
                'avatar' => $targetUser->avatar,
            ],
        ]);
    }

    /**
     * GET /api/chat/search-users
     * Search users to start a conversation.
     */
    public function searchUsers(Request $request): JsonResponse
    {
        $query = $request->query('q', '');
        $currentUser = $request->user();

        if (strlen($query) < 2) {
            return $this->success(['users' => []]);
        }

        $users = User::query()
            ->where('id', '!=', $currentUser->id)
            ->where('role', '!=', 'admin')
            ->where(function ($q) use ($query) {
                $q->where('username', 'like', "%{$query}%")
                  ->orWhere('name', 'like', "%{$query}%");
            })
            ->select(['id', 'name', 'username', 'avatar', 'role'])
            ->limit(10)
            ->get()
            ->map(function ($user) use ($currentUser) {
                $canSend = $this->chatService->canSendMessage($currentUser, $user);
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'avatar' => $user->avatar,
                    'role' => $user->role,
                    'can_message' => $canSend['can_send'],
                    'is_mutual' => $canSend['is_mutual'],
                ];
            });

        return $this->success(['users' => $users]);
    }
}
