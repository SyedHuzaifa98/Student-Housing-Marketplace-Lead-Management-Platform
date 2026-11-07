<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
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
}

