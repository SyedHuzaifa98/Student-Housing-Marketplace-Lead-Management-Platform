import React from 'react';
import { Home, Heart, Shield, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold shadow-sm">
                <Home className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Campus<span className="text-teal-400">Nest</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Find verified student accommodation, private en-suites, and campus flats with direct landlord inquiry channels.
            </p>
          </div>

          {/* Student Accommodations */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Explore Housing
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/properties" className="hover:text-white transition">
                  All Accommodations
                </Link>
              </li>
              <li>
                <Link to="/properties?room_types=private" className="hover:text-white transition">
                  Private En-suite Rooms
                </Link>
              </li>
              <li>
                <Link to="/properties?room_types=studio" className="hover:text-white transition">
                  Studio Apartments
                </Link>
              </li>
              <li>
                <Link to="/properties?bills_included=true" className="hover:text-white transition">
                  Bills Included Housing
                </Link>
              </li>
            </ul>
          </div>

          {/* Landlords & Partners */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Portals & Hosting
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/landlord/dashboard" className="hover:text-white transition">
                  Landlord CRM & Listings
                </Link>
              </li>
              <li>
                <Link to="/student/inquiries" className="hover:text-white transition">
                  Student Inquiries
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-white transition">
                  Admin Oversight Panel
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Account Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Support */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Support & Community
            </h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer transition">
                  Help & Safety Center
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer transition">
                  Student Housing Guide
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer transition">
                  Cancellation Policies
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer transition">
                  Verified Landlords Badge
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Airbnb Style */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>&copy; {new Date().getFullYear()} CampusNest, Inc.</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 cursor-pointer">Sitemap</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1 hover:text-white cursor-pointer">
              <Globe className="w-3.5 h-3.5" /> English (US)
            </span>
            <span className="font-semibold text-white">$ USD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

