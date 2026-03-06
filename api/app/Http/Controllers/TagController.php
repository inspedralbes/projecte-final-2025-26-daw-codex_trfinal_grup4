<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/tags
     * List all tags with post count.
     * If authenticated, includes user's follow status.
     */
    public function index(Request $request): JsonResponse
    {
        $tags = Tag::withCount('posts')
            ->orderByDesc('posts_count')
            ->get();

        $authUser = auth('sanctum')->user();
        $followedTagIds = $authUser
            ? $authUser->followedTags()->pluck('tags.id')->toArray()
            : [];

        $result = $tags->map(fn ($tag) => [
            'id'          => $tag->id,
            'name'        => $tag->name,
            'slug'        => $tag->slug,
            'color'       => $tag->color,
            'posts_count' => $tag->posts_count,
            'is_following' => in_array($tag->id, $followedTagIds),
        ]);

        return $this->success($result);
    }

    /**
     * GET /api/center/tags
     * List tags used within the authenticated user's center.
     */
    public function centerTags(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->center_id) {
            return $this->error('You are not associated with any center', 403);
        }

        if ($user->isCenterBlocked()) {
            return $this->error('You have been blocked from accessing your center hub.', 403);
        }

        $followedTagIds = $user->followedTags()->pluck('tags.id')->toArray();

        $tags = Tag::whereHas('posts', fn ($q) => $q->where('center_id', $user->center_id))
            ->withCount(['posts' => fn ($q) => $q->where('center_id', $user->center_id)])
            ->orderByDesc('posts_count')
            ->get()
            ->map(fn ($tag) => [
                'id'          => $tag->id,
                'name'        => $tag->name,
                'slug'        => $tag->slug,
                'color'       => $tag->color,
                'posts_count' => $tag->posts_count,
                'is_following' => in_array($tag->id, $followedTagIds),
            ]);

        return $this->success($tags, 'Center tags retrieved successfully');
    }

    /**
     * POST /api/tags/{tag}/follow
     * Toggle follow/unfollow a tag.
     */
    public function toggleFollow(Request $request, Tag $tag): JsonResponse
    {
        $user = $request->user();

        $notify = $request->input('notify', false);

        if ($user->followedTags()->where('tag_id', $tag->id)->exists()) {
            $user->followedTags()->detach($tag->id);

            return $this->success([
                'following' => false,
                'tag'       => $tag->slug,
            ], 'Tag unfollowed');
        }

        $user->followedTags()->attach($tag->id, ['notify' => $notify]);

        return $this->success([
            'following' => true,
            'notify'    => $notify,
            'tag'       => $tag->slug,
        ], 'Tag followed', 201);
    }

    /**
     * PATCH /api/tags/{tag}/notify
     * Toggle notifications for a followed tag.
     */
    public function toggleNotify(Request $request, Tag $tag): JsonResponse
    {
        $user = $request->user();

        $pivot = $user->followedTags()->where('tag_id', $tag->id)->first();

        if (!$pivot) {
            return $this->error('You are not following this tag', 422);
        }

        $newNotify = !$pivot->pivot->notify;
        $user->followedTags()->updateExistingPivot($tag->id, ['notify' => $newNotify]);

        return $this->success([
            'notify' => $newNotify,
            'tag'    => $tag->slug,
        ], $newNotify ? 'Notifications enabled' : 'Notifications disabled');
    }

    /**
     * GET /api/tags/followed
     * List tags the authenticated user is following.
     */
    public function followed(Request $request): JsonResponse
    {
        $user = $request->user();

        $tags = $user->followedTags()
            ->withCount('posts')
            ->get()
            ->map(fn ($tag) => [
                'id'          => $tag->id,
                'name'        => $tag->name,
                'slug'        => $tag->slug,
                'color'       => $tag->color,
                'posts_count' => $tag->posts_count,
                'notify'      => (bool) $tag->pivot->notify,
            ]);

        return $this->success($tags);
    }
}
