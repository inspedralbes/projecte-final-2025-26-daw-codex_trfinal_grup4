<?php

namespace App\Events;

use App\Models\Interaction;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewInteractionEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Interaction $interaction
    ) {}

    /**
     * Broadcast to the owner of the interacted resource.
     * E.g., if someone likes a post, the post author gets notified.
     */
    public function broadcastOn(): array
    {
        $ownerId = $this->getResourceOwnerId();
        $performerId = $this->interaction->user_id;

        $channels = [new Channel('user.' . $ownerId)];
        
        // Always include performer to sync tabs/sessions
        if ($performerId !== $ownerId) {
            $channels[] = new Channel('user.' . $performerId);
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'new.interaction';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id'                => $this->interaction->id,
            'type'              => $this->interaction->type,
            'interactable_type' => class_basename($this->interaction->interactable_type),
            'interactable_id'   => $this->interaction->interactable_id,
            'created_at'        => $this->interaction->created_at->toISOString(),
            'user'              => [
                'id'       => $this->interaction->user->id,
                'name'     => $this->interaction->user->name,
                'username' => $this->interaction->user->username,
                'avatar'   => $this->interaction->user->avatar,
            ],
        ];
    }

    /**
     * Resolve the owner (author) of the interacted resource.
     */
    private function getResourceOwnerId(): int
    {
        $resource = $this->interaction->interactable;

        return $resource->user_id ?? $resource->id;
    }
}
