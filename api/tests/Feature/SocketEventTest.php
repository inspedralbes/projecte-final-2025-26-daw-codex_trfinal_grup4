<?php

namespace Tests\Feature;

use App\Events\InteractionRemoved;
use App\Events\PostDeleted;
use App\Events\ProfileUpdatedEvent;
use App\Models\Post;
use App\Models\User;
use App\Models\Interaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class SocketEventTest extends TestCase
{
    use RefreshDatabase;

    public function test_post_deletion_dispatches_post_deleted_event(): void
    {
        Event::fake([PostDeleted::class]);

        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->deleteJson("/api/posts/{$post->id}");

        $response->assertStatus(200);
        Event::assertDispatched(PostDeleted::class, function ($event) use ($post, $user) {
            return $event->postId === $post->id && $event->userId === $user->id;
        });
    }

    public function test_removing_like_dispatches_interaction_removed_event(): void
    {
        Event::fake([InteractionRemoved::class]);

        $user = User::factory()->create();
        $post = Post::factory()->create();
        
        // Add like
        $this->actingAs($user)->postJson("/api/interactions", [
            'interactable_type' => 'post',
            'interactable_id' => $post->id,
            'type' => 'like'
        ]);

        // Remove like (toggle)
        $response = $this->actingAs($user)->postJson("/api/interactions", [
            'interactable_type' => 'post',
            'interactable_id' => $post->id,
            'type' => 'like'
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.active', false);
        
        Event::assertDispatched(InteractionRemoved::class, function ($event) use ($user, $post) {
            return $event->userId === $user->id && 
                   $event->interactableId === $post->id && 
                   $event->type === 'like';
        });
    }

    public function test_follow_unfollow_dispatches_profile_updated_event(): void
    {
        Event::fake([ProfileUpdatedEvent::class]);

        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        // Follow
        $response = $this->actingAs($user)->postJson("/api/users/{$otherUser->id}/follow");
        $response->assertStatus(201);
        
        // Should dispatch twice: one for follower, one for followed
        Event::assertDispatched(ProfileUpdatedEvent::class, 2);

        // Unfollow
        $response = $this->actingAs($user)->postJson("/api/users/{$otherUser->id}/follow");
        $response->assertStatus(200);
        
        Event::assertDispatched(ProfileUpdatedEvent::class, 4);
    }
}
