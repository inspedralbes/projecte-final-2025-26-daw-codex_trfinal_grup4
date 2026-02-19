<?php

namespace App\Services;

use App\Events\NewNotificationEvent;
use App\Models\Notification;

class NotificationService
{
    /**
     * Create a notification (won't notify yourself).
     * Persists to DB and broadcasts via Redis for real-time delivery.
     */
    public function create(
        int $userId,
        int $senderId,
        string $type,
        string $notifiableType,
        int $notifiableId,
        ?string $message = null
    ): ?Notification {
        // Don't notify yourself
        if ($userId === $senderId) {
            return null;
        }

        $notification = Notification::create([
            'user_id'         => $userId,
            'sender_id'       => $senderId,
            'type'            => $type,
            'notifiable_type' => $notifiableType,
            'notifiable_id'   => $notifiableId,
            'message'         => $message,
        ]);

        // Load sender for broadcast payload
        $notification->load('sender');

        // Broadcast to user's private channel for real-time delivery
        broadcast(new NewNotificationEvent($notification));

        return $notification;
    }
}
