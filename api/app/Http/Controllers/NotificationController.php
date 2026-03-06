<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/notifications
     * List notifications for the authenticated user.
     * Supports ?unread_only=true filter.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Notification::where('user_id', $user->id)
            ->with(['sender:id,name,username,avatar', 'notifiable'])
            ->latest();

        if ($request->boolean('unread_only')) {
            $query->unread();
        }

        $notifications = $query->paginate($request->input('per_page', 20));

        $notifications->getCollection()->transform(fn ($n) => $this->formatNotification($n));

        return response()->json([
            'success' => true,
            'message' => 'Notifications retrieved',
            'data'    => $notifications->items(),
            'meta'    => [
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
                'per_page'     => $notifications->perPage(),
                'total'        => $notifications->total(),
                'unread_count' => Notification::where('user_id', $user->id)->unread()->count(),
            ],
        ]);
    }

    /**
     * GET /api/notifications/count
     * Quick count of unread notifications.
     */
    public function count(Request $request): JsonResponse
    {
        $unread = Notification::where('user_id', $request->user()->id)
            ->unread()
            ->count();

        return $this->success([
            'unread_count' => $unread,
        ]);
    }

    /**
     * PATCH /api/notifications/{notification}/read
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        if ($request->user()->id !== $notification->user_id) {
            return $this->error('Unauthorized', 403);
        }

        $notification->update(['read_at' => now()]);

        return $this->success(null, 'Notification marked as read');
    }

    /**
     * PATCH /api/notifications/read-all
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->unread()
            ->update(['read_at' => now()]);

        return $this->success(null, 'All notifications marked as read');
    }

    /**
     * DELETE /api/notifications/{notification}
     * Delete a notification.
     */
    public function destroy(Request $request, Notification $notification): JsonResponse
    {
        if ($request->user()->id !== $notification->user_id) {
            return $this->error('Unauthorized', 403);
        }

        $notification->delete();

        return $this->success(null, 'Notification deleted');
    }

    /**
     * Format notification for API response.
     * Includes center_id when the notifiable is a center-scoped Post.
     */
    private function formatNotification(Notification $n): array
    {
        $centerId = null;

        // If the notifiable is a Post, include its center_id so the
        // frontend can filter center-related notifications properly.
        if ($n->notifiable_type === \App\Models\Post::class && $n->notifiable) {
            $centerId = $n->notifiable->center_id;
        }

        return [
            'id'         => $n->id,
            'type'       => $n->type,
            'message'    => $n->message,
            'read_at'    => $n->read_at,
            'created_at' => $n->created_at,
            'center_id'  => $centerId,
            'sender'     => $n->sender ? [
                'id'       => $n->sender->id,
                'name'     => $n->sender->name,
                'username' => $n->sender->username,
                'avatar'   => $n->sender->avatar,
            ] : null,
            'notifiable' => [
                'type' => class_basename($n->notifiable_type),
                'id'   => $n->notifiable_id,
            ],
        ];
    }
}
