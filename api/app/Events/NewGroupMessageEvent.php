<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewGroupMessageEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly ChatMessage $message
    ) {}

    /**
     * Get the channels the event should broadcast on.
     * Broadcasts to the group channel.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('group.' . $this->message->group_id),
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
            'group_id' => $this->message->group_id,
            'type' => $this->message->type ?? 'text',
            'created_at' => $this->message->created_at->toISOString(),
            'sender' => $sender ? [
                'id' => $sender->id,
                'name' => $sender->name,
                'username' => $sender->username,
                'avatar' => $sender->avatar,
            ] : null,
        ];
    }
}
