<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\LocalFileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:student,landlord',
            'phone' => 'nullable|string|max:30',
            'company_name' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
            'company_name' => $validated['company_name'] ?? null,
            'last_seen_at' => now(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->status === 'banned') {
            throw ValidationException::withMessages([
                'email' => ['Your account has been suspended/banned. ' . ($user->ban_reason ? 'Reason: ' . $user->ban_reason : 'Please contact administrator support.')],
            ]);
        }

        if ($user->status === 'deactivated') {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated. Please contact administrator support.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        $user->update(['last_seen_at' => now()]);

        return response()->json([
            'message' => 'Logged in successfully',
            'user' => $user->fresh(),
            'token' => $token,
        ]);
    }

    public function demoLogin(Request $request)
    {
        $request->validate([
            'role' => 'required|in:student,landlord,admin',
        ]);

        $role = $request->input('role');
        $user = User::where('role', $role)->first();

        if (! $user) {
            return response()->json(['message' => 'No demo user found for role: ' . $role], 404);
        }

        // Delete old demo tokens if needed, then create fresh one
        $token = $user->createToken('demo_token')->plainTextToken;
        $user->update(['last_seen_at' => now()]);

        return response()->json([
            'message' => 'Demo login successful as ' . ucfirst($role),
            'user' => $user->fresh(),
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->update(['last_seen_at' => now()]);
            $user->loadCount(['properties', 'receivedInquiries', 'sentInquiries', 'savedProperties']);
        }

        return response()->json([
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function updateProfile(Request $request, LocalFileService $fileService)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'         => 'sometimes|required|string|max:255',
            'phone'        => 'nullable|string|max:30',
            'company_name' => 'nullable|string|max:255',
            'avatar'       => 'nullable|file|mimes:jpeg,jpg,png,webp,gif|max:5120',
            'avatar_base64'=> 'nullable|string',
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }
        if (array_key_exists('phone', $validated)) {
            $user->phone = $validated['phone'];
        }
        if (array_key_exists('company_name', $validated)) {
            $user->company_name = $validated['company_name'];
        }

        // Handle Avatar File Upload (Multipart)
        if ($request->hasFile('avatar')) {
            $uploadedFile = $request->file('avatar');

            // Delete previous avatar file if exists
            $oldAvatar = $user->avatarFile;
            if ($oldAvatar) {
                $fileService->deleteFile($oldAvatar);
            }

            // Save new avatar using time-partitioned & entity-scoped structure
            $fileRecord = $fileService->uploadFile(
                uploadedFile: $uploadedFile,
                module: 'users',
                parentId: $user->id,
                fileType: 'avatar',
                fileable: $user
            );

            $user->avatar = $fileRecord->file_path;
        } elseif ($request->filled('avatar_base64')) {
            // Handle Base64 avatar upload (MERN-style)
            $oldAvatar = $user->avatarFile;
            if ($oldAvatar) {
                $fileService->deleteFile($oldAvatar);
            }

            $fileRecord = $fileService->uploadFromBase64(
                base64String: $request->input('avatar_base64'),
                module: 'users',
                parentId: $user->id,
                fileType: 'avatar',
                originalName: "avatar-{$user->id}.webp",
                fileable: $user
            );

            $user->avatar = $fileRecord->file_path;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user'    => $user->fresh()->load('avatarFile'),
        ]);
    }
}

