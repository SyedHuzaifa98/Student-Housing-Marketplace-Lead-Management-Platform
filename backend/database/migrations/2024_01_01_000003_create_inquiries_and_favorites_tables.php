<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inquiries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->foreignId('landlord_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('student_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('student_name');
            $table->string('email');
            $table->string('phone');
            $table->enum('inquiry_type', ['general', 'physical_tour', 'virtual_tour'])->default('general');
            $table->date('preferred_move_in')->nullable();
            $table->text('message');
            $table->enum('status', ['new', 'contacted', 'viewing_scheduled', 'interested', 'closed', 'rejected'])->default('new');
            $table->text('landlord_notes')->nullable();
            $table->timestamps();
        });

        Schema::create('saved_properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'property_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_properties');
        Schema::dropIfExists('inquiries');
    }
};

