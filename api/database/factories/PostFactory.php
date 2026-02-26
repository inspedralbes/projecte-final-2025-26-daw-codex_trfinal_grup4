<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use App\Enums\PostType;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => PostType::News,
            'content' => $this->faker->paragraph,
            'is_solved' => false,
        ];
    }
}
