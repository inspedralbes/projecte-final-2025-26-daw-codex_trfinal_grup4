<?php

namespace App\Http\Resources;

use App\Models\Interaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Check if current user has liked/bookmarked this post
        $user = auth('sanctum')->user();
        $userLiked = false;
        $userBookmarked = false;

        if ($user) {
            $userLiked = Interaction::where('user_id', $user->id)
                ->where('interactable_type', \App\Models\Post::class)
                ->where('interactable_id', $this->id)
                ->where('type', 'like')
                ->exists();

            $userBookmarked = Interaction::where('user_id', $user->id)
                ->where('interactable_type', \App\Models\Post::class)
                ->where('interactable_id', $this->id)
                ->where('type', 'bookmark')
                ->exists();
        }

        return [
            'id'            => $this->id,
            'type'          => $this->type,
            'content'       => $this->content,
            'image_url'     => $this->image_url ? \Illuminate\Support\Facades\Storage::url($this->image_url) : null,
            'code_snippet'  => $this->code_snippet,
            'code_language' => $this->code_language,
            'is_solved'     => $this->is_solved,
            'created_at'    => $this->created_at,
            'updated_at'    => $this->updated_at,

            // Relations (loaded conditionally)
            'user'    => $this->whenLoaded('user', fn () => [
                'id'       => $this->user->id,
                'name'     => $this->user->name,
                'username' => $this->user->username,
                'avatar'   => $this->user->avatar,
            ]),
            'center'  => $this->whenLoaded('center', fn () => [
                'id'   => $this->center->id,
                'name' => $this->center->name,
            ]),
            'tags'    => $this->whenLoaded('tags', fn () => $this->tags->map(fn ($tag) => [
                'id'    => $tag->id,
                'name'  => $tag->name,
                'slug'  => $tag->slug,
                'color' => $tag->color,
            ])),

            // Counts
            'likes_count'    => $this->whenCounted('likedByUsers'),
            'comments_count' => $this->whenCounted('comments'),
            'bookmarks_count'=> $this->whenCounted('bookmarkedByUsers'),
            'reposts_count'  => $this->whenCounted('reposts'),

            // User interaction status
            'user_liked'     => $userLiked,
            'user_bookmarked'=> $userBookmarked,

            // Repost – original post data
            'original_post' => $this->whenLoaded('originalPost', fn () => $this->originalPost ? [
                'id'           => $this->originalPost->id,
                'content'      => $this->originalPost->content,
                'image_url'    => $this->originalPost->image_url ? \Illuminate\Support\Facades\Storage::url($this->originalPost->image_url) : null,
                'code_snippet' => $this->originalPost->code_snippet,
                'code_language'=> $this->originalPost->code_language,
                'type'         => $this->originalPost->type,
                'created_at'   => $this->originalPost->created_at,
                'user'         => $this->originalPost->user ? [
                    'id'       => $this->originalPost->user->id,
                    'name'     => $this->originalPost->user->name,
                    'username' => $this->originalPost->user->username,
                    'avatar'   => $this->originalPost->user->avatar,
                ] : null,
            ] : null),
            'is_repost'      => $this->original_post_id !== null,
        ];
    }
}
