<?php

namespace App\Http\Controllers;

use App\Models\Center;
use App\Traits\ApiResponse;
use App\Http\Requests\StoreCenterRequest;
use App\Http\Requests\UpdateCenterRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CenterController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/centers
     * List all centers (public: only active; admin: all with filters).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Center::withCount('users');

        // Try to resolve user from Sanctum token (optional auth)
        $user = auth('sanctum')->user();

        // If authenticated admin, allow filtering by status
        if ($user && $user->role->value === 'admin') {
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
        } else {
            // Public users only see active centers
            $query->active();
        }

        $centers = $query->latest()->paginate(20);

        return $this->success($centers);
    }

    /**
     * GET /api/centers/{center}
     * Show a single center.
     */
    public function show(Center $center): JsonResponse
    {
        $user = auth('sanctum')->user();

        // Public users can only see active centers
        if (!$user || $user->role->value !== 'admin') {
            if ($center->status !== 'active') {
                return $this->error('Center not found', 404);
            }
        }

        $center->loadCount('users');

        return $this->success($center);
    }

    /**
     * POST /api/centers
     * Create a center (admin) or request a center (public with justificante).
     */
    public function store(StoreCenterRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Handle justificante file upload
        if ($request->hasFile('justificante')) {
            $path = $request->file('justificante')->store('justificantes', 'public');
            $data['justificante'] = $path;
        }

        // Admin creates centers as active; others create as pending
        if ($request->user() && $request->user()->role->value === 'admin') {
            $data['status'] = $data['status'] ?? 'active';
        } else {
            $data['status'] = 'pending';
        }

        $center = Center::create($data);

        return $this->success($center, 'Center created successfully', 201);
    }

    /**
     * PUT /api/centers/{center}
     * Update a center (admin only).
     */
    public function update(UpdateCenterRequest $request, Center $center): JsonResponse
    {
        $data = $request->validated();

        // Handle justificante file upload
        if ($request->hasFile('justificante')) {
            // Delete old file if exists
            if ($center->justificante) {
                Storage::disk('public')->delete($center->justificante);
            }
            $path = $request->file('justificante')->store('justificantes', 'public');
            $data['justificante'] = $path;
        }

        $center->update($data);

        return $this->success($center, 'Center updated successfully');
    }

    /**
     * DELETE /api/centers/{center}
     * Delete a center (admin only).
     */
    public function destroy(Center $center): JsonResponse
    {
        // Delete justificante file if exists
        if ($center->justificante) {
            Storage::disk('public')->delete($center->justificante);
        }

        $center->delete();

        return $this->success(null, 'Center deleted successfully');
    }

    /**
     * PATCH /api/centers/{center}/status
     * Change center status (admin only). Approve/reject pending centers.
     */
    public function updateStatus(Request $request, Center $center): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,active,rejected',
        ]);

        $center->update(['status' => $request->status]);

        return $this->success($center, 'Center status updated to ' . $request->status);
    }
}
