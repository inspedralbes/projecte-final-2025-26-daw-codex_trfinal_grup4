<?php

namespace App\Http\Controllers;

use App\Events\NewCommentEvent;
use App\Http\Requests\StoreCommentRequest;
use App\Models\Comment;
use App\Models\Post;
use App\Services\NotificationService;
use App\Services\SanitizationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly SanitizationService $sanitizer,
        private readonly NotificationService $notificationService
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

        // Persist notification for post owner
        $post = $comment->post;
        $this->notificationService->create(
            $post->user_id,
            $request->user()->id,
            'comment',
            Post::class,
            $post->id,
            $request->user()->username . ' commented on your post'
        );

        // If replying, also notify parent comment author
        if ($comment->parent_id) {
            $parentComment = Comment::find($comment->parent_id);
            if ($parentComment) {
                $this->notificationService->create(
                    $parentComment->user_id,
                    $request->user()->id,
                    'reply',
                    Comment::class,
                    $parentComment->id,
                    $request->user()->username . ' replied to your comment'
                );
            }
        }

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
     * PUT /api/comments/{comment}
     * Update a comment. Only the author can edit.
     */
    public function update(Request $request, Comment $comment): JsonResponse
    {
        if ($request->user()->id !== $comment->user_id) {
            return $this->error('Unauthorized', 403);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        $comment->update([
            'content' => $this->sanitizer->sanitizeHtml($validated['content']),
        ]);

        $comment->load('user');

        return $this->success(
            $this->formatComment($comment),
            'Comment updated successfully'
        );
    }

    /**
     * PATCH /api/comments/{comment}/solution
     * Toggle a comment as the accepted solution for a question post.
     * Only the post author can mark a solution.
     */
    public function toggleSolution(Request $request, Comment $comment): JsonResponse
    {
        $user = $request->user();
        $post = $comment->post;

        // Only the post author can mark solutions
        if ($user->id !== $post->user_id) {
            return $this->error('Only the post author can mark a solution.', 403);
        }

        // Only question posts can have solutions
        if ($post->type->value !== 'question') {
            return $this->error('Only question posts can have accepted solutions.', 422);
        }

        // If this comment is already the solution → unmark it
        if ($comment->is_solution) {
            $comment->update(['is_solution' => false]);
            $post->update(['is_solved' => false]);

            return $this->success([
                'comment_id' => $comment->id,
                'is_solution' => false,
                'post_is_solved' => false,
            ], 'Solution unmarked');
        }

        // Unmark any previously marked solution on this post
        Comment::where('post_id', $post->id)
            ->where('is_solution', true)
            ->update(['is_solution' => false]);

        // Mark this comment as solution
        $comment->update(['is_solution' => true]);
        $post->update(['is_solved' => true]);

        return $this->success([
            'comment_id' => $comment->id,
            'is_solution' => true,
            'post_is_solved' => true,
        ], 'Comment marked as solution');
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
