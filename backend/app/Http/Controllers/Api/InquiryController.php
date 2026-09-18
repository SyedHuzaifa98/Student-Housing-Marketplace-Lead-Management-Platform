<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Property;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    public function store(Request $request, $propertyId)
    {
        $property = Property::findOrFail($propertyId);

        $validated = $request->validate([
            'student_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:30',
            'inquiry_type' => 'required|in:general,physical_tour,virtual_tour',
            'preferred_move_in' => 'nullable|date',
            'message' => 'required|string|min:10|max:2000',
        ]);

        $studentId = null;
        if ($user = $request->user('sanctum')) {
            $studentId = $user->id;
        }

        $inquiry = Inquiry::create([
            'property_id' => $property->id,
            'landlord_id' => $property->landlord_id,
            'student_id' => $studentId,
            'student_name' => $validated['student_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'inquiry_type' => $validated['inquiry_type'],
            'preferred_move_in' => $validated['preferred_move_in'] ?? null,
            'message' => $validated['message'],
            'status' => 'new',
            'landlord_notes' => null,
        ]);

        return response()->json([
            'message' => 'Your inquiry has been forwarded directly to the landlord!',
            'inquiry' => $inquiry->load('property:id,title,slug,price_per_month'),
        ], 201);
    }

    public function studentInquiries(Request $request)
    {
        $user = $request->user();

        $inquiries = Inquiry::with([
            'property.university',
            'property.images',
            'landlord:id,name,email,phone,company_name',
        ])
            ->where('student_id', $user->id)
            ->orWhere('email', $user->email)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($inquiries);
    }

    public function studentSavedProperties(Request $request)
    {
        $user = $request->user();

        $saved = $user->savedProperties()
            ->with(['university', 'images', 'amenities'])
            ->paginate(12);

        return response()->json($saved);
    }

    public function toggleSaveProperty(Request $request, $propertyId)
    {
        $user = $request->user();
        $property = Property::findOrFail($propertyId);

        $exists = $user->savedProperties()->where('property_id', $propertyId)->exists();

        if ($exists) {
            $user->savedProperties()->detach($propertyId);
            $saved = false;
            $message = 'Property removed from saved listings';
        } else {
            $user->savedProperties()->attach($propertyId);
            $saved = true;
            $message = 'Property saved to your favorites!';
        }

        return response()->json([
            'saved' => $saved,
            'message' => $message,
        ]);
    }
}

