<?php

namespace App\Events;

use App\Models\CenterRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CenterRequestCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly CenterRequest $centerRequest
    ) {}

    /**
     * Broadcast to the admin channel.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('admin'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'admin.new_request';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->centerRequest->id,
            'user' => [
                'id' => $this->centerRequest->user->id,
                'name' => $this->centerRequest->user->name,
                'username' => $this->centerRequest->user->username,
            ],
            'center_name' => $this->centerRequest->center_name,
            'domain' => $this->centerRequest->domain,
            'created_at' => $this->centerRequest->created_at->toISOString(),
        ];
    }
}
