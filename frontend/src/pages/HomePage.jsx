import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Building,
  DollarSign,
  MapPin,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
  Bed,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import apiClient from '../api/client';
import PropertyCard from '../components/PropertyCard';

export default function HomePage() {
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Search Form State
  const [universityId, setUniversityId] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [roomType, setRoomType] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metaRes, propsRes] = await Promise.all([
          apiClient('/meta'),
          apiClient('/properties?sort=featured&per_page=4'),
        ]);
        setMeta(metaRes);
        setFeaturedProperties(propsRes.data || []);
      } catch (err) {
        console.error('Home data error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (universityId) params.append('university_id', universityId);
    if (maxPrice) params.append('max_price', maxPrice);
    if (roomType) params.append('room_types', roomType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-teal-950 text-white pt-16 pb-24 sm:pt-24 sm:pb-32">
        {/* Glow backdrop shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-6 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Verified Student Accommodations &bull; Direct Landlord Inquiries
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight text-white">
            <span className="text-white">Find Your Ideal Student Home</span>{' '}
            <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              Steps Away From Campus
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Filter verified student rooms, studios, and shared apartments by university distance and
            budget. Connect directly with landlords through our centralized inquiry engine.
          </p>

          {/* Quick Search Bar */}
          <div className="mt-10 max-w-4xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-3 text-slate-800 dark:text-slate-100 text-left"
            >
              {/* University dropdown */}
              <div className="w-full md:flex-1 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition border border-transparent md:border-r md:border-slate-100 dark:md:border-slate-800">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Target University
                </label>
                <select
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                  className="w-full text-sm font-semibold bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                >
                  <option value="" className="text-slate-800 dark:text-slate-100 dark:bg-slate-900">Any University</option>
                  {meta?.universities?.map((u) => (
                    <option key={u.id} value={u.id} className="text-slate-800 dark:text-slate-100 dark:bg-slate-900">
                      {u.name} ({u.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Type */}
              <div className="w-full md:flex-1 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition border border-transparent md:border-r md:border-slate-100 dark:md:border-slate-800">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Room Type
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full text-sm font-semibold bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                >
                  <option value="" className="text-slate-800 dark:text-slate-100 dark:bg-slate-900">All Accommodation Types</option>
                  <option value="private" className="text-slate-800 dark:text-slate-100 dark:bg-slate-900">Private Room</option>
                  <option value="studio" className="text-slate-800 dark:text-slate-100 dark:bg-slate-900">Studio Flat</option>
                  <option value="shared" className="text-slate-800 dark:text-slate-100 dark:bg-slate-900">Shared Room</option>
                  <option value="entire_flat" className="text-slate-800 dark:text-slate-100 dark:bg-slate-900">Entire Apartment</option>
                </select>
              </div>

              {/* Max Budget */}
              <div className="w-full md:w-48 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Max Budget (PKR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15,000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full text-sm font-semibold bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Search Submit Button */}
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Search Housing</span>
              </button>
            </form>
          </div>

          {/* Quick Stat Highlights */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-center border-t border-slate-800/80 pt-8">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-teal-400">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Verified Listings</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-teal-400">&lt; 15 min</div>
              <div className="text-xs text-slate-400 mt-0.5">Walk to Campus</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-teal-400">Rs. 0</div>
              <div className="text-xs text-slate-400 mt-0.5">Student Booking Fees</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-teal-400">Direct</div>
              <div className="text-xs text-slate-400 mt-0.5">Landlord Inquiry CRM</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-100 dark:border-teal-800">
              Hand-picked
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              Featured Accommodations
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Top-rated listings closest to major campus lecture halls and student hubs.
            </p>
          </div>

          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition group"
          >
            Explore all listings
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>

      {/* Quick Category Discovery Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-center mb-8">
            Explore Housing By Preference
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/properties?room_types=private"
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-md transition flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold group-hover:bg-teal-600 group-hover:text-white transition">
                <Bed className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Private En-suite</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Quiet study rooms</p>
              </div>
            </Link>

            <Link
              to="/properties?room_types=studio"
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-md transition flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Studio Apartments</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Self-contained living</p>
              </div>
            </Link>

            <Link
              to="/properties?bills_included=true"
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-md transition flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold group-hover:bg-amber-600 group-hover:text-white transition">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Bills Included</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">No hidden utility bills</p>
              </div>
            </Link>

            <Link
              to="/properties?max_distance=1"
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-md transition flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold group-hover:bg-purple-600 group-hover:text-white transition">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">&lt; 1km to Campus</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Walkable in minutes</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Two-Sided Marketplace Value Proposition */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white relative overflow-hidden border border-blue-800/40">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30">
              For Students
            </span>
            <h3 className="text-2xl font-black mt-4 text-white">Stress-Free Student Living</h3>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Skip sketchy social media groups. Find inspected accommodations with clear pricing,
              all bills included tags, and schedule in-person or virtual viewings with 1 click.
            </p>
            <ul className="mt-6 space-y-2.5 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Filter by distance to your specific university lecture halls
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Track status of your viewing requests in your student portal
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Zero booking fees or agent commission surcharges
              </li>
            </ul>
            <Link
              to="/properties"
              className="mt-8 inline-block px-5 py-2.5 bg-white text-blue-950 font-bold text-xs rounded-xl shadow-md hover:bg-blue-50 transition"
            >
              Browse Student Rooms
            </Link>
          </div>

          {/* Landlord Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-teal-900 to-emerald-950 text-white relative overflow-hidden border border-teal-800/40">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
              For Landlords & Property Managers
            </span>
            <h3 className="text-2xl font-black mt-4 text-white">Automated Lead Management CRM</h3>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              List student properties, manage seasonal occupancy, and track prospective tenant leads
              through an integrated pipeline with WhatsApp quick-connect and CSV exports.
            </p>
            <ul className="mt-6 space-y-2.5 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                Manage leads through pipeline stages: New &rarr; Contacted &rarr; Closed
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                1-click WhatsApp messaging with pre-composed responses
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                Instant CSV lead export for offline records & tenancy agreements
              </li>
            </ul>
            <Link
              to="/landlord/dashboard"
              className="mt-8 inline-block px-5 py-2.5 bg-white text-teal-950 font-bold text-xs rounded-xl shadow-md hover:bg-emerald-50 transition"
            >
              Access Landlord CRM Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
