<?php

namespace App\Http\Controllers;

use App\Models\Center;
use App\Models\CenterRequest;
use App\Models\User;
use App\Enums\UserRole;
use App\Traits\ApiResponse;
use App\Http\Requests\StoreCenterRequestRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CenterRequestController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/center-requests
     * Admin: list all center requests with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = CenterRequest::with('user:id,name,username,email,avatar');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $requests = $query->latest()->paginate(20);

        return $this->success($requests);
    }

    /**
     * GET /api/center-requests/{centerRequest}
     * Admin: show a single request with details.
     */
    public function show(CenterRequest $centerRequest): JsonResponse
    {
        $centerRequest->load('user:id,name,username,email,avatar');

        return $this->success($centerRequest);
    }

    /**
     * POST /api/center-requests
     * Authenticated user requests to create a center as teacher.
     * Requires full_name + justificante file.
     */
    public function store(StoreCenterRequestRequest $request): JsonResponse
    {
        $user = $request->user();

        // Check if user already has a pending request
        $existingPending = CenterRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        if ($existingPending) {
            return $this->error('You already have a pending center request. Please wait for admin review.', 422);
        }

        // Check if user is already a teacher with a center
        if ($user->center_id && $user->role->value === 'teacher') {
            return $this->error('You are already a teacher at a center.', 422);
        }

        $data = $request->validated();
        $data['user_id'] = $user->id;

        // Handle justificante file upload
        $path = $request->file('justificante')->store('center_requests', 'public');
        $data['justificante'] = $path;

        $centerRequest = CenterRequest::create($data);

        return $this->success($centerRequest, 'Center request submitted successfully. An admin will review it.', 201);
    }

    /**
     * GET /api/center-requests/my
     * Authenticated user: see their own requests.
     */
    public function myRequests(Request $request): JsonResponse
    {
        $requests = CenterRequest::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return $this->success($requests);
    }

    /**
     * PATCH /api/center-requests/{centerRequest}/approve
     * Admin approves a center request:
     * 1. Creates the center with status 'active'
     * 2. Assigns the requester as teacher + links to center
     * 3. Updates request status to 'approved'
     */
    public function approve(Request $request, CenterRequest $centerRequest): JsonResponse
    {
        if ($centerRequest->status !== 'pending') {
            return $this->error('This request has already been ' . $centerRequest->status . '.', 422);
        }

        $request->validate([
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        // Check domain doesn't exist yet (could have been created since the request)
        if (Center::where('domain', $centerRequest->domain)->exists()) {
            return $this->error('A center with domain "' . $centerRequest->domain . '" already exists.', 422);
        }

        $center = null;

        DB::transaction(function () use ($centerRequest, $request, &$center) {
            // 1. Create the center
            $center = Center::create([
                'name'       => $centerRequest->center_name,
                'domain'     => $centerRequest->domain,
                'city'       => $centerRequest->city,
                'website'    => $centerRequest->website,
                'status'     => 'active',
                'creator_id' => $centerRequest->user_id,
            ]);

            // 2. Update the requester: role → teacher, center_id → new center
            User::where('id', $centerRequest->user_id)->update([
                'role'      => UserRole::Teacher->value,
                'center_id' => $center->id,
            ]);

            // 3. Update the request status
            $centerRequest->update([
                'status'      => 'approved',
                'admin_notes' => $request->input('admin_notes'),
            ]);
        });

        $center->load('creator:id,name,username,email');

        return $this->success($center, 'Center request approved. Center created and user promoted to teacher.');
    }

    /**
     * PATCH /api/center-requests/{centerRequest}/reject
     * Admin rejects a center request.
     */
    public function reject(Request $request, CenterRequest $centerRequest): JsonResponse
    {
        if ($centerRequest->status !== 'pending') {
            return $this->error('This request has already been ' . $centerRequest->status . '.', 422);
        }

        $request->validate([
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        $centerRequest->update([
            'status'      => 'rejected',
            'admin_notes' => $request->input('admin_notes'),
        ]);

        return $this->success($centerRequest, 'Center request rejected.');
    }

    /**
     * GET /api/center-requests/{centerRequest}/justificante
     * Admin: download the justificante file.
     */
    public function downloadJustificante(CenterRequest $centerRequest)
    {
        if (!$centerRequest->justificante) {
            return response()->json([
                'success' => false,
                'message' => 'No justificante file found.',
                'errors'  => null,
            ], 404);
        }

        if (!Storage::disk('public')->exists($centerRequest->justificante)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found on disk.',
                'errors'  => null,
            ], 404);
        }

        return Storage::disk('public')->download(
            $centerRequest->justificante,
            'justificante_' . $centerRequest->domain . '.' . pathinfo($centerRequest->justificante, PATHINFO_EXTENSION)
        );
    }
}
