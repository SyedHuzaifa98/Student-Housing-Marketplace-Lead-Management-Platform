<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_users' => User::count(),
            'total_landlords' => User::where('role', 'landlord')->count(),
            'total_students' => User::where('role', 'student')->count(),
            'total_properties' => Property::count(),
            'total_inquiries' => Inquiry::count(),
            'pending_review' => Property::where('visibility', 'draft')->count(),
        ]);
    }

    public function properties(Request $request)
    {
        $properties = Property::with(['university', 'landlord:id,name,email,company_name'])
            ->withCount('inquiries')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($properties);
    }

    public function toggleFeature(Request $request, $id)
    {
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
        $users = User::withCount(['properties', 'receivedInquiries', 'sentInquiries'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($users);
    }
}

