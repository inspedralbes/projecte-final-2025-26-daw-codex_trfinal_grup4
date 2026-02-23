<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProfileUpdatedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly User $user
    ) {}

    /**
     * Broadcast on the user's profile channel.
     * Anyone viewing this profile will receive updates.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('profile.' . $this->user->id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'profile.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'user_id'         => $this->user->id,
            'name'            => $this->user->name,
            'avatar'          => $this->user->avatar,
            'bio'             => $this->user->bio,
            'followers_count' => $this->user->followers()->count(),
            'following_count' => $this->user->following()->count(),
        ];
    }
}
