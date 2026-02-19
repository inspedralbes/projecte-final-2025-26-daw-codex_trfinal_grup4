<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewNotificationEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Notification $notification
    ) {}

    /**
     * Broadcast to the recipient's personal channel.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('user.' . $this->notification->user_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'new.notification';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id'         => $this->notification->id,
            'type'       => $this->notification->type,
            'message'    => $this->notification->message,
            'read_at'    => null,
            'created_at' => $this->notification->created_at->toISOString(),
            'sender'     => [
                'id'       => $this->notification->sender->id,
                'name'     => $this->notification->sender->name,
                'username' => $this->notification->sender->username,
                'avatar'   => $this->notification->sender->avatar,
            ],
            'notifiable' => [
                'type' => class_basename($this->notification->notifiable_type),
                'id'   => $this->notification->notifiable_id,
            ],
        ];
    }
}
