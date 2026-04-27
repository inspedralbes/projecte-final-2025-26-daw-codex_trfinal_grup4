<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CenterController;
use App\Http\Controllers\CenterMemberController;
use App\Http\Controllers\CenterRequestController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\GroupChatController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\InteractionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PasswordController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\VerificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'api',
        'timestamp' => now()->toISOString(),
    ]);
});

/* ------------------------------------------------------------------ */
/*  Auth Routes (US#1)                                                 */
/* ------------------------------------------------------------------ */
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/check-domain', [AuthController::class, 'checkDomain']);

// Google OAuth
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect']);
Route::post('/auth/google/callback', [GoogleAuthController::class, 'callback']);

// Email Verification (public – signed URL)
Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])
    ->middleware('signed')
    ->name('verification.verify');

// Password Reset (public – no auth needed)
Route::post('/password/forgot', [PasswordController::class, 'forgot'])
    ->middleware('throttle:5,1'); // Max 5 per minute
Route::post('/password/reset', [PasswordController::class, 'reset']);

/* ------------------------------------------------------------------ */
/*  Public Routes                                                      */
/* ------------------------------------------------------------------ */
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{post}', [PostController::class, 'show']);
Route::get('/posts/{postId}/comments', [CommentController::class, 'index']);
Route::get('/posts/{postId}/interactions', [InteractionController::class, 'postStatus']);
Route::get('/tags', [TagController::class, 'index']);

// Profile (US#7)
Route::get('/profile/{username}', [ProfileController::class, 'show']);
Route::get('/profile/{username}/posts', [ProfileController::class, 'posts']);
Route::get('/profile/{username}/replies', [ProfileController::class, 'replies']);

// Follow – public lists (anyone can view followers/following)
Route::get('/users/{user}/followers', [FollowController::class, 'followers']);
Route::get('/users/{user}/following', [FollowController::class, 'following']);

// Search (public)
Route::get('/search', [SearchController::class, 'index']);

// Leaderboard (public)
Route::get('/leaderboard', [ProfileController::class, 'leaderboard']);

// Centers (US#8) – public listing (active only), admins see all with filters
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/centers', [CenterController::class, 'index']);
});
Route::get('/centers/{center}', [CenterController::class, 'show']);

// Center members – requires authentication (any center member can view)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/centers/{center}/members', [CenterController::class, 'members']);
});

/* ------------------------------------------------------------------ */
/*  Protected Routes – Session/Read-only (auth:sanctum)                */
/*  These work even for banned users so they can see their ban status, */
/*  close session, verify email, etc.                                  */
/* ------------------------------------------------------------------ */
Route::middleware('auth:sanctum')->group(function () {
    // Auth – session management (must work for banned users)
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/dismiss-center-prompt', [AuthController::class, 'dismissCenterPrompt']);

    // Email Verification (authenticated)
    Route::post('/email/resend', [VerificationController::class, 'resend'])
        ->middleware('throttle:6,1'); // Max 6 per minute
    Route::get('/email/status', [VerificationController::class, 'status']);

    // Password management (authenticated – needed even if banned)
    Route::post('/password/set', [PasswordController::class, 'set']);     // Google users set first password
    Route::put('/password/update', [PasswordController::class, 'update']); // Change existing password

    // Notifications – read-only (banned users should see ban notification)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/count', [NotificationController::class, 'count']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

    // Chat – read-only (banned users can see past conversations)
    Route::get('/chat/conversations', [ChatController::class, 'conversations']);
    Route::get('/chat/conversations/{userId}', [ChatController::class, 'messages']);
    Route::get('/chat/groups/{groupId}', [ChatController::class, 'groupMessages']);
    Route::get('/chat/unread', [ChatController::class, 'unreadCount']);

    // Center request status (read-only)
    Route::get('/center-requests/my', [CenterRequestController::class, 'myRequests']);
});

