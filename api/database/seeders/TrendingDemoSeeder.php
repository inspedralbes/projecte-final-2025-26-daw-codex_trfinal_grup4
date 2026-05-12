<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Interaction;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TrendingDemoSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $users = User::query()->take(20)->get();
        if ($users->count() < 10) {
            User::factory()->count(10 - $users->count())->create();
            $users = User::query()->take(20)->get();
        }

        $posts = Post::query()->whereNull('center_id')->latest()->take(20)->get();
        if ($posts->count() < 10) {
            $newPosts = Post::factory()->count(12)->create([
                'center_id' => null,
            ]);
            $posts = $posts->merge($newPosts);
        }

        foreach ($posts as $post) {
            $likeUsers = $users->random(min(6, $users->count()));
            foreach ($likeUsers as $user) {
                DB::table('likes')->updateOrInsert(
                    ['user_id' => $user->id, 'post_id' => $post->id],
                    ['created_at' => $now]
                );
                Interaction::firstOrCreate([
                    'user_id' => $user->id,
                    'interactable_type' => Post::class,
                    'interactable_id' => $post->id,
                    'type' => 'like',
                ]);
            }

            $bookmarkUsers = $users->random(min(4, $users->count()));
            foreach ($bookmarkUsers as $user) {
                DB::table('bookmarks')->updateOrInsert(
                    ['user_id' => $user->id, 'post_id' => $post->id],
                    ['created_at' => $now]
                );
                Interaction::firstOrCreate([
                    'user_id' => $user->id,
                    'interactable_type' => Post::class,
                    'interactable_id' => $post->id,
                    'type' => 'bookmark',
                ]);
            }

            $commentCount = random_int(1, 4);
            for ($i = 0; $i < $commentCount; $i += 1) {
                Comment::factory()->create([
                    'post_id' => $post->id,
                    'user_id' => $users->random()->id,
                    'content' => Str::limit(fake()->paragraph, 160),
                ]);
            }
        }
    }
}
