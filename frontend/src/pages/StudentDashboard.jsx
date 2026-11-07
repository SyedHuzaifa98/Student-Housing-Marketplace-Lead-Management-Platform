import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Heart, Clock, CheckCircle2, Building, Mail, Phone, Calendar } from 'lucide-react';
import apiClient from '../api/client';
import PropertyCard from '../components/PropertyCard';

export default function StudentDashboard() {
  const [inquiries, setInquiries] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('inquiries');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [inqRes, savedRes] = await Promise.all([
          apiClient('/student/inquiries'),
          apiClient('/student/saved-properties'),
        ]);
        setInquiries(inqRes.data || []);
        setSavedProperties(savedRes.data || []);
      } catch (err) {
        console.error('Student data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusBadges = {
    new: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    contacted: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    viewing_scheduled: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    interested: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    closed: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    rejected: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
          Student Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
          My Accommodations & Inquiries
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Track landlord responses, scheduled viewings, and bookmarked student houses.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'inquiries'
              ? 'border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          My Sent Inquiries ({inquiries.length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'saved'
              ? 'border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          Saved Listings ({savedProperties.length})
        </button>
      </div>

      {/* INQUIRIES TAB */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.length > 0 ? (
            inquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        statusBadges[inq.status] || 'bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      {inq.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      Sent on {new Date(inq.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {inq.property ? (
                    <Link
                      to={`/properties/${inq.property.slug || inq.property.id}`}
                      className="text-base font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 block mt-1"
                    >
                      {inq.property.title}
                    </Link>
                  ) : (
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Property Listing</h4>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{inq.message}"</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2">
                    {inq.landlord && (
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        Landlord: {inq.landlord.name}
                      </span>
                    )}
                    {inq.preferred_move_in && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        Requested Move-in: {new Date(inq.preferred_move_in).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                  {inq.property && (
                    <Link
                      to={`/properties/${inq.property.slug || inq.property.id}`}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      View Property
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center transition-colors">
              <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No sent inquiries yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Browse our student housing catalog and submit viewing requests.
              </p>
              <Link
                to="/properties"
                className="mt-4 inline-block px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Browse Listings
              </Link>
            </div>
          )}
        </div>
      )}

      {/* SAVED PROPERTIES TAB */}
      {activeTab === 'saved' && (
        <div>
          {savedProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center transition-colors">
              <Heart className="w-10 h-10 text-rose-300 dark:text-rose-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No saved properties yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Click the heart icon on any listing card to bookmark it here.
              </p>
              <Link
                to="/properties"
                className="mt-4 inline-block px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Browse Accommodations
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
