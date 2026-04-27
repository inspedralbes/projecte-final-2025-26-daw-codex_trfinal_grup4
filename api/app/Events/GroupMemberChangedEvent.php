<?php

namespace App\Events;

use App\Models\Group;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupMemberChangedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param Group $group The group where the change happened
     * @param User $user The user who was added/removed
     * @param string $action 'added', 'removed', or 'left'
     */
    public function __construct(
        public readonly Group $group,
        public readonly User $user,
        public readonly string $action
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            new Channel('group.' . $this->group->id),
            new Channel('user.' . $this->user->id), // Notify the user directly
        ];

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'group.member_changed';
    }

    public function broadcastWith(): array
    {
        return [
            'group_id' => $this->group->id,
            'action' => $this->action,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'username' => $this->user->username,
                'avatar' => $this->user->avatar,
            ],
            'is_admin' => $this->group->members()->where('user_id', $this->user->id)->first()?->pivot?->is_admin ?? false,
            'members_count' => $this->group->members()->count(),
        ];
    }
}
