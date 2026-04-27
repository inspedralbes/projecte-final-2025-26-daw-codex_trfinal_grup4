<?php

namespace App\Events;

use App\Models\Group;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupUpdatedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Group $group
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('group.' . $this->group->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'group.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->group->id,
            'name' => $this->group->name,
            'image_url' => $this->group->image_url,
        ];
    }
}
