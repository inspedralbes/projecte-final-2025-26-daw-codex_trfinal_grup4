<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Center;
use App\Models\CenterRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthCenterFlowTest extends TestCase
{
    use RefreshDatabase;

    /* ================================================================== */
    /*  Issue 1: Admin should never see center creation prompt             */
    /* ================================================================== */

    public function test_admin_login_does_not_trigger_center_prompt(): void
    {
        $admin = User::factory()->admin()->create([
            'email'             => 'admin@codex.com',
            'email_verified_at' => now(),
            'password'          => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'admin@codex.com',
            'password' => 'password',
        ]);

        $response->assertOk();
        $data = $response->json('data');

        $this->assertFalse($data['center_check']['needs_center_prompt']);
    }

    public function test_admin_me_does_not_trigger_center_prompt(): void
    {
        $admin = User::factory()->admin()->create([
            'email'             => 'admin@codex.com',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->getJson('/api/me');

        $response->assertOk();
        $data = $response->json('data');

        $this->assertFalse($data['center_check']['needs_center_prompt']);
    }

    /* ================================================================== */
    /*  Issue 2: Normal login returns center_check with prompt             */
    /* ================================================================== */

    public function test_normal_login_returns_center_check_with_prompt(): void
    {
        $user = User::factory()->create([
            'email'                   => 'student@inspedralbes.cat',
            'email_verified_at'       => now(),
            'password'                => bcrypt('password'),
            'center_id'               => null,
            'center_prompt_dismissed'  => false,
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'student@inspedralbes.cat',
            'password' => 'password',
        ]);

        $response->assertOk();
        $data = $response->json('data');

        // Non-generic email, no center, not dismissed → should show prompt
        $this->assertTrue($data['center_check']['needs_center_prompt']);
        $this->assertFalse($data['center_check']['is_generic_email']);
        $this->assertFalse($data['center_check']['has_center']);
    }

    public function test_normal_login_no_prompt_for_generic_email(): void
    {
        $user = User::factory()->create([
            'email'             => 'student@gmail.com',
            'email_verified_at' => now(),
            'password'          => bcrypt('password'),
            'center_id'         => null,
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'student@gmail.com',
            'password' => 'password',
        ]);

        $response->assertOk();
        $data = $response->json('data');

        // Generic email → no prompt
        $this->assertFalse($data['center_check']['needs_center_prompt']);
        $this->assertTrue($data['center_check']['is_generic_email']);
    }

    public function test_normal_login_no_prompt_if_already_has_center(): void
    {
        $center = Center::create([
            'name'   => 'Institut Pedralbes',
            'domain' => 'inspedralbes.cat',
            'status' => 'active',
        ]);

        $user = User::factory()->student($center->id)->create([
            'email'             => 'student@inspedralbes.cat',
            'email_verified_at' => now(),
            'password'          => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'student@inspedralbes.cat',
            'password' => 'password',
        ]);

        $response->assertOk();
        $data = $response->json('data');

        // Has center → no prompt
        $this->assertFalse($data['center_check']['needs_center_prompt']);
        $this->assertTrue($data['center_check']['has_center']);
    }

    public function test_normal_login_no_prompt_if_dismissed(): void
    {
        $user = User::factory()->create([
            'email'                   => 'student@inspedralbes.cat',
            'email_verified_at'       => now(),
            'password'                => bcrypt('password'),
            'center_id'               => null,
            'center_prompt_dismissed'  => true,
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'student@inspedralbes.cat',
            'password' => 'password',
        ]);

        $response->assertOk();
        $data = $response->json('data');

        // Dismissed → no prompt
        $this->assertFalse($data['center_check']['needs_center_prompt']);
    }

    /* ================================================================== */
    /*  Issue 3: Email verification blocks write actions                    */
    /* ================================================================== */

    public function test_unverified_user_cannot_create_post(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => null, // NOT verified
        ]);

        $response = $this->actingAs($user)->postJson('/api/posts', [
            'type'    => 'news',
            'content' => 'Test post from unverified user',
        ]);

        $response->assertStatus(403);
        $this->assertFalse($response->json('email_verified'));
    }

    public function test_unverified_user_cannot_create_comment(): void
    {
        $verified = User::factory()->create(['email_verified_at' => now()]);

        $post = \App\Models\Post::create([
            'user_id' => $verified->id,
            'type'    => 'news',
            'content' => 'A verified post',
        ]);

        $unverified = User::factory()->create([
            'email_verified_at' => null,
        ]);

        $response = $this->actingAs($unverified)->postJson('/api/comments', [
            'post_id' => $post->id,
            'content' => 'Comment from unverified',
        ]);

        $response->assertStatus(403);
        $this->assertFalse($response->json('email_verified'));
    }

    public function test_unverified_user_cannot_send_chat_message(): void
    {
        $unverified = User::factory()->create(['email_verified_at' => null]);
        $other = User::factory()->create(['email_verified_at' => now()]);

        $response = $this->actingAs($unverified)->postJson('/api/chat/messages', [
            'receiver_id' => $other->id,
            'content'     => 'Hello',
        ]);

        $response->assertStatus(403);
        $this->assertFalse($response->json('email_verified'));
    }

    public function test_verified_user_can_create_post(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->postJson('/api/posts', [
            'type'    => 'news',
            'content' => 'Test post from verified user',
        ]);

        $response->assertStatus(201);
    }

    public function test_unverified_user_can_still_read_notifications(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $response = $this->actingAs($user)->getJson('/api/notifications');

        // Read-only routes don't require verification
        $response->assertOk();
    }

    public function test_unverified_user_can_still_access_me(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $response = $this->actingAs($user)->getJson('/api/me');

        $response->assertOk();
    }

    /* ================================================================== */
    /*  Issue 4: Existing domain users assigned on center approval         */
    /* ================================================================== */

    public function test_existing_users_assigned_to_center_on_approval(): void
    {
        $admin = User::factory()->admin()->create(['email_verified_at' => now()]);

        // Pre-existing users with the same domain, no center
        $existingUser1 = User::factory()->create([
            'email'             => 'alice@inspedralbes.cat',
            'email_verified_at' => now(),
            'center_id'         => null,
            'role'              => 'userNormal',
        ]);

        $existingUser2 = User::factory()->create([
            'email'             => 'bob@inspedralbes.cat',
            'email_verified_at' => now(),
            'center_id'         => null,
            'role'              => 'userNormal',
        ]);

        // User with different domain (should NOT be affected)
        $otherUser = User::factory()->create([
            'email'             => 'charlie@gmail.com',
            'email_verified_at' => now(),
            'center_id'         => null,
            'role'              => 'userNormal',
        ]);

        // The requester who will become teacher
        $requester = User::factory()->create([
            'email'             => 'teacher@inspedralbes.cat',
            'email_verified_at' => now(),
            'center_id'         => null,
            'role'              => 'userNormal',
        ]);

        // Create center request
        $centerRequest = CenterRequest::create([
            'user_id'       => $requester->id,
            'center_name'   => 'Institut Pedralbes',
            'domain'        => 'inspedralbes.cat',
            'full_name'     => 'Prof. Teacher',
            'city'          => 'Barcelona',
            'justificante'  => 'uploads/test_justificante.pdf',
            'status'        => 'pending',
        ]);

        // Admin approves
        $response = $this->actingAs($admin)->patchJson(
            "/api/center-requests/{$centerRequest->id}/approve",
            ['admin_notes' => 'Approved for testing']
        );

        $response->assertOk();

        // Requester → teacher of the center
        $requester->refresh();
        $this->assertNotNull($requester->center_id);
        $this->assertEquals('teacher', $requester->role->value);

        // Existing users with same domain → student of the center
        $existingUser1->refresh();
        $this->assertEquals($requester->center_id, $existingUser1->center_id);
        $this->assertEquals('student', $existingUser1->role->value);

        $existingUser2->refresh();
        $this->assertEquals($requester->center_id, $existingUser2->center_id);
        $this->assertEquals('student', $existingUser2->role->value);

        // User with different domain → unchanged
        $otherUser->refresh();
        $this->assertNull($otherUser->center_id);
        $this->assertEquals('userNormal', $otherUser->role->value);
    }

    public function test_admin_users_not_assigned_to_center_on_approval(): void
    {
        $admin = User::factory()->admin()->create([
            'email'             => 'admin@inspedralbes.cat',
            'email_verified_at' => now(),
        ]);

        $requester = User::factory()->create([
            'email'             => 'teacher@inspedralbes.cat',
            'email_verified_at' => now(),
            'center_id'         => null,
            'role'              => 'userNormal',
        ]);

        $centerRequest = CenterRequest::create([
            'user_id'       => $requester->id,
            'center_name'   => 'Institut Pedralbes',
            'domain'        => 'inspedralbes.cat',
            'full_name'     => 'Prof. Teacher',
            'justificante'  => 'uploads/test_justificante.pdf',
            'status'        => 'pending',
        ]);

        $response = $this->actingAs($admin)->patchJson(
            "/api/center-requests/{$centerRequest->id}/approve"
        );

        $response->assertOk();

        // Admin should NOT be assigned to the center
        $admin->refresh();
        $this->assertNull($admin->center_id);
        $this->assertEquals('admin', $admin->role->value);
    }
}
