<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\University;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Default Users (Admin, Landlords, Students)
        $admin = User::create([
            'name' => 'Alexander Vance (Platform Admin)',
            'email' => 'admin@studenthousing.test',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'phone' => '+1 (555) 019-2834',
            'avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            'company_name' => 'Campus Living Global HQ',
        ]);

        $landlord1 = User::create([
            'name' => 'John Henderson',
            'email' => 'john.landlord@studenthousing.test',
            'password' => Hash::make('password123'),
            'role' => 'landlord',
            'phone' => '+44 7700 900123',
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            'company_name' => 'Prime Student Accommodations Ltd',
        ]);

        $landlord2 = User::create([
            'name' => 'Sarah Jenkins',
            'email' => 'sarah.properties@studenthousing.test',
            'password' => Hash::make('password123'),
            'role' => 'landlord',
            'phone' => '+1 (617) 555-0149',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            'company_name' => 'Campus Suites & Flats Co.',
        ]);

        $student1 = User::create([
            'name' => 'Ali Ahmed',
            'email' => 'ali.student@studenthousing.test',
            'password' => Hash::make('password123'),
            'role' => 'student',
            'phone' => '+44 7911 123456',
            'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        ]);

        $student2 = User::create([
            'name' => 'Elena Rostova',
            'email' => 'elena.student@studenthousing.test',
            'password' => Hash::make('password123'),
            'role' => 'student',
            'phone' => '+1 (555) 432-8765',
            'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        ]);

        // 2. Create Universities
        $oxford = University::create([
            'name' => 'University of Oxford',
            'city' => 'Oxford',
            'address' => 'Wellington Square, Oxford OX1 2JD, UK',
            'latitude' => 51.754816,
            'longitude' => -1.254367,
            'logo_url' => 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=100&auto=format&fit=crop&q=80',
        ]);

        $harvard = University::create([
            'name' => 'Harvard University',
            'city' => 'Cambridge / Boston',
            'address' => 'Massachusetts Hall, Cambridge, MA 02138, USA',
            'latitude' => 42.377003,
            'longitude' => -71.116661,
            'logo_url' => 'https://images.unsplash.com/photo-1562774053-701939374585?w=100&auto=format&fit=crop&q=80',
        ]);

        $manchester = University::create([
            'name' => 'University of Manchester',
            'city' => 'Manchester',
            'address' => 'Oxford Rd, Manchester M13 9PL, UK',
            'latitude' => 53.466835,
            'longitude' => -2.233959,
            'logo_url' => 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&auto=format&fit=crop&q=80',
        ]);

        $toronto = University::create([
            'name' => 'University of Toronto',
            'city' => 'Toronto',
            'address' => '27 King\'s College Cir, Toronto, ON M5S, Canada',
            'latitude' => 43.662892,
            'longitude' => -79.395656,
            'logo_url' => 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=100&auto=format&fit=crop&q=80',
        ]);

        // 3. Create Amenities
        $amenitiesList = [
            ['name' => 'High-Speed WiFi', 'slug' => 'wifi', 'icon_name' => 'Wifi'],
            ['name' => 'All Bills Included', 'slug' => 'bills_included', 'icon_name' => 'Zap'],
            ['name' => 'Study Desk & Chair', 'slug' => 'study_desk', 'icon_name' => 'BookOpen'],
            ['name' => 'En-suite Private Bath', 'slug' => 'ensuite', 'icon_name' => 'Bath'],
            ['name' => 'In-Unit Laundry', 'slug' => 'laundry', 'icon_name' => 'Sparkles'],
            ['name' => '24/7 CCTV & Security', 'slug' => 'security', 'icon_name' => 'ShieldCheck'],
            ['name' => 'Secure Bike Storage', 'slug' => 'bike_storage', 'icon_name' => 'Bike'],
            ['name' => 'Central Heating & AC', 'slug' => 'heating_ac', 'icon_name' => 'Wind'],
            ['name' => 'Chef-Style Kitchen', 'slug' => 'kitchen', 'icon_name' => 'Utensils'],
            ['name' => 'Fitness Gym Access', 'slug' => 'gym', 'icon_name' => 'Dumbbell'],
        ];

        $amenityModels = [];
        foreach ($amenitiesList as $a) {
            $amenityModels[$a['slug']] = Amenity::create($a);
        }

        // 4. Create Properties with High-Res Photography
        $propertiesData = [
            [
                'landlord_id' => $landlord1->id,
                'university_id' => $oxford->id,
                'title' => 'St Giles Premium En-suite Room in Historic Residence',
                'slug' => 'st-giles-premium-ensuite-room-oxford',
                'description' => 'A bright, quiet ensuite room located inside a newly refurbished Victorian student townhome. Ideal for postgraduates and focused undergrads. Comes equipped with high-speed fiber internet, ergonomic study desk, ample wardrobe storage, and access to a shared gourmet kitchen. Water, heating, electricity, and council tax are 100% included.',
                'price_per_month' => 450.00,
                'deposit_amount' => 450.00,
                'room_type' => 'private',
                'distance_km' => 0.4,
                'address' => '34 St Giles\', Oxford',
                'city' => 'Oxford',
                'latitude' => 51.7582,
                'longitude' => -1.2605,
                'bills_included' => true,
                'available_from' => now()->addDays(2)->toDateString(),
                'status' => 'available',
                'visibility' => 'published',
                'is_featured' => true,
                'amenities' => ['wifi', 'bills_included', 'study_desk', 'ensuite', 'security', 'bike_storage', 'heating_ac'],
                'images' => [
                    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&auto=format&fit=crop&q=80',
                ]
            ],
            [
                'landlord_id' => $landlord1->id,
                'university_id' => $oxford->id,
                'title' => 'Modern Studio Apartment near Oxford Science Area',
                'slug' => 'modern-studio-apartment-oxford-science-area',
                'description' => 'Self-contained luxury studio featuring a private kitchenette, private bathroom, double bed, and floor-to-ceiling windows. Located just 5 minutes walk from Oxford University parks and science department libraries. Digital keypad entry and 24/7 CCTV onsite.',
                'price_per_month' => 620.00,
                'deposit_amount' => 600.00,
                'room_type' => 'studio',
                'distance_km' => 0.8,
                'address' => '12 South Parks Road, Oxford',
                'city' => 'Oxford',
                'latitude' => 51.7595,
                'longitude' => -1.2530,
                'bills_included' => true,
                'available_from' => now()->toDateString(),
                'status' => 'available',
                'visibility' => 'published',
                'is_featured' => true,
                'amenities' => ['wifi', 'bills_included', 'study_desk', 'ensuite', 'laundry', 'security', 'gym'],
                'images' => [
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
                ]
            ],
            [
                'landlord_id' => $landlord2->id,
                'university_id' => $harvard->id,
                'title' => 'Harvard Square Sunlit Private Room in 3-Bed Student Flat',
                'slug' => 'harvard-square-sunlit-private-room-cambridge',
                'description' => 'Spacious bedroom in a recently renovated 3-bedroom student apartment located 2 blocks from Harvard Yard. High ceilings, hardwood floors, large double closet, and quiet courtyard view. Living room and kitchen shared with two graduate students. Washer and dryer in basement.',
                'price_per_month' => 580.00,
                'deposit_amount' => 580.00,
                'room_type' => 'private',
                'distance_km' => 0.5,
                'address' => '45 Mount Auburn St, Cambridge, MA',
                'city' => 'Cambridge / Boston',
                'latitude' => 42.3718,
                'longitude' => -71.1172,
                'bills_included' => false,
                'available_from' => now()->addDays(10)->toDateString(),
                'status' => 'available',
                'visibility' => 'published',
                'is_featured' => true,
                'amenities' => ['wifi', 'study_desk', 'laundry', 'kitchen', 'heating_ac', 'bike_storage'],
                'images' => [
                    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
                ]
            ],
            [
                'landlord_id' => $landlord2->id,
                'university_id' => $harvard->id,
                'title' => 'Budget Shared Twin Room with Cambridge Campus Shuttle',
                'slug' => 'budget-shared-twin-room-cambridge',
                'description' => 'Economical twin room setup for undergraduate students wanting to cut rental costs. Each bed has its own dedicated desk and reading light. Regular housekeeping for common areas, ultra-fast 1 Gbps fiber WiFi, and on-campus shuttle bus right outside your front door.',
                'price_per_month' => 290.00,
                'deposit_amount' => 250.00,
                'room_type' => 'shared',
                'distance_km' => 1.8,
                'address' => '210 Concord Ave, Cambridge, MA',
                'city' => 'Cambridge / Boston',
                'latitude' => 42.3842,
                'longitude' => -71.1398,
                'bills_included' => true,
                'available_from' => now()->toDateString(),
                'status' => 'available',
                'visibility' => 'published',
                'is_featured' => false,
                'amenities' => ['wifi', 'bills_included', 'study_desk', 'security', 'kitchen', 'laundry'],
                'images' => [
                    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
                ]
            ],
            [
                'landlord_id' => $landlord1->id,
                'university_id' => $manchester->id,
                'title' => 'Fallowfield Student Hub - Luxury En-suite with Private Gym',
                'slug' => 'fallowfield-student-hub-luxury-ensuite-manchester',
                'description' => 'Located in the heart of Manchester’s most vibrant student community! Includes high-spec private en-suite bathroom, modern shared social lounge with pool table, and complimentary 24hr gym access. Bus stop with 24-hour buses to Oxford Road campus directly outside.',
                'price_per_month' => 380.00,
                'deposit_amount' => 300.00,
                'room_type' => 'private',
                'distance_km' => 2.1,
                'address' => '78 Wilmslow Road, Fallowfield, Manchester',
                'city' => 'Manchester',
                'latitude' => 53.4442,
                'longitude' => -2.2185,
                'bills_included' => true,
                'available_from' => now()->toDateString(),
                'status' => 'available',
                'visibility' => 'published',
                'is_featured' => true,
                'amenities' => ['wifi', 'bills_included', 'ensuite', 'gym', 'security', 'study_desk', 'laundry'],
                'images' => [
                    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&auto=format&fit=crop&q=80',
                ]
            ],
            [
                'landlord_id' => $landlord1->id,
                'university_id' => $manchester->id,
                'title' => 'Entire 2-Bedroom Student Apartment Oxford Road Corridor',
                'slug' => 'entire-2-bedroom-apartment-oxford-road-manchester',
                'description' => 'Rare opportunity to rent an entire 2-bed apartment directly opposite the University of Manchester main campus building. Two large equal-sized bedrooms, open plan designer kitchen/living space, and private balcony. Perfect for two friends wishing to share.',
                'price_per_month' => 740.00,
                'deposit_amount' => 740.00,
                'room_type' => 'entire_flat',
                'distance_km' => 0.3,
                'address' => '112 Oxford Road, Manchester',
                'city' => 'Manchester',
                'latitude' => 53.4682,
                'longitude' => -2.2351,
                'bills_included' => false,
                'available_from' => now()->addDays(5)->toDateString(),
                'status' => 'available',
                'visibility' => 'published',
                'is_featured' => true,
                'amenities' => ['wifi', 'study_desk', 'kitchen', 'laundry', 'security', 'heating_ac'],
                'images' => [
                    'https://images.unsplash.com/photo-1502005229762-ee1b2b814660?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop&q=80',
                ]
            ],
            [
                'landlord_id' => $landlord2->id,
                'university_id' => $toronto->id,
                'title' => 'St George Campus High-Rise Studio with Downtown Views',
                'slug' => 'st-george-campus-high-rise-studio-toronto',
                'description' => 'Brand new studio unit on the 18th floor overlooking downtown Toronto. Steps to Robarts Library and St George Subway station. High end stainless steel appliances, central heat and air conditioning, quartz countertops, and concierge security desk.',
                'price_per_month' => 690.00,
                'deposit_amount' => 690.00,
                'room_type' => 'studio',
                'distance_km' => 0.6,
                'address' => '88 Bloor St West, Toronto, ON',
                'city' => 'Toronto',
                'latitude' => 43.6698,
                'longitude' => -79.3891,
                'bills_included' => true,
                'available_from' => now()->toDateString(),
                'status' => 'available',
                'visibility' => 'published',
                'is_featured' => true,
                'amenities' => ['wifi', 'bills_included', 'ensuite', 'gym', 'heating_ac', 'security', 'laundry'],
                'images' => [
                    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200&auto=format&fit=crop&q=80',
                ]
            ],
            [
                'landlord_id' => $landlord2->id,
                'university_id' => $toronto->id,
                'title' => 'Cozy Private Room in Kensington Market Student Victorian',
                'slug' => 'kensington-market-private-room-toronto',
                'description' => 'Live in Toronto’s most artistic and eclectic neighborhood, just 7 minutes walk to U of T campus! Full of character with high ceilings, large windows, and friendly international student housemates. All utilities and high-speed internet covered in monthly rent.',
                'price_per_month' => 370.00,
                'deposit_amount' => 350.00,
                'room_type' => 'private',
                'distance_km' => 1.1,
                'address' => '14 Augusta Ave, Toronto, ON',
                'city' => 'Toronto',
                'latitude' => 43.6521,
                'longitude' => -79.4012,
                'bills_included' => true,
                'available_from' => now()->addDays(14)->toDateString(),
                'status' => 'available',
                'visibility' => 'published',
                'is_featured' => false,
                'amenities' => ['wifi', 'bills_included', 'study_desk', 'kitchen', 'laundry', 'bike_storage'],
                'images' => [
                    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=1200&auto=format&fit=crop&q=80',
                ]
            ],
        ];

        $createdProperties = [];
        foreach ($propertiesData as $pData) {
            $amenitySlugs = $pData['amenities'];
            $images = $pData['images'];
            unset($pData['amenities'], $pData['images']);

            $property = Property::create($pData);
            $createdProperties[] = $property;

            // Attach amenities
            $amenityIds = [];
            foreach ($amenitySlugs as $slug) {
                if (isset($amenityModels[$slug])) {
                    $amenityIds[] = $amenityModels[$slug]->id;
                }
            }
            $property->amenities()->sync($amenityIds);

            // Add images
            foreach ($images as $index => $imgUrl) {
                PropertyImage::create([
                    'property_id' => $property->id,
                    'image_url' => $imgUrl,
                    'caption' => 'Photo ' . ($index + 1),
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        }

        // 5. Seed Inquiries (Mini-CRM Data with realistic stages)
        $inquiriesData = [
            [
                'property_id' => $createdProperties[0]->id,
                'landlord_id' => $createdProperties[0]->landlord_id,
                'student_id' => $student1->id,
                'student_name' => 'Ali Ahmed',
                'email' => 'ali.student@studenthousing.test',
                'phone' => '+44 7911 123456',
                'inquiry_type' => 'physical_tour',
                'preferred_move_in' => now()->addDays(7)->toDateString(),
                'message' => 'Hello! I am an incoming postgraduate student at Oxford starting next month. Can I arrange an in-person viewing this Thursday afternoon around 3 PM?',
                'status' => 'new',
                'landlord_notes' => 'New prospective tenant. Studying MSc Computer Science.',
                'created_at' => now()->subHours(2),
            ],
            [
                'property_id' => $createdProperties[0]->id,
                'landlord_id' => $createdProperties[0]->landlord_id,
                'student_id' => $student2->id,
                'student_name' => 'Elena Rostova',
                'email' => 'elena.student@studenthousing.test',
                'phone' => '+1 (555) 432-8765',
                'inquiry_type' => 'virtual_tour',
                'preferred_move_in' => now()->addDays(14)->toDateString(),
                'message' => 'Hi John, I am currently overseas in Canada and would love to do a WhatsApp video tour before paying the holding deposit. Is that possible?',
                'status' => 'contacted',
                'landlord_notes' => 'Replied via WhatsApp. Sent link to virtual 360 walk-through video.',
                'created_at' => now()->subDay(),
            ],
            [
                'property_id' => $createdProperties[1]->id,
                'landlord_id' => $createdProperties[1]->landlord_id,
                'student_id' => null,
                'student_name' => 'Marcus Thorne',
                'email' => 'marcus.thorne@oxford.ac.uk',
                'phone' => '+44 7820 445566',
                'inquiry_type' => 'physical_tour',
                'preferred_move_in' => now()->addDays(3)->toDateString(),
                'message' => 'Looking for immediate move-in for this academic year. Are bills really 100% included in the £620 figure?',
                'status' => 'viewing_scheduled',
                'landlord_notes' => 'Viewing scheduled for Friday 11:00 AM. Student has verified enrollment letter.',
                'created_at' => now()->subDays(2),
            ],
            [
                'property_id' => $createdProperties[2]->id,
                'landlord_id' => $createdProperties[2]->landlord_id,
                'student_id' => $student1->id,
                'student_name' => 'Ali Ahmed',
                'email' => 'ali.student@studenthousing.test',
                'phone' => '+1 (617) 555-8899',
                'inquiry_type' => 'general',
                'preferred_move_in' => now()->addDays(20)->toDateString(),
                'message' => 'Hi Sarah! Is the parking space included or is there an additional permit fee for street parking?',
                'status' => 'interested',
                'landlord_notes' => 'Answered question regarding Cambridge city resident permit ($25/yr). Tenant highly interested.',
                'created_at' => now()->subDays(3),
            ],
            [
                'property_id' => $createdProperties[4]->id,
                'landlord_id' => $createdProperties[4]->landlord_id,
                'student_id' => null,
                'student_name' => 'Kavita Patel',
                'email' => 'kavita.p@student.manchester.ac.uk',
                'phone' => '+44 7900 882233',
                'inquiry_type' => 'physical_tour',
                'preferred_move_in' => now()->addDays(1)->toDateString(),
                'message' => 'Signed the tenancy agreement and paid holding deposit yesterday. Excited to move in!',
                'status' => 'closed',
                'landlord_notes' => 'Lease signed for 12 months. Deposit received in client escrow account.',
                'created_at' => now()->subDays(5),
            ],
        ];

        foreach ($inquiriesData as $inq) {
            Inquiry::create($inq);
        }

        // 6. User saved property (Ali saves Oxford Studio)
        $student1->savedProperties()->sync([$createdProperties[0]->id, $createdProperties[1]->id]);
    }
}
