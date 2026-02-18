<?php

namespace App\Http\Controllers;

use App\Events\NewCommentEvent;
use App\Http\Requests\StoreCommentRequest;
use App\Models\Comment;
use App\Services\SanitizationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly SanitizationService $sanitizer
    ) {}

    /**
     * GET /api/posts/{postId}/comments
     * List comments for a post (threaded).
     */
    public function index(int $postId): JsonResponse
    {
        $comments = Comment::where('post_id', $postId)
            ->whereNull('parent_id') // Top-level only
            ->with(['user', 'replies.user'])
            ->latest()
            ->get()
            ->map(fn ($comment) => $this->formatComment($comment));

        return $this->success($comments);
    }

    /**
     * POST /api/comments
     * Create a new comment. Fires a broadcast event.
     */
    public function store(StoreCommentRequest $request): JsonResponse
    {
        $comment = Comment::create([
            'user_id'   => $request->user()->id,
            'post_id'   => $request->input('post_id'),
            'parent_id' => $request->input('parent_id'),
            'content'   => $this->sanitizer->sanitizeHtml($request->input('content')),
        ]);

        $comment->load('user');

        // Fire broadcast event to Redis → Socket.io picks it up
        broadcast(new NewCommentEvent($comment))->toOthers();

        return $this->success(
            $this->formatComment($comment),
            'Comment created successfully',
            201
        );
    }

    /**
     * DELETE /api/comments/{comment}
     * Delete a comment. Only the author can delete.
     */
    public function destroy(Request $request, Comment $comment): JsonResponse
    {
        if ($request->user()->id !== $comment->user_id) {
            return $this->error('Unauthorized', 403);
        }

        $comment->delete();

        return $this->success(null, 'Comment deleted successfully');
    }

    /**
     * Format a comment for the API response.
     */
    private function formatComment(Comment $comment): array
    {
        $data = [
            'id'          => $comment->id,
            'post_id'     => $comment->post_id,
            'parent_id'   => $comment->parent_id,
            'content'     => $comment->content,
            'is_solution' => $comment->is_solution,
            'created_at'  => $comment->created_at,
            'user'        => [
                'id'       => $comment->user->id,
                'name'     => $comment->user->name,
                'username' => $comment->user->username,
                'avatar'   => $comment->user->avatar,
            ],
        ];

        if ($comment->relationLoaded('replies')) {
            $data['replies'] = $comment->replies->map(fn ($reply) => $this->formatComment($reply));
        }

        return $data;
    }
}
