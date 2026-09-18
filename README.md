# CampusNest — Student Housing Marketplace & Lead Management Platform

A modern, high-performance **two-sided student accommodation marketplace and lead acquisition CRM** built with **React 18, Laravel 10 REST API, and MySQL (Laragon)**.

Designed specifically to demonstrate enterprise full-stack capabilities, faceted database querying, and real-world business lead pipelines for high-converting Upwork freelance proposals.

---

## ⚡ Live Upwork Recruiter & Client Quick-Tour

To make reviews fast and effortless for clients and recruiters, the application features an **interactive 1-Click Role Switcher Bar** across the top of the interface:

| Demo Role | 1-Click Persona | What It Demonstrates |
| :--- | :--- | :--- |
| 🎓 **Student View** | Ali Ahmed | Faceted filtering, distance to campus, viewing booking, saved listings |
| 🏢 **Landlord CRM** | John Henderson | Mini-CRM pipeline, WhatsApp connect, lead notes, CSV lead export, property CRUD |
| 🛡️ **Admin View** | Alexander Vance | Listings moderation, featured toggles, platform KPI oversight |

*(No registration or password typing needed — 1 click switches the live session with full permissions)*

---

## 🌟 Key Features & Business Workflows

### 1. Student / Tenant Marketplace
- **Multi-Parameter Faceted Filtering**:
  - Filter by University / Campus (Oxford, Harvard, Manchester, Toronto)
  - Price Range bounds with min/max budget sliders
  - Room Type (Private En-suite, Studio, Shared Room, Entire Flat)
  - Proximity radius to campus (`< 1 km`, `< 2.5 km`, `< 5 km`)
  - Bills Included and Available Now toggles
  - Key student amenities (WiFi, Study Desk, En-suite, Gym, Laundry)
- **URL Query State Sync**: Filters sync automatically to the URL (`?university_id=1&min_price=300&room_types=private`), allowing shareable search results.
- **Interactive OpenStreetMap / Leaflet View**: Real-time property price pins with instant property preview cards.
- **Inquiry & Viewing Scheduler**: Students can book *In-Person Viewings*, *Virtual Video Tours*, or ask *General Questions* with target move-in dates.

### 2. Landlord Mini-CRM & Property Management
- **Executive KPI Dashboard**: Total Listings, Active Occupancy, Total Leads Received, Uncontacted Leads, and Conversion Rate %.
- **Lead Pipeline CRM**: Track prospects across stages:
  $$\text{New Lead} \longrightarrow \text{Contacted} \longrightarrow \text{Viewing Scheduled} \longrightarrow \text{Interested} \longrightarrow \text{Closed / Signed} \longrightarrow \text{Rejected}$$
- **1-Click WhatsApp Connect**: Automatically opens WhatsApp Web with a pre-composed greeting referencing the specific property.
- **Private Landlord Notes**: Internal notes log for logging tenant calls and viewing outcomes.
- **Download Leads CSV**: Single-click lead export for offline records and tenancy agreements.
- **Property CRUD**: Add new listings with image galleries, pricing, proximity metrics, and toggle availability in 1 click.

### 3. Developer & Upwork Showcase
- **Built-in REST API Documentation (`/api-docs`)**: Interactive reference of all 27 REST endpoints, request payloads, and sample JSON responses.
- **Role-Based Access Control (RBAC)**: Secure token authentication powered by Laravel Sanctum.

---

## 🛠️ Architecture & Technology Stack

```
Student Housing Marketplace & Lead Management Platform/
├── backend/          # Laravel 10 REST API
│   ├── app/Models/   # Eloquent Models (User, Property, University, Amenity, Inquiry)
│   ├── app/Http/     # REST Controllers (Auth, Property, Inquiry, Landlord, Admin)
│   ├── database/     # Migrations & Seeders with realistic student housing data
│   └── routes/api.php# Versioned REST endpoints (/api/v1/...)
│
└── frontend/         # React 18 SPA (Vite)
    ├── src/api/      # API Client with Sanctum Bearer tokens
    ├── src/context/  # Authentication context & 1-click role switcher
    ├── src/components/# Navbar, DemoTourBar, PropertyCard, PropertyMap, FilterSidebar, InquiryModal
    └── src/pages/    # Home, Catalog, Details, Landlord CRM, Student Dashboard, Admin, API Docs
```

- **Backend**: PHP 8.1 / Laravel 10 REST API
- **Database**: MySQL (Laragon)
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, React-Leaflet
- **Authentication**: Laravel Sanctum (Bearer Token)

---

## 🚀 Running the Project Locally (Laragon)

### 1. Database Setup
1. Open **Laragon** and click **Start All** (Apache & MySQL).
2. The database `student_housing_db` is configured in `backend/.env`.

### 2. Start the Backend API
```bash
cd backend
php artisan serve --port=8000
```
*API Base URL: `http://127.0.0.1:8000/api/v1`*

### 3. Start the Frontend App
```bash
cd frontend
npm run dev
```
*Web App URL: `http://127.0.0.1:5173`*

---

## 💼 Upwork Proposal Talking Points (Copy & Paste for Proposals)

When applying for Laravel, React, or Marketplace jobs on Upwork, you can highlight:

> "I recently engineered **CampusNest**, a two-sided student accommodation marketplace and lead acquisition CRM built with **React, Laravel 10 REST API, and MySQL**.
> 
> Key features demonstrated:
> 1. **Faceted Database Filtering**: Handled complex multi-criteria queries (price ranges, distance to campus, room types, amenities) with live URL query synchronization.
> 2. **Lead Acquisition & Mini-CRM**: Engineered an inquiry engine where student tour requests automatically route to landlords with status pipelines (`New` → `Contacted` → `Viewing Scheduled` → `Closed`), WhatsApp quick-actions, and CSV lead exports.
> 3. **Interactive Map Integration**: Integrated Leaflet/OpenStreetMap with custom price markers and popup previews.
> 4. **Role-Based Access Control**: Clean Sanctum token authentication separating Students, Landlords, and Platform Admins.
> 
> You can test the live demo with 1-click role switching without registering at: [Link to your demo/portfolio]"

