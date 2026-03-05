<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PostUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_post_with_image()
    {
        Storage::fake('public');

        $user = User::factory()->create(['password' => bcrypt('password')]);

        $file = UploadedFile::fake()->image('test.jpg');

        $response = $this->actingAs($user)->postJson('/api/posts', [
            'type' => 'news',
            'content' => 'Test content',
            'image' => $file,
        ]);

        $response->assertStatus(201);
        
        $post = Post::first();
        $this->assertNotNull($post->image_url);
        Storage::disk('public')->assertExists($post->image_url);
    }

    public function test_can_toggle_like_without_error()
    {
        $user1 = User::factory()->create(['password' => bcrypt('password')]);
        $user2 = User::factory()->create(['password' => bcrypt('password')]);

        $post = Post::create([
            'user_id' => $user2->id,
            'type' => 'news',
            'content' => 'Test content'
        ]);

        $response = $this->actingAs($user1)->postJson('/api/interactions', [
            'interactable_type' => 'post',
            'interactable_id' => $post->id,
            'type' => 'like',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('interactions', [
            'user_id' => $user1->id,
            'interactable_id' => $post->id,
            'type' => 'like',
        ]);
        
        $this->assertDatabaseHas('notifications', [
            'user_id' => $user2->id,
            'type' => 'like'
        ]);
    }
}
