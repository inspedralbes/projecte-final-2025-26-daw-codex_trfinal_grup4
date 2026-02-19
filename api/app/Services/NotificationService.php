<?php

namespace App\Services;

use App\Models\Notification;

class NotificationService
{
    /**
     * Create a notification (won't notify yourself).
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

        return Notification::create([
            'user_id'         => $userId,
            'sender_id'       => $senderId,
            'type'            => $type,
            'notifiable_type' => $notifiableType,
            'notifiable_id'   => $notifiableId,
            'message'         => $message,
        ]);
    }
}
