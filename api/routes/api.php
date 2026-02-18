<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\PostController;
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
Route::get('/tags', [TagController::class, 'index']);

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

    // Center Hub (US#5) – "Walled Garden"
    Route::get('/center/posts', [PostController::class, 'centerPosts']);
    Route::get('/center/tags', [TagController::class, 'centerTags']);
});
