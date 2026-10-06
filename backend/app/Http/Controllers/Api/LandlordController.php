<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LandlordController extends Controller
{
    public function stats(Request $request)
    {
        $landlordId = $request->user()->id;

        $totalProperties = Property::where('landlord_id', $landlordId)->count();
        $activeProperties = Property::where('landlord_id', $landlordId)
            ->where('status', 'available')
            ->where('visibility', 'published')
            ->count();

        $totalInquiries = Inquiry::where('landlord_id', $landlordId)->count();
        $newLeads = Inquiry::where('landlord_id', $landlordId)->where('status', 'new')->count();
        $closedDeals = Inquiry::where('landlord_id', $landlordId)->where('status', 'closed')->count();

        $conversionRate = $totalInquiries > 0 ? round(($closedDeals / $totalInquiries) * 100, 1) : 0;

        $recentInquiries = Inquiry::with('property:id,title,slug,price_per_month')
            ->where('landlord_id', $landlordId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'stats' => [
                'total_properties' => $totalProperties,
                'active_properties' => $activeProperties,
                'total_inquiries' => $totalInquiries,
                'new_leads' => $newLeads,
                'closed_deals' => $closedDeals,
                'conversion_rate' => $conversionRate,
            ],
            'recent_inquiries' => $recentInquiries,
        ]);
    }

    public function properties(Request $request)
    {
        $landlordId = $request->user()->id;

        $properties = Property::with(['university', 'images', 'amenities'])
            ->withCount([
                'inquiries',
                'inquiries as new_inquiries_count' => function ($q) {
                    $q->where('status', 'new');
                }
            ])
            ->where('landlord_id', $landlordId)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($properties);
    }

    public function storeProperty(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'university_id' => 'required|exists:universities,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price_per_month' => 'required|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
            'room_type' => 'required|in:private,shared,studio,entire_flat',
            'distance_km' => 'required|numeric|min:0',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'bills_included' => 'boolean',
            'available_from' => 'required|date',
            'status' => 'required|in:available,reserved,unavailable',
            'visibility' => 'required|in:published,draft,archived',
            'amenities' => 'nullable|array',
            'images' => 'nullable|array',
        ]);

        $property = Property::create([
            'landlord_id' => $user->id,
            'university_id' => $validated['university_id'],
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . Str::random(6),
            'description' => $validated['description'],
            'price_per_month' => $validated['price_per_month'],
            'deposit_amount' => $validated['deposit_amount'] ?? 0,
            'room_type' => $validated['room_type'],
            'distance_km' => $validated['distance_km'],
            'address' => $validated['address'],
            'city' => $validated['city'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'bills_included' => $validated['bills_included'] ?? false,
            'available_from' => $validated['available_from'],
            'status' => $validated['status'],
            'visibility' => $validated['visibility'],
        ]);

        if (!empty($validated['amenities'])) {
            $property->amenities()->sync($validated['amenities']);
        }

        if (!empty($validated['images'])) {
            foreach ($validated['images'] as $idx => $imgUrl) {
                if (trim($imgUrl) !== '') {
                    PropertyImage::create([
                        'property_id' => $property->id,
                        'image_url' => trim($imgUrl),
                        'is_primary' => $idx === 0,
                        'sort_order' => $idx,
                    ]);
                }
            }
        }

        return response()->json([
            'message' => 'Property listing created successfully',
            'property' => $property->load(['university', 'images', 'amenities']),
        ], 201);
    }

    public function updateProperty(Request $request, $id)
    {
        $user = $request->user();
        $property = Property::where('id', $id)->where('landlord_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'university_id' => 'sometimes|required|exists:universities,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price_per_month' => 'sometimes|required|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
            'room_type' => 'sometimes|required|in:private,shared,studio,entire_flat',
            'distance_km' => 'sometimes|required|numeric|min:0',
            'address' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'bills_included' => 'boolean',
            'available_from' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:available,reserved,unavailable',
            'visibility' => 'sometimes|required|in:published,draft,archived',
            'amenities' => 'nullable|array',
            'images' => 'nullable|array',
        ]);

        $property->update($validated);

        if (isset($validated['amenities'])) {
            $property->amenities()->sync($validated['amenities']);
        }

        if (isset($validated['images']) && is_array($validated['images'])) {
            $property->images()->delete();
            foreach ($validated['images'] as $idx => $imgUrl) {
                if (trim($imgUrl) !== '') {
                    PropertyImage::create([
                        'property_id' => $property->id,
                        'image_url' => trim($imgUrl),
                        'is_primary' => $idx === 0,
                        'sort_order' => $idx,
                    ]);
                }
            }
        }

        return response()->json([
            'message' => 'Property listing updated successfully',
            'property' => $property->fresh(['university', 'images', 'amenities']),
        ]);
    }

    public function updatePropertyStatus(Request $request, $id)
    {
        $user = $request->user();
        $property = Property::where('id', $id)->where('landlord_id', $user->id)->firstOrFail();

        $request->validate([
            'status' => 'nullable|in:available,reserved,unavailable',
            'visibility' => 'nullable|in:published,draft,archived',
        ]);

        if ($request->has('status')) {
            $property->status = $request->input('status');
        }
        if ($request->has('visibility')) {
            $property->visibility = $request->input('visibility');
        }
        $property->save();

        return response()->json([
            'message' => 'Property status updated',
            'property' => $property,
        ]);
    }

    public function destroyProperty(Request $request, $id)
    {
        $user = $request->user();
        $property = Property::where('id', $id)->where('landlord_id', $user->id)->firstOrFail();

        $property->delete();

        return response()->json([
            'message' => 'Property listing deleted successfully',
        ]);
    }

    public function inquiries(Request $request)
    {
        $landlordId = $request->user()->id;

        $query = Inquiry::with(['property:id,title,slug,price_per_month', 'student:id,name,avatar'])
            ->where('landlord_id', $landlordId);

        if ($propId = $request->input('property_id')) {
            $query->where('property_id', $propId);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('student_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $inquiries = $query->orderBy('created_at', 'desc')->paginate(12);

        return response()->json($inquiries);
    }

    public function updateInquiryStatus(Request $request, $id)
    {
        $user = $request->user();
        $inquiry = Inquiry::where('id', $id)->where('landlord_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|in:new,contacted,viewing_scheduled,interested,closed,rejected',
        ]);

        $inquiry->status = $validated['status'];
        $inquiry->save();

        return response()->json([
            'message' => 'Lead status marked as ' . $inquiry->status,
            'inquiry' => $inquiry,
        ]);
    }

    public function updateInquiryNotes(Request $request, $id)
    {
        $user = $request->user();
        $inquiry = Inquiry::where('id', $id)->where('landlord_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'landlord_notes' => 'nullable|string|max:3000',
        ]);

        $inquiry->landlord_notes = $validated['landlord_notes'];
        $inquiry->save();

        return response()->json([
            'message' => 'Notes saved successfully',
            'inquiry' => $inquiry,
        ]);
    }

    public function exportInquiriesCsv(Request $request)
    {
        $landlordId = $request->user()->id;

        $inquiries = Inquiry::with('property:id,title')
            ->where('landlord_id', $landlordId)
            ->orderBy('created_at', 'desc')
            ->get();

        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=leads_export_' . date('Y-m-d') . '.csv',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($inquiries) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Date', 'Student Name', 'Email', 'Phone', 'Property', 'Type', 'Move-in Date', 'Status', 'Message', 'Landlord Notes']);

            foreach ($inquiries as $inq) {
                fputcsv($file, [
                    $inq->id,
                    $inq->created_at->format('Y-m-d H:i'),
                    $inq->student_name,
                    $inq->email,
                    $inq->phone,
                    $inq->property ? $inq->property->title : 'N/A',
                    $inq->inquiry_type,
                    $inq->preferred_move_in ? $inq->preferred_move_in->format('Y-m-d') : 'N/A',
                    $inq->status,
                    $inq->message,
                    $inq->landlord_notes,
                ]);
            }
            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}

