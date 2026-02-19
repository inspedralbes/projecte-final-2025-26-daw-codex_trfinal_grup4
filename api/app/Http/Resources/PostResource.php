<?php

namespace App\Http\Resources;

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
        return [
            'id'            => $this->id,
            'type'          => $this->type,
            'content'       => $this->content,
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

            // Repost – original post data
            'original_post' => $this->whenLoaded('originalPost', fn () => $this->originalPost ? [
                'id'           => $this->originalPost->id,
                'content'      => $this->originalPost->content,
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