/* ------------------------------------------------------------------ */
/*  Protected Routes – Write/Action (auth:sanctum + verified + not-blocked) */
/*  Banned/timeout users and unverified emails CANNOT perform write actions. */
/* ------------------------------------------------------------------ */
Route::middleware(['auth:sanctum', 'verified', 'not-blocked'])->group(function () {
    // Posts (US#2)
    Route::post('/posts', [PostController::class, 'store']);
    Route::put('/posts/{post}', [PostController::class, 'update']);
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);
    Route::post('/posts/{post}/repost', [PostController::class, 'repost']);

    // Following feed
    Route::get('/feed/following', [PostController::class, 'followingFeed']);

    // Comments (US#6)
    Route::post('/comments', [CommentController::class, 'store']);
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    Route::patch('/comments/{comment}/solution', [CommentController::class, 'toggleSolution']);

    // Interactions – like/bookmark toggle (S2-US#6)
    Route::post('/interactions', [InteractionController::class, 'toggle']);
    Route::get('/bookmarks', [InteractionController::class, 'bookmarks']);
    Route::get('/liked', [InteractionController::class, 'liked']);

    // Follow – toggle + status (auth required)
    Route::post('/users/{user}/follow', [FollowController::class, 'toggle']);
    Route::get('/users/{user}/follow-status', [FollowController::class, 'status']);

    // Center Hub (US#5) – "Walled Garden"
    Route::get('/center/posts', [PostController::class, 'centerPosts']);
    Route::get('/center/tags', [TagController::class, 'centerTags']);
    Route::get('/center/search', [SearchController::class, 'centerSearch']);

    // Tags – follow/unfollow + notifications
    Route::post('/tags/{tag}/follow', [TagController::class, 'toggleFollow']);
    Route::patch('/tags/{tag}/notify', [TagController::class, 'toggleNotify']);
    Route::get('/tags/followed', [TagController::class, 'followed']);

    // Chat – write actions (banned users cannot send messages)
    Route::post('/chat/messages', [ChatController::class, 'store']);
    Route::post('/chat/conversations/{userId}/read', [ChatController::class, 'markAsRead']);
    Route::get('/chat/can-message/{userId}', [ChatController::class, 'canMessage']);
    Route::get('/chat/search-users', [ChatController::class, 'searchUsers']);

    // Groups (Mutual Follows)
    Route::get('/users/mutual-followers', [GroupChatController::class, 'mutualFollowers']);
    Route::post('/groups', [GroupChatController::class, 'store']);
    Route::get('/groups', [GroupChatController::class, 'index']);
    Route::put('/groups/{groupId}', [GroupChatController::class, 'update']);
    Route::delete('/groups/{groupId}/members/{userId}', [GroupChatController::class, 'removeMember']);
    Route::post('/groups/{groupId}/members', [GroupChatController::class, 'addMember']);
    Route::post('/groups/{groupId}/leave', [GroupChatController::class, 'leave']);
    Route::post('/groups/{groupId}/read', [GroupChatController::class, 'markAsRead']);

    // Profile update (US#7)
    Route::put('/profile', [ProfileController::class, 'update']);

    // Center Requests – any authenticated non-blocked user can request
    Route::post('/center-requests', [CenterRequestController::class, 'store']);

    // Centers – create request with justificante
    Route::post('/centers', [CenterController::class, 'store']);

    /* -------------------------------------------------------------- */
    /*  Teacher-only routes (teacher or admin + not-blocked)            */
    /* -------------------------------------------------------------- */
    Route::middleware('teacher')->group(function () {
        // Edit center portal (teacher edits own center)
        Route::put('/centers/{center}', [CenterController::class, 'update']);

        // Center Members CRUD
        Route::get('/center/members', [CenterMemberController::class, 'index']);
        Route::get('/center/members/{user}', [CenterMemberController::class, 'show']);
        Route::patch('/center/members/{user}/role', [CenterMemberController::class, 'updateRole']);
        Route::patch('/center/members/{user}/block', [CenterMemberController::class, 'block']);
        Route::patch('/center/members/{user}/unblock', [CenterMemberController::class, 'unblock']);
        Route::delete('/center/members/{user}', [CenterMemberController::class, 'removeMember']);
    });

    /* -------------------------------------------------------------- */
    /*  Admin-only routes (US#8) – admin + not-blocked                  */
    /* -------------------------------------------------------------- */
    Route::middleware('admin')->group(function () {
        // Dashboard Stats
        Route::get('/admin/stats', function () {
            return response()->json([
                'success' => true,
                'data' => [
                    'total_users' => \App\Models\User::count(),
                    'total_centers' => \App\Models\Center::count(),
                    'pending_requests' => \App\Models\CenterRequest::where('status', 'pending')->count(),
                    'total_posts' => \App\Models\Post::count(),
                ]
            ]);
        });

        // User Management
        Route::get('/admin/users', [\App\Http\Controllers\AdminUserController::class, 'index']);
        Route::get('/admin/users/{user}', [\App\Http\Controllers\AdminUserController::class, 'show']);
        Route::get('/admin/users/{user}/posts', [\App\Http\Controllers\AdminUserController::class, 'userPosts']);
        Route::put('/admin/users/{user}', [\App\Http\Controllers\AdminUserController::class, 'update']);
        Route::post('/admin/users/{user}/ban', [\App\Http\Controllers\AdminUserController::class, 'ban']);
        Route::post('/admin/users/{user}/unban', [\App\Http\Controllers\AdminUserController::class, 'unban']);
        Route::delete('/admin/users/{user}', [\App\Http\Controllers\AdminUserController::class, 'destroy']);

        // Center Request management
        Route::get('/center-requests', [CenterRequestController::class, 'index']);
        Route::get('/center-requests/{centerRequest}', [CenterRequestController::class, 'show']);
        Route::patch('/center-requests/{centerRequest}/approve', [CenterRequestController::class, 'approve']);
        Route::patch('/center-requests/{centerRequest}/reject', [CenterRequestController::class, 'reject']);
        Route::get('/center-requests/{centerRequest}/justificante', [CenterRequestController::class, 'downloadJustificante']);

        // Center management
        Route::delete('/centers/{center}', [CenterController::class, 'destroy']);
        Route::patch('/centers/{center}/status', [CenterController::class, 'updateStatus']);
        Route::patch('/centers/{center}/approve', [CenterController::class, 'approve']);
        Route::patch('/centers/{center}/reject', [CenterController::class, 'reject']);
        Route::get('/centers/{center}/justificante', [CenterController::class, 'downloadJustificante']);
    });
});
