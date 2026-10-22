<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            
            // Polymorphic relation to User, Property, etc.
            $table->nullableMorphs('fileable');
            
            $table->string('file_name');               // e.g. avatar-15.webp, lease-agreement.pdf
            $table->string('file_path');               // Relative path: module/YYYY/MM/DD/parentId/filename.ext
            $table->string('mime_type', 100);          // e.g. image/webp, application/pdf
            $table->string('file_type', 50)->index();  // Semantic type: avatar, property_image, document, etc.
            $table->unsignedBigInteger('file_size');   // In bytes
            $table->json('metadata')->nullable();      // Optional extra metadata (original_name, dimensions, etc.)
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
