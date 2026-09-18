import React, { useState } from 'react';
import { Code2, Copy, Check, Server, Shield, Database, Send, ExternalLink } from 'lucide-react';

export default function ApiDocsPage() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const endpoints = [
    {
      group: 'Authentication & Demo Engine',
      items: [
        {
          method: 'POST',
          path: '/api/v1/auth/demo-login',
          auth: 'Public',
          desc: 'Instantly issue a Sanctum Bearer token for demo testing as Student, Landlord, or Admin.',
          body: { role: 'landlord' },
          response: {
            message: 'Demo login successful as Landlord',
            user: { id: 2, name: 'John Henderson', role: 'landlord', email: 'john.landlord@studenthousing.test' },
            token: '1|0BILBfNrbwwv6XkwVYBr0hSWHTPNDlaywjtdSJSGcbe3838f',
          },
        },
        {
          method: 'POST',
          path: '/api/v1/auth/login',
          auth: 'Public',
          desc: 'Authenticate existing user with email and password.',
          body: { email: 'student@example.com', password: 'password123' },
          response: { token: 'Bearer token...', user: { id: 1, role: 'student' } },
        },
        {
          method: 'GET',
          path: '/api/v1/auth/me',
          auth: 'Bearer Token',
          desc: 'Retrieve current authenticated profile with relational inquiry and listing counts.',
          response: { user: { id: 2, name: 'John Henderson', role: 'landlord', properties_count: 3 } },
        },
      ],
    },
    {
      group: 'Accommodations & Faceted Search',
      items: [
        {
          method: 'GET',
          path: '/api/v1/meta',
          auth: 'Public',
          desc: 'Fetch filter taxonomy: universities list, available amenities, room types, and price range min/max.',
          response: {
            universities: [{ id: 1, name: 'University of Oxford', city: 'Oxford' }],
            amenities: [{ id: 1, name: 'High-Speed WiFi', slug: 'wifi' }],
            room_types: [{ value: 'private', label: 'Private Room' }],
          },
        },
        {
          method: 'GET',
          path: '/api/v1/properties?university_id=1&min_price=300&room_types=private&available_now=true&sort=price_asc',
          auth: 'Public',
          desc: 'Multi-parameter faceted search with fulltext querying, geolocation distance, and pagination.',
          response: {
            current_page: 1,
            data: [
              {
                id: 1,
                title: 'St Giles Premium Ensuite Room',
                price_per_month: 450,
                distance_km: 0.4,
                bills_included: true,
                university: { name: 'University of Oxford' },
              },
            ],
            total: 12,
          },
        },
        {
          method: 'GET',
          path: '/api/v1/properties/{slug_or_id}',
          auth: 'Public',
          desc: 'Detailed property page including image gallery, amenities list, landlord verification card, and related listings.',
          response: {
            property: { id: 1, title: '...', description: '...', images: [], amenities: [] },
            similar: [{ id: 2, title: '...' }],
          },
        },
      ],
    },
    {
      group: 'Lead Acquisition & Inquiry CRM',
      items: [
        {
          method: 'POST',
          path: '/api/v1/properties/{propertyId}/inquiries',
          auth: 'Public / Authenticated',
          desc: 'Submit student inquiry with chosen intent (physical tour, virtual video tour, or general question).',
          body: {
            student_name: 'Ali Ahmed',
            email: 'ali.student@studenthousing.test',
            phone: '+44 7911 123456',
            inquiry_type: 'physical_tour',
            preferred_move_in: '2026-10-01',
            message: 'Looking for a private viewing this Thursday afternoon.',
          },
          response: { message: 'Inquiry forwarded directly to landlord!', inquiry: { id: 1042, status: 'new' } },
        },
        {
          method: 'GET',
          path: '/api/v1/landlord/stats',
          auth: 'Landlord Bearer Token',
          desc: 'Executive performance metrics: active properties, leads count, new inquiries count, and conversion rate %.',
          response: {
            stats: { total_properties: 3, active_properties: 3, total_inquiries: 14, new_leads: 3, conversion_rate: 21.4 },
          },
        },
        {
          method: 'PATCH',
          path: '/api/v1/landlord/inquiries/{id}/status',
          auth: 'Landlord Bearer Token',
          desc: 'Update lead status across CRM pipeline: new -> contacted -> viewing_scheduled -> interested -> closed -> rejected.',
          body: { status: 'viewing_scheduled' },
          response: { message: 'Lead status marked as viewing_scheduled' },
        },
        {
          method: 'GET',
          path: '/api/v1/landlord/inquiries/export',
          auth: 'Landlord Bearer Token',
          desc: 'Stream dynamic CSV file export of all incoming tenant inquiries for offline tracking.',
          response: 'text/csv stream output (HTTP 200 attachment)',
        },
      ],
    },
  ];

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const methodColors = {
    GET: 'bg-blue-100 text-blue-700 border-blue-200',
    POST: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    PUT: 'bg-amber-100 text-amber-700 border-amber-200',
    PATCH: 'bg-purple-100 text-purple-700 border-purple-200',
    DELETE: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
            RESTful API Specification
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-3">
            CampusNest API Documentation & Reference
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Clean, decoupled architecture designed with Laravel 10, MySQL (Laragon), and Laravel Sanctum.
            Includes token authentication, faceted query parameters, and CRM lead operations.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Server className="w-3.5 h-3.5 text-teal-400" />
              Base URL: <code className="text-teal-300">http://127.0.0.1:8000/api/v1</code>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Auth: Bearer Token (Sanctum)
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              Engine: MySQL (Laragon)
            </span>
          </div>
        </div>
      </div>

      {/* Endpoints Groups */}
      <div className="space-y-10">
        {endpoints.map((group, gIdx) => (
          <div key={gIdx} className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              {group.group}
            </h2>

            <div className="space-y-4">
              {group.items.map((ep, iIdx) => {
                const uniqueKey = `${gIdx}-${iIdx}`;
                return (
                  <div
                    key={iIdx}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
                  >
                    {/* Endpoint Signature Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                            methodColors[ep.method]
                          }`}
                        >
                          {ep.method}
                        </span>
                        <code className="text-xs sm:text-sm font-bold text-slate-800">
                          {ep.path}
                        </code>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                            ep.auth === 'Public'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {ep.auth}
                        </span>

                        <button
                          onClick={() => handleCopy(`http://127.0.0.1:8000${ep.path}`, uniqueKey)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Copy path"
                        >
                          {copiedIndex === uniqueKey ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{ep.desc}</p>

                    {/* Request / Response Previews */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      {ep.body && (
                        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl overflow-x-auto">
                          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 block mb-2">
                            Request Payload
                          </span>
                          <pre>{JSON.stringify(ep.body, null, 2)}</pre>
                        </div>
                      )}

                      {ep.response && (
                        <div
                          className={`bg-slate-900 text-slate-200 p-4 rounded-xl overflow-x-auto ${
                            !ep.body ? 'md:col-span-2' : ''
                          }`}
                        >
                          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-teal-400 block mb-2">
                            JSON Response (200 OK)
                          </span>
                          <pre>
                            {typeof ep.response === 'string'
                              ? ep.response
                              : JSON.stringify(ep.response, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

