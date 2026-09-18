<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('landlord_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('price_per_month', 10, 2);
            $table->decimal('deposit_amount', 10, 2)->default(0);
            $table->enum('room_type', ['private', 'shared', 'studio', 'entire_flat'])->default('private');
            $table->decimal('distance_km', 5, 2)->default(1.0);
            $table->string('address');
            $table->string('city');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->boolean('bills_included')->default(false);
            $table->date('available_from');
            $table->enum('status', ['available', 'reserved', 'unavailable'])->default('available');
            $table->enum('visibility', ['published', 'draft', 'archived'])->default('published');
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });

        Schema::create('property_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->string('image_url');
            $table->string('caption')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('property_amenity', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->foreignId('amenity_id')->constrained('amenities')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_amenity');
        Schema::dropIfExists('property_images');
        Schema::dropIfExists('properties');
    }
};

