<?php

namespace App\Events;

use App\Models\Comment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewCommentEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Comment $comment
    ) {}

    /**
     * Get the channels the event should broadcast on.
     * Broadcasts to the post's channel so all viewers get notified.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('post.' . $this->comment->post_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'new.comment';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id'         => $this->comment->id,
            'post_id'    => $this->comment->post_id,
            'parent_id'  => $this->comment->parent_id,
            'content'    => $this->comment->content,
            'created_at' => $this->comment->created_at->toISOString(),
            'user'       => [
                'id'       => $this->comment->user->id,
                'name'     => $this->comment->user->name,
                'username' => $this->comment->user->username,
                'avatar'   => $this->comment->user->avatar,
            ],
        ];
    }
}
