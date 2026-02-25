<?php

namespace Database\Factories;

use App\Models\Interaction;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class InteractionFactory extends Factory
{
    protected $model = Interaction::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'interactable_id' => Post::factory(),
            'interactable_type' => Post::class,
            'type' => 'like',
        ];
    }
}
