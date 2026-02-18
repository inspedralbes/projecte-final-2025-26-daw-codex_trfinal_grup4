<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
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
/*  Public Posts (US#2) – Feed global (lectura sin auth)               */
/* ------------------------------------------------------------------ */
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{post}', [PostController::class, 'show']);

/* ------------------------------------------------------------------ */
/*  Protected Routes (auth:sanctum)                                    */
/* ------------------------------------------------------------------ */
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Posts (US#2) – Crear y eliminar requiere auth
    Route::post('/posts', [PostController::class, 'store']);
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);
});
