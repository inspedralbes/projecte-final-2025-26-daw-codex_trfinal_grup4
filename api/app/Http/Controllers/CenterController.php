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

        // If authenticated admin, allow filtering by status. 
        // We use filled() to ignore empty strings from the frontend filter.
        if ($user && $user->role->value === 'admin') {
            if ($request->filled('status')) {
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

        $center->loadCount(['users', 'teachers', 'students']);

        return $this->success($center);
    }

    /**
     * GET /api/centers/{center}/members
     * List members of a center (public for center members).
     */
    public function members(Request $request, Center $center): JsonResponse
    {
        $user = auth('sanctum')->user();

        // Only members of the center can see the member list
        if (!$user || $user->center_id !== $center->id) {
            return $this->error('You must be a member of this center to view members', 403);
        }

        $query = $center->users()
            ->where('role', '!=', 'admin')
            ->select('id', 'name', 'username', 'role', 'avatar', 'bio', 'created_at')
            ->withCount(['posts', 'comments']);

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Search by name/username
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        $members = $query->orderByRaw("CASE role WHEN 'teacher' THEN 1 WHEN 'student' THEN 2 ELSE 3 END")
            ->orderBy('name')
            ->paginate(30);

        return $this->success($members);
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
     * Update a center (admin or teacher of that center).
     */
    public function update(UpdateCenterRequest $request, Center $center): JsonResponse
    {
        $user = $request->user();

        // Teachers can only update their own center
        if ($user->role->value === 'teacher' && $user->center_id !== $center->id) {
            return $this->error('You can only edit your own center.', 403);
        }

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

        // Teachers cannot change status
        if ($user->role->value === 'teacher') {
            unset($data['status']);
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

    /**
     * PATCH /api/centers/{center}/approve
     * Convenience endpoint: change center from PENDING to ACTIVE.
     */
    public function approve(Center $center): JsonResponse
    {
        if ($center->status === 'active') {
            return $this->error('Center is already active', 422);
        }

        $center->update(['status' => 'active']);

        return $this->success($center, 'Center approved successfully');
    }

    /**
     * PATCH /api/centers/{center}/reject
     * Convenience endpoint: change center to REJECTED.
     */
    public function reject(Center $center): JsonResponse
    {
        if ($center->status === 'rejected') {
            return $this->error('Center is already rejected', 422);
        }

        $center->update(['status' => 'rejected']);

        return $this->success($center, 'Center rejected');
    }

    /**
     * GET /api/centers/{center}/justificante
     * Download the justificante file (admin only).
     */
    public function downloadJustificante(Center $center)
    {
        if (!$center->justificante) {
            return response()->json([
                'success' => false,
                'message' => 'No justificante file found for this center.',
                'errors'  => null,
            ], 404);
        }

        if (!Storage::disk('public')->exists($center->justificante)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found on disk.',
                'errors'  => null,
            ], 404);
        }

        return Storage::disk('public')->download(
            $center->justificante,
            'justificante_' . $center->domain . '.' . pathinfo($center->justificante, PATHINFO_EXTENSION)
        );
    }
}
