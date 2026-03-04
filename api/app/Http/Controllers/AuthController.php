<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly AuthService $authService
    ) {}

    /**
     * POST /api/register
     * Register a new user. Auto-detects center from email domain.
     * Sends verification email.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());

        // Send verification email
        $user->sendEmailVerificationNotification();

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'user'           => $user->load('center'),
            'token'          => $token,
            'email_verified' => false,
            'auth_provider'  => 'local',
            'needs_password' => false,
            'center_check'   => $this->authService->buildCenterCheck($user),
        ], 'User registered successfully. Please check your email to verify your account.', 201);
    }

    /**
     * POST /api/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return $this->error('Invalid credentials', 401);
        }

        // If user registered via Google and hasn't set a password yet
        if ($user->auth_provider === 'google' && $user->needsPassword()) {
            return $this->error('This account uses Google login. Please sign in with Google or set a password first.', 422);
        }

        if (!Hash::check($request->password, $user->password)) {
            return $this->error('Invalid credentials', 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'user'           => $user->load('center'),
            'token'          => $token,
            'email_verified' => $user->hasVerifiedEmail(),
            'auth_provider'  => $user->auth_provider,
            'needs_password' => $user->needsPassword(),
            'center_check'   => $this->authService->buildCenterCheck($user),
        ], 'Logged in successfully');
    }

    /**
     * POST /api/logout  (auth:sanctum)
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logged out successfully');
    }

    /**
     * GET /api/me  (auth:sanctum)
     * Return the authenticated user with center info.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->success([
            'user'           => $user->load('center'),
            'email_verified' => $user->hasVerifiedEmail(),
            'auth_provider'  => $user->auth_provider,
            'needs_password' => $user->needsPassword(),
            'center_check'   => $this->authService->buildCenterCheck($user),
        ], 'Authenticated user');
    }

    /**
     * POST /api/dismiss-center-prompt (auth:sanctum)
     * User dismisses the center creation prompt.
     * They can still request a center later from "Mi Centro".
     */
    public function dismissCenterPrompt(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->update(['center_prompt_dismissed' => true]);

        return $this->success(null, 'Center prompt dismissed');
    }

    /**
     * POST /api/check-domain
     * Public endpoint: checks if an email domain matches a registered center.
     * Returns: has_center, center_name, center_city, is_pending, can_request.
     */
    public function checkDomain(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $result = $this->authService->detectCenter($request->email);

        return $this->success($result);
    }
}
