<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InquiryController;
use App\Http\Controllers\Api\LandlordController;
use App\Http\Controllers\Api\PropertyController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - V1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // 1. Auth & Demo Switching
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/demo-login', [AuthController::class, 'demoLogin']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
    });

    // 2. Public Meta (Universities, Amenities, Filter bounds)
    Route::get('/meta', [PropertyController::class, 'meta']);

    // 3. Properties (Public Search & Filtering)
    Route::get('/properties', [PropertyController::class, 'index']);
    Route::get('/properties/{identifier}', [PropertyController::class, 'show']);

    // 4. Inquiries / Leads (Public or Authenticated submission)
    Route::post('/properties/{propertyId}/inquiries', [InquiryController::class, 'store']);

    // 5. Student Area (Protected)
    Route::middleware('auth:sanctum')->prefix('student')->group(function () {
        Route::get('/inquiries', [InquiryController::class, 'studentInquiries']);
        Route::get('/saved-properties', [InquiryController::class, 'studentSavedProperties']);
        Route::post('/saved-properties/{propertyId}/toggle', [InquiryController::class, 'toggleSaveProperty']);
    });

    // 6. Landlord Portal & Mini-CRM (Protected)
    Route::middleware('auth:sanctum')->prefix('landlord')->group(function () {
        Route::get('/stats', [LandlordController::class, 'stats']);
        Route::get('/properties', [LandlordController::class, 'properties']);
        Route::post('/properties', [LandlordController::class, 'storeProperty']);
        Route::put('/properties/{id}', [LandlordController::class, 'updateProperty']);
        Route::delete('/properties/{id}', [LandlordController::class, 'destroyProperty']);
        Route::patch('/properties/{id}/status', [LandlordController::class, 'updatePropertyStatus']);

        // CRM Leads Engine
        Route::get('/inquiries', [LandlordController::class, 'inquiries']);
        Route::patch('/inquiries/{id}/status', [LandlordController::class, 'updateInquiryStatus']);
        Route::patch('/inquiries/{id}/notes', [LandlordController::class, 'updateInquiryNotes']);
        Route::get('/inquiries/export', [LandlordController::class, 'exportInquiriesCsv']);
    });

    // 7. Admin Moderation & Oversight (Protected)
    Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/properties', [AdminController::class, 'properties']);
        Route::patch('/properties/{id}/feature', [AdminController::class, 'toggleFeature']);
        Route::patch('/properties/{id}/visibility', [AdminController::class, 'updateVisibility']);
        Route::get('/users', [AdminController::class, 'users']);
    });
});
