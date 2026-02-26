<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewMessageEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly ChatMessage $message,
        public readonly bool $isMutual = false
    ) {}

    /**
     * Get the channels the event should broadcast on.
     * Broadcasts to both sender and receiver's personal channels.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('user.' . $this->message->receiver_id),
            new Channel('chat.' . $this->getChatRoomId()),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'new.message';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $sender = $this->message->sender;

        return [
            'id' => $this->message->id,
            'content' => $this->message->content,
            'sender_id' => $this->message->sender_id,
            'receiver_id' => $this->message->receiver_id,
            'is_read' => $this->message->is_read,
            'created_at' => $this->message->created_at->toISOString(),
            'is_mutual' => $this->isMutual,
            'sender' => [
                'id' => $sender->id,
                'name' => $sender->name,
                'username' => $sender->username,
                'avatar' => $sender->avatar,
            ],
        ];
    }

    /**
     * Generate a consistent chat room ID for two users.
     * Always puts the smaller user ID first for consistency.
     */
    private function getChatRoomId(): string
    {
        $ids = [$this->message->sender_id, $this->message->receiver_id];
        sort($ids);
        return implode('-', $ids);
    }
}
