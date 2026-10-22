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
        // 1. Create Default Users (Admin, Pakistani Landlords, Students)
        $admin = User::create([
            'name' => 'CampusNest Operations Admin',
            'email' => 'admin@studenthousing.test',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'phone' => '+92 300 0000000',
            'avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            'company_name' => 'CampusNest Sindh Hub HQ',
        ]);

        $landlord1 = User::create([
            'name' => 'Tarique Brohi',
            'email' => 'john.landlord@studenthousing.test', // Keep email for demo credentials consistency
            'password' => Hash::make('password123'),
            'role' => 'landlord',
            'phone' => '+92 300 1234567',
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            'company_name' => 'Al-Madina Student Accommodations Jamshoro',
        ]);

        $landlord2 = User::create([
            'name' => 'Dr. Farhan Memon',
            'email' => 'sarah.properties@studenthousing.test', // Keep email for demo credentials consistency
            'password' => Hash::make('password123'),
            'role' => 'landlord',
            'phone' => '+92 333 9876543',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            'company_name' => 'Indus Residentials Hyderabad & Jamshoro',
        ]);

        $student1 = User::create([
            'name' => 'Ali Ahmed',
            'email' => 'ali.student@studenthousing.test',
            'password' => Hash::make('password123'),
            'role' => 'student',
            'phone' => '+92 312 3456789',
            'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        ]);

        $student2 = User::create([
            'name' => 'Ayesha Memon',
            'email' => 'elena.student@studenthousing.test', // Keep email for demo credentials consistency
            'password' => Hash::make('password123'),
            'role' => 'student',
            'phone' => '+92 301 9876543',
            'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        ]);

        // 2. Create Universities in Jamshoro & Hyderabad, Sindh
        $muet = University::create([
            'name' => 'Mehran University of Engineering and Technology (MUET)',
            'city' => 'Jamshoro',
            'address' => 'Indus Highway, Jamshoro, Sindh 76062, Pakistan',
            'latitude' => 25.408200,
            'longitude' => 68.261800,
            'logo_url' => 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=100&auto=format&fit=crop&q=80',
        ]);

        $uos = University::create([
            'name' => 'University of Sindh (UoS)',
            'city' => 'Jamshoro',
            'address' => 'Allama I.I. Kazi Campus, Jamshoro, Sindh 76080, Pakistan',
            'latitude' => 25.429400,
            'longitude' => 68.272100,
            'logo_url' => 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&auto=format&fit=crop&q=80',
        ]);

        $lumhs = University::create([
            'name' => 'Liaquat University of Medical & Health Sciences (LUMHS)',
            'city' => 'Jamshoro',
            'address' => 'Indus Highway, Jamshoro, Sindh 76090, Pakistan',
            'latitude' => 25.419000,
            'longitude' => 68.258000,
            'logo_url' => 'https://images.unsplash.com/photo-1562774053-701939374585?w=100&auto=format&fit=crop&q=80',
        ]);

        $gcuh = University::create([
            'name' => 'Govt College University Hyderabad (GCUH)',
            'city' => 'Hyderabad',
            'address' => 'Kali Mori, Hyderabad, Sindh 71000, Pakistan',
            'latitude' => 25.396000,
            'longitude' => 68.367900,
            'logo_url' => 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=100&auto=format&fit=crop&q=80',
        ]);

        // 3. Create Amenities
        $amenitiesList = [
            ['name' => 'High-Speed WiFi', 'slug' => 'wifi', 'icon_name' => 'Wifi'],
            ['name' => 'All Bills Included (Mess & Power)', 'slug' => 'bills_included', 'icon_name' => 'Zap'],
            ['name' => 'Study Desk & Chair', 'slug' => 'study_desk', 'icon_name' => 'BookOpen'],
            ['name' => 'Attached Private Bath', 'slug' => 'ensuite', 'icon_name' => 'Bath'],
            ['name' => 'In-Unit Laundry & Ironing', 'slug' => 'laundry', 'icon_name' => 'Sparkles'],
            ['name' => '24/7 CCTV & Security Guard', 'slug' => 'security', 'icon_name' => 'ShieldCheck'],
            ['name' => 'Secure Bike / Motorbike Parking', 'slug' => 'bike_storage', 'icon_name' => 'Bike'],
            ['name' => 'Air Conditioned / UPS Backup', 'slug' => 'heating_ac', 'icon_name' => 'Wind'],
            ['name' => 'Shared Kitchen / Mess Facility', 'slug' => 'kitchen', 'icon_name' => 'Utensils'],
            ['name' => 'Fitness Gym Access', 'slug' => 'gym', 'icon_name' => 'Dumbbell'],
        ];

        $amenityModels = [];
        foreach ($amenitiesList as $a) {
            $amenityModels[$a['slug']] = Amenity::create($a);
        }

        // 4. Create Properties with Jamshoro / Hyderabad locations & PKR pricing
        $propertiesData = [
            [
                'landlord_id' => $landlord1->id,
                'university_id' => $muet->id,
                'title' => 'Al-Madina Executive En-suite Room near MUET Gate 1',
                'slug' => 'al-madina-executive-ensuite-room-muet',
                'description' => 'Spacious private en-suite room for engineering students located right across MUET Gate 1. Features 24/7 solar UPS power backup, superfast optical fiber WiFi, silent study desk with chair, attached modern tiled bathroom, and mess facility access. Drinking water supplied from commercial RO plant.',
                'price_per_month' => 14000.00,
                'deposit_amount' => 10000.00,
                'room_type' => 'private',
                'distance_km' => 0.4,
                'address' => 'Opposite MUET Gate 1, Society Phase 1, Jamshoro',
                'city' => 'Jamshoro',
                'latitude' => 25.4095,
                'longitude' => 68.2640,
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
                'university_id' => $muet->id,
                'title' => 'Indus Scholars Shared 2-Bed Room with AC & UPS Backup',
                'slug' => 'indus-scholars-shared-room-jamshoro',
                'description' => 'Comfortable two-seater shared room for undergraduate students. Individual wooden wardrobes, separate study desks, 24/7 CCTV protection, secure bike parking, and cold RO water. Walking distance to university point bus terminal.',
                'price_per_month' => 7500.00,
                'deposit_amount' => 5000.00,
                'room_type' => 'shared',
                'distance_km' => 0.8,
                'address' => 'Sindh University Society Phase 2, Jamshoro',
                'city' => 'Jamshoro',
                'latitude' => 25.4120,
                'longitude' => 68.2675,
                'bills_included' => true,
                'available_from' => now()->toDateString(),
                'status' => 'available',
                'visibility' => 'published',
                'is_featured' => true,
                'amenities' => ['wifi', 'bills_included', 'study_desk', 'security', 'bike_storage'],
                'images' => [
                    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
                ]
            ],
            [
                'landlord_id' => $landlord2->id,
                'university_id' => $lumhs->id,
                'title' => 'Fully Furnished Studio Apartment opposite LUMHS Hospital',
                'slug' => 'fully-furnished-studio-apartment-lumhs-jamshoro',
                'description' => 'Self-contained private studio apartment specifically tailored for MBBS students and house-officers. Equipped with independent kitchen, geyser, inverter AC, study zone, and high security.',
                'price_per_month' => 22000.00,
                'deposit_amount' => 20000.00,
                'room_type' => 'studio',
                'distance_km' => 0.3,
                'address' => 'Near Civil Hospital Gate, Indus Highway, Jamshoro',
                'city' => 'Jamshoro',
                'latitude' => 25.4205,
                'longitude' => 68.2595,
                'bills_included' => false,
                'available_from' => now()->addDays(5)->toDateString(),
                'status' => 'available',
                'visibility' => 'published',
                'is_featured' => true,
                'amenities' => ['wifi', 'study_desk', 'ensuite', 'kitchen', 'heating_ac', 'security'],
                'images' => [
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
                ]
            ],
            [
                'landlord_id' => $landlord1->id,
                'university_id' => $uos->id,
                'title' => 'Quiet Postgraduate Single Room near Sindh Uni Central Library',
                'slug' => 'postgraduate-single-room-sindh-university-jamshoro',
                'description' => 'Peaceful environment with single bed and large study desk for MPhil/PhD and competitive exams preparation. Fast fiber WiFi and mess delivery available.',
                'price_per_month' => 11000.00,
                'deposit_amount' => 8000.00,
                'room_type' => 'private',
                'distance_km' => 0.6,
                'address' => 'Main Campus Road, Jamshoro Phatak, Jamshoro',
                'city' => 'Jamshoro',
                'latitude' => 25.4270,
                'longitude' => 68.2705,
                'bills_included' => true,
                'available_from' => now()->toDateString(),
                'status' => 'available',
                'visibility' => 'published',
                'is_featured' => false,
                'amenities' => ['wifi', 'bills_included', 'study_desk', 'security', 'bike_storage'],
                'images' => [
                    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
                ]
            ],
            [
                'landlord_id' => $landlord2->id,
                'university_id' => $muet->id,
                'title' => 'Upper Portion 2-Bed Flat in Citizen Colony for Group of Students',
                'slug' => 'citizen-colony-2-bed-flat-jamshoro-road-hyderabad',
                'description' => 'Spacious 2-bedroom portion with lounge, dedicated terrace, and tiled kitchen. Very peaceful residential neighborhood on Jamshoro Road with direct point buses and vans to MUET, UoS, and LUMHS in 10 minutes.',
                'price_per_month' => 32000.00,
                'deposit_amount' => 30000.00,
                'room_type' => 'entire_flat',
                'distance_km' => 4.5,
                'address' => 'Block B, Citizen Colony, Jamshoro Road, Hyderabad',
                'city' => 'Hyderabad',
                'latitude' => 25.3980,
                'longitude' => 68.3150,
                'bills_included' => false,
                'available_from' => now()->addDays(7)->toDateString(),
                'status' => 'available',
                'visibility' => 'published',
                'is_featured' => true,
                'amenities' => ['wifi', 'study_desk', 'kitchen', 'security', 'bike_storage', 'heating_ac'],
                'images' => [
                    'https://images.unsplash.com/photo-1502005229762-ee1b2b814660?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop&q=80',
                ]
            ],
            [
                'landlord_id' => $landlord2->id,
                'university_id' => $lumhs->id,
                'title' => 'Modern Shared Room with Mess Facility on Wadhu Wah Road',
                'slug' => 'modern-shared-room-wadhu-wah-road-qasimabad',
                'description' => 'Prime student location in Qasimabad with access to banks, restaurants, bookshops, and rapid Jamshoro coaster/van shuttle stops. Daily cleaning, high-speed WiFi, and peaceful study atmosphere.',
                'price_per_month' => 8500.00,
                'deposit_amount' => 6000.00,
                'room_type' => 'shared',
                'distance_km' => 6.2,
                'address' => 'Near Naseem Nagar Chowk, Wadhu Wah Road, Qasimabad, Hyderabad',
                'city' => 'Hyderabad',
                'latitude' => 25.3850,
                'longitude' => 68.3280,
                'bills_included' => true,
                'available_from' => now()->toDateString(),
                'status' => 'available',
                'visibility' => 'published',
                'is_featured' => true,
                'amenities' => ['wifi', 'bills_included', 'study_desk', 'laundry', 'security'],
                'images' => [
                    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&auto=format&fit=crop&q=80',
                ]
            ],
            [
                'landlord_id' => $landlord2->id,
                'university_id' => $gcuh->id,
                'title' => 'Secure En-suite Room in Dedicated Female Student Hostel',
                'slug' => 'secure-ensuite-room-female-student-hostel-qasimabad',
                'description' => 'Strict 24/7 female warden security, biometric entry, solar backup, in-house hygienic mess service, and scheduled morning pick-and-drop point to Jamshoro & Hyderabad universities.',
                'price_per_month' => 15000.00,
                'deposit_amount' => 12000.00,
                'room_type' => 'private',
                'distance_km' => 3.8,
                'address' => 'Main Road, Prince Town, Qasimabad, Hyderabad',
                'city' => 'Hyderabad',
                'latitude' => 25.3890,
                'longitude' => 68.3320,
                'bills_included' => true,
                'available_from' => now()->addDays(3)->toDateString(),
                'status' => 'available',
                'visibility' => 'published',
                'is_featured' => true,
                'amenities' => ['wifi', 'bills_included', 'study_desk', 'ensuite', 'security', 'laundry'],
                'images' => [
                    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200&auto=format&fit=crop&q=80',
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
                'phone' => '+92 312 3456789',
                'inquiry_type' => 'physical_tour',
                'preferred_move_in' => now()->addDays(5)->toDateString(),
                'message' => 'Salam Tarique bhai, I am an incoming Software Engineering student at MUET. Can I visit this Thursday afternoon around 4 PM to inspect the room and solar backup?',
                'status' => 'new',
                'landlord_notes' => 'New prospective tenant from Sukkur. Studying BE Software Engineering at MUET.',
                'created_at' => now()->subHours(2),
            ],
            [
                'property_id' => $createdProperties[0]->id,
                'landlord_id' => $createdProperties[0]->landlord_id,
                'student_id' => $student2->id,
                'student_name' => 'Ayesha Memon',
                'email' => 'elena.student@studenthousing.test',
                'phone' => '+92 301 9876543',
                'inquiry_type' => 'virtual_tour',
                'preferred_move_in' => now()->addDays(10)->toDateString(),
                'message' => 'Salam! Is mess food included in the monthly rent or billed separately? Would appreciate a quick video walkthrough.',
                'status' => 'contacted',
                'landlord_notes' => 'Replied via WhatsApp. Sent photos of the attached bathroom and mess menu.',
                'created_at' => now()->subDay(),
            ],
            [
                'property_id' => $createdProperties[2]->id,
                'landlord_id' => $createdProperties[2]->landlord_id,
                'student_id' => null,
                'student_name' => 'Dr. Kamran Soomro',
                'email' => 'kamran.lumhs@gmail.com',
                'phone' => '+92 345 1122334',
                'inquiry_type' => 'physical_tour',
                'preferred_move_in' => now()->addDays(3)->toDateString(),
                'message' => 'Need studio flat for house job duty at LUMHS Civil Hospital Jamshoro. Is advance deposit negotiable?',
                'status' => 'viewing_scheduled',
                'landlord_notes' => 'Viewing scheduled for Friday 5:00 PM near LUMHS emergency gate.',
                'created_at' => now()->subDays(2),
            ],
            [
                'property_id' => $createdProperties[4]->id,
                'landlord_id' => $createdProperties[4]->landlord_id,
                'student_id' => $student1->id,
                'student_name' => 'Ali Ahmed',
                'email' => 'ali.student@studenthousing.test',
                'phone' => '+92 312 3456789',
                'inquiry_type' => 'general',
                'preferred_move_in' => now()->addDays(15)->toDateString(),
                'message' => 'Hi, we are 4 batchmates from MUET looking to share this Citizen Colony portion. Is secure motorcycle parking available in the porch?',
                'status' => 'interested',
                'landlord_notes' => 'Confirmed 4 bike parking space available in covered porch. Tenant discussing with roommates.',
                'created_at' => now()->subDays(3),
            ],
            [
                'property_id' => $createdProperties[1]->id,
                'landlord_id' => $createdProperties[1]->landlord_id,
                'student_id' => null,
                'student_name' => 'Farhan Chandio',
                'email' => 'farhan.chandio@gmail.com',
                'phone' => '+92 334 5566778',
                'inquiry_type' => 'physical_tour',
                'preferred_move_in' => now()->addDays(1)->toDateString(),
                'message' => 'Signed agreement and paid security deposit. Ready to shift luggage tomorrow.',
                'status' => 'closed',
                'landlord_notes' => 'Agreement signed for current semester. Security deposit received in bank account.',
                'created_at' => now()->subDays(5),
            ],
        ];

        foreach ($inquiriesData as $inq) {
            Inquiry::create($inq);
        }

        // 6. User saved property (Ali saves MUET En-suite and Shared Room)
        $student1->savedProperties()->sync([$createdProperties[0]->id, $createdProperties[1]->id]);
    }
}
