<?php

namespace App\Services;

use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ChatService
{
    /**
     * Check if two users follow each other mutually.
     */
    public function areMutualFollowers(int $userId1, int $userId2): bool
    {
        // Check if user1 follows user2
        $user1FollowsUser2 = DB::table('follows')
            ->where('follower_id', $userId1)
            ->where('followed_id', $userId2)
            ->exists();

        // Check if user2 follows user1
        $user2FollowsUser1 = DB::table('follows')
            ->where('follower_id', $userId2)
            ->where('followed_id', $userId1)
            ->exists();

        return $user1FollowsUser2 && $user2FollowsUser1;
    }

    /**
     * Check if the sender can send a message to the receiver.
     * Rules:
     * - If mutual followers: unlimited messages
     * - If not mutual followers: only 1 message allowed from sender to receiver
     */
    public function canSendMessage(User $sender, User $receiver): array
    {
        // Users can't message themselves
        if ($sender->id === $receiver->id) {
            return [
                'can_send' => false,
                'reason' => 'cannot_message_self',
                'is_mutual' => false,
            ];
        }

        $isMutual = $this->areMutualFollowers($sender->id, $receiver->id);

        if ($isMutual) {
            return [
                'can_send' => true,
                'reason' => 'mutual_followers',
                'is_mutual' => true,
            ];
        }

        // Check if user has already sent a message to this receiver
        $existingMessage = ChatMessage::query()
            ->where('sender_id', $sender->id)
            ->where('receiver_id', $receiver->id)
            ->exists();

        if ($existingMessage) {
            return [
                'can_send' => false,
                'reason' => 'message_limit_reached',
                'is_mutual' => false,
            ];
        }

        return [
            'can_send' => true,
            'reason' => 'first_message_allowed',
            'is_mutual' => false,
        ];
    }

    /**
     * Get the conversation relationship status between two users.
     */
    public function getConversationStatus(User $currentUser, User $otherUser): array
    {
        $isMutual = $this->areMutualFollowers($currentUser->id, $otherUser->id);

        // Count messages from current user to other
        $sentCount = ChatMessage::query()
            ->where('sender_id', $currentUser->id)
            ->where('receiver_id', $otherUser->id)
            ->count();

        // Count messages from other user to current
        $receivedCount = ChatMessage::query()
            ->where('sender_id', $otherUser->id)
            ->where('receiver_id', $currentUser->id)
            ->count();

        $canSend = $this->canSendMessage($currentUser, $otherUser);

        return [
            'is_mutual' => $isMutual,
            'can_send' => $canSend['can_send'],
            'restriction_reason' => $canSend['can_send'] ? null : $canSend['reason'],
            'sent_count' => $sentCount,
            'received_count' => $receivedCount,
            'total_messages' => $sentCount + $receivedCount,
        ];
    }

    /**
     * Get all conversations for a user (grouped by conversation partner).
     */
    public function getConversations(User $user): array
    {
        // Get all users this user has exchanged messages with
        $conversationPartners = ChatMessage::query()
            ->where(function ($q) use ($user) {
                $q->where('sender_id', $user->id)
                  ->orWhere('receiver_id', $user->id);
            })
            ->select(DB::raw('
                CASE 
                    WHEN sender_id = ' . $user->id . ' THEN receiver_id 
                    ELSE sender_id 
                END as partner_id
            '))
            ->distinct()
            ->pluck('partner_id');

        $conversations = [];

        foreach ($conversationPartners as $partnerId) {
            $partner = User::find($partnerId);
            if (!$partner) continue;

            // Get last message
            $lastMessage = ChatMessage::query()
                ->where(function ($q) use ($user, $partnerId) {
                    $q->where(function ($q2) use ($user, $partnerId) {
                        $q2->where('sender_id', $user->id)
                           ->where('receiver_id', $partnerId);
                    })->orWhere(function ($q2) use ($user, $partnerId) {
                        $q2->where('sender_id', $partnerId)
                           ->where('receiver_id', $user->id);
                    });
                })
                ->orderBy('created_at', 'desc')
                ->first();

            // Get unread count
            $unreadCount = ChatMessage::query()
                ->where('sender_id', $partnerId)
                ->where('receiver_id', $user->id)
                ->where('is_read', false)
                ->count();

            $status = $this->getConversationStatus($user, $partner);

            $conversations[] = [
                'partner' => [
                    'id' => $partner->id,
                    'name' => $partner->name,
                    'username' => $partner->username,
                    'avatar' => $partner->avatar,
                    'role' => $partner->role,
                ],
                'last_message' => $lastMessage ? [
                    'id' => $lastMessage->id,
                    'content' => $lastMessage->content,
                    'sender_id' => $lastMessage->sender_id,
                    'created_at' => $lastMessage->created_at->toISOString(),
                    'is_read' => $lastMessage->is_read,
                ] : null,
                'unread_count' => $unreadCount,
                'is_mutual' => $status['is_mutual'],
                'can_send' => $status['can_send'],
            ];
        }

        // Sort by last message date (most recent first)
        usort($conversations, function ($a, $b) {
            $aTime = $a['last_message']['created_at'] ?? '1970-01-01';
            $bTime = $b['last_message']['created_at'] ?? '1970-01-01';
            return $bTime <=> $aTime;
        });

        return $conversations;
    }

    /**
     * Get messages between two users.
     */
    public function getMessages(User $currentUser, User $otherUser, int $limit = 50, ?int $beforeId = null): array
    {
        $query = ChatMessage::query()
            ->where(function ($q) use ($currentUser, $otherUser) {
                $q->where(function ($q2) use ($currentUser, $otherUser) {
                    $q2->where('sender_id', $currentUser->id)
                       ->where('receiver_id', $otherUser->id);
                })->orWhere(function ($q2) use ($currentUser, $otherUser) {
                    $q2->where('sender_id', $otherUser->id)
                       ->where('receiver_id', $currentUser->id);
                });
            });

        if ($beforeId) {
            $query->where('id', '<', $beforeId);
        }

        $messages = $query
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();

        return $messages->map(function ($msg) use ($currentUser) {
            return [
                'id' => $msg->id,
                'content' => $msg->content,
                'sender_id' => $msg->sender_id,
                'receiver_id' => $msg->receiver_id,
                'is_own' => $msg->sender_id === $currentUser->id,
                'is_read' => $msg->is_read,
                'created_at' => $msg->created_at->toISOString(),
            ];
        })->toArray();
    }

    /**
     * Mark messages as read.
     */
    public function markAsRead(User $currentUser, User $sender): int
    {
        return ChatMessage::query()
            ->where('sender_id', $sender->id)
            ->where('receiver_id', $currentUser->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);
    }

    /**
     * Get total unread messages count for a user.
     */
    public function getUnreadCount(User $user): int
    {
        return ChatMessage::query()
            ->where('receiver_id', $user->id)
            ->where('is_read', false)
            ->count();
    }
}
