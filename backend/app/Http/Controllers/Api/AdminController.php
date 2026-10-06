<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    /**
     * Ensure the requesting user is an administrator.
     */
    protected function authorizeAdmin(Request $request)
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            abort(403, 'Unauthorized: Administrator privileges required.');
        }
    }

    public function stats(Request $request)
    {
        $this->authorizeAdmin($request);

        return response()->json([
            'total_users' => User::count(),
            'total_landlords' => User::where('role', 'landlord')->count(),
            'total_students' => User::where('role', 'student')->count(),
            'total_admins' => User::where('role', 'admin')->count(),
            'active_users' => User::where('status', 'active')->count(),
            'deactivated_users' => User::where('status', 'deactivated')->count(),
            'banned_users' => User::where('status', 'banned')->count(),
            'total_properties' => Property::count(),
            'total_inquiries' => Inquiry::count(),
            'pending_review' => Property::where('visibility', 'draft')->count(),
        ]);
    }

    public function properties(Request $request)
    {
        $this->authorizeAdmin($request);

        $query = Property::with(['university', 'landlord:id,name,email,company_name'])
            ->withCount('inquiries');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if ($request->filled('visibility') && $request->input('visibility') !== 'all') {
            $query->where('visibility', $request->input('visibility'));
        }

        $properties = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($properties);
    }

    public function toggleFeature(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $property = Property::findOrFail($id);
        $property->is_featured = !$property->is_featured;
        $property->save();

        return response()->json([
            'message' => 'Property feature status updated',
            'is_featured' => $property->is_featured,
        ]);
    }

    public function updateVisibility(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $property = Property::findOrFail($id);
        $request->validate(['visibility' => 'required|in:published,draft,archived']);

        $property->visibility = $request->input('visibility');
        $property->save();

        return response()->json([
            'message' => 'Property visibility updated to ' . $property->visibility,
            'property' => $property,
        ]);
    }

    public function users(Request $request)
    {
        $this->authorizeAdmin($request);

        $query = User::withCount(['properties', 'receivedInquiries', 'sentInquiries']);

        // Search by name, email, or company
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->filled('role') && $request->input('role') !== 'all') {
            $query->where('role', $request->input('role'));
        }

        // Filter by status
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($users);
    }

    public function createUser(Request $request)
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:student,landlord,admin',
            'status' => 'nullable|in:active,deactivated,banned',
            'phone' => 'nullable|string|max:30',
            'company_name' => 'nullable|string|max:255',
            'ban_reason' => 'nullable|string|max:255',
        ]);

        $status = $validated['status'] ?? 'active';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'status' => $status,
            'phone' => $validated['phone'] ?? null,
            'company_name' => $validated['company_name'] ?? null,
            'ban_reason' => $status === 'banned' ? ($validated['ban_reason'] ?? 'Banned on creation') : null,
            'banned_at' => $status === 'banned' ? now() : null,
        ]);

        $user->loadCount(['properties', 'receivedInquiries', 'sentInquiries']);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], 201);
    }

    public function updateUserStatus(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:active,deactivated,banned',
            'ban_reason' => 'nullable|string|max:255',
        ]);

        // Prevent admin from deactivating or banning their own account
        if ($request->user()->id === $user->id && in_array($validated['status'], ['banned', 'deactivated'])) {
            return response()->json([
                'message' => 'You cannot deactivate or ban your own administrator account.',
            ], 422);
        }

        $newStatus = $validated['status'];
        $user->status = $newStatus;

        if ($newStatus === 'banned') {
            $user->ban_reason = $validated['ban_reason'] ?? 'Account suspended by administrator';
            $user->banned_at = now();
            // Invalidate existing sessions
            $user->tokens()->delete();
        } elseif ($newStatus === 'deactivated') {
            $user->ban_reason = $validated['ban_reason'] ?? 'Account deactivated by administrator';
            $user->banned_at = null;
            // Invalidate existing sessions
            $user->tokens()->delete();
        } else {
            // Reactivated / active
            $user->ban_reason = null;
            $user->banned_at = null;
        }

        $user->save();
        $user->loadCount(['properties', 'receivedInquiries', 'sentInquiries']);

        return response()->json([
            'message' => "User status updated to {$newStatus}",
            'user' => $user,
        ]);
    }

    public function deleteUser(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $user = User::findOrFail($id);

        if ($request->user()->id === $user->id) {
            return response()->json([
                'message' => 'You cannot delete your own administrator account.',
            ], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }
}
