<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Amenity;
use App\Models\Property;
use App\Models\University;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function meta()
    {
        $universities = University::withCount(['properties' => function ($q) {
            $q->where('visibility', 'published');
        }])->get();

        $amenities = Amenity::all();

        $priceStats = [
            'min' => (float) (Property::where('visibility', 'published')->min('price_per_month') ?? 100),
            'max' => (float) (Property::where('visibility', 'published')->max('price_per_month') ?? 1200),
        ];

        return response()->json([
            'universities' => $universities,
            'amenities' => $amenities,
            'room_types' => [
                ['value' => 'private', 'label' => 'Private Room'],
                ['value' => 'studio', 'label' => 'Studio Apartment'],
                ['value' => 'shared', 'label' => 'Shared Room'],
                ['value' => 'entire_flat', 'label' => 'Entire Flat / Apartment'],
            ],
            'price_stats' => $priceStats,
        ]);
    }

    public function index(Request $request)
    {
        $query = Property::with(['university', 'images', 'amenities', 'landlord:id,name,avatar,company_name'])
            ->where('visibility', 'published');

        // Full-text search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        // University filter
        if ($uniId = $request->input('university_id')) {
            $query->where('university_id', $uniId);
        }

        // Price range
        if ($minPrice = $request->input('min_price')) {
            $query->where('price_per_month', '>=', (float) $minPrice);
        }
        if ($maxPrice = $request->input('max_price')) {
            $query->where('price_per_month', '<=', (float) $maxPrice);
        }

        // Room type (can be comma separated or single)
        if ($roomTypes = $request->input('room_types')) {
            $typesArray = is_array($roomTypes) ? $roomTypes : explode(',', $roomTypes);
            $query->whereIn('room_type', $typesArray);
        } elseif ($roomType = $request->input('room_type')) {
            $query->where('room_type', $roomType);
        }

        // Bills included
        if ($request->has('bills_included') && $request->input('bills_included') !== '' && $request->input('bills_included') !== null) {
            $bills = filter_var($request->input('bills_included'), FILTER_VALIDATE_BOOLEAN);
            if ($bills) {
                $query->where('bills_included', true);
            }
        }

        // Available now (availability date <= today)
        if ($request->has('available_now') && filter_var($request->input('available_now'), FILTER_VALIDATE_BOOLEAN)) {
            $query->where('available_from', '<=', now()->toDateString())
                ->where('status', 'available');
        }

        // Max distance to campus
        if ($maxDistance = $request->input('max_distance')) {
            $query->where('distance_km', '<=', (float) $maxDistance);
        }

        // Filter by amenities (all selected amenities must match)
        if ($amenities = $request->input('amenities')) {
            $amenitySlugs = is_array($amenities) ? $amenities : explode(',', $amenities);
            foreach ($amenitySlugs as $slug) {
                if (trim($slug) !== '') {
                    $query->whereHas('amenities', function ($q) use ($slug) {
                        $q->where('slug', trim($slug));
                    });
                }
            }
        }

        // Sorting
        $sort = $request->input('sort', 'featured');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price_per_month', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price_per_month', 'desc');
                break;
            case 'distance_asc':
                $query->orderBy('distance_km', 'asc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'featured':
            default:
                $query->orderBy('is_featured', 'desc')->orderBy('created_at', 'desc');
                break;
        }

        $perPage = (int) $request->input('per_page', 9);
        $properties = $query->paginate($perPage);

        return response()->json($properties);
    }

    public function show($identifier)
    {
        $property = Property::with([
            'university',
            'images',
            'amenities',
            'landlord:id,name,avatar,company_name,phone,created_at',
        ])
            ->where(function ($q) use ($identifier) {
                if (is_numeric($identifier)) {
                    $q->where('id', $identifier);
                } else {
                    $q->where('slug', $identifier);
                }
            })
            ->firstOrFail();

        // Similar / related properties
        $similar = Property::with(['university', 'images'])
            ->where('id', '!=', $property->id)
            ->where('university_id', $property->university_id)
            ->where('visibility', 'published')
            ->limit(3)
            ->get();

        return response()->json([
            'property' => $property,
            'similar' => $similar,
        ]);
    }
}

