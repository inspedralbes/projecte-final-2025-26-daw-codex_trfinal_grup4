<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CenterController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\InteractionController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TagController;
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

// Centers (US#8) – public listing (active only), admins see all with filters
Route::get('/centers', [CenterController::class, 'index']);
Route::get('/centers/{center}', [CenterController::class, 'show']);

/* ------------------------------------------------------------------ */
/*  Protected Routes (auth:sanctum)                                    */
/* ------------------------------------------------------------------ */
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Posts (US#2)
    Route::post('/posts', [PostController::class, 'store']);
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);

    // Comments (US#6)
    Route::post('/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    // Interactions – like/bookmark toggle (S2-US#6)
    Route::post('/interactions', [InteractionController::class, 'toggle']);

    // Center Hub (US#5) – "Walled Garden"
    Route::get('/center/posts', [PostController::class, 'centerPosts']);
    Route::get('/center/tags', [TagController::class, 'centerTags']);

    // Profile update (US#7)
    Route::put('/profile', [ProfileController::class, 'update']);

    // Centers – create request with justificante (any authenticated user)
    Route::post('/centers', [CenterController::class, 'store']);

    // Admin-only routes (US#8)
    Route::middleware('admin')->group(function () {
        Route::put('/centers/{center}', [CenterController::class, 'update']);
        Route::delete('/centers/{center}', [CenterController::class, 'destroy']);
        Route::patch('/centers/{center}/status', [CenterController::class, 'updateStatus']);
        Route::patch('/centers/{center}/approve', [CenterController::class, 'approve']);
        Route::patch('/centers/{center}/reject', [CenterController::class, 'reject']);
        Route::get('/centers/{center}/justificante', [CenterController::class, 'downloadJustificante']);
    });
});
