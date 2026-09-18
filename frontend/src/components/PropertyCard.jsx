import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Zap, CheckCircle2, Bed, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

export default function PropertyCard({ property, onSaveToggle }) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const primaryImage =
    property.images?.find((img) => img.is_primary)?.image_url ||
    property.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80';

  const roomTypeLabels = {
    private: 'Private Room',
    studio: 'Studio Flat',
    shared: 'Shared Room',
    entire_flat: 'Entire Apartment',
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please sign in to save properties to your favorites!');
      return;
    }

    try {
      setSaving(true);
      const res = await apiClient(`/student/saved-properties/${property.id}/toggle`, {
        method: 'POST',
      });
      setIsSaved(res.saved);
      if (onSaveToggle) onSaveToggle(property.id, res.saved);
    } catch (err) {
      console.error('Save toggle error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-teal-400/50 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 flex flex-col h-full">
      {/* Image Container with Badges */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={primaryImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-800 shadow-sm backdrop-blur-sm">
            {roomTypeLabels[property.room_type] || property.room_type}
          </span>

          <button
            onClick={handleFavoriteClick}
            disabled={saving}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition backdrop-blur-md shadow-sm ${
              isSaved
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-slate-700 hover:text-rose-500 hover:bg-white'
            }`}
            title="Save to favorites"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Overlay Badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
          {property.bills_included && (
            <span className="inline-flex items-center gap-1 bg-emerald-600/90 backdrop-blur-sm px-2 py-0.5 rounded font-medium shadow-sm">
              <Zap className="w-3 h-3 text-amber-300" />
              Bills Included
            </span>
          )}

          {property.distance_km !== null && (
            <span className="inline-flex items-center gap-1 bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded font-medium ml-auto">
              <MapPin className="w-3 h-3 text-teal-400" />
              {property.distance_km} km to campus
            </span>
          )}
        </div>
      </div>

      {/* Property Details Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* University Proximity Pill */}
        {property.university && (
          <div className="text-xs font-semibold text-teal-600 mb-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            Near {property.university.name}
          </div>
        )}

        {/* Title */}
        <Link
          to={`/properties/${property.slug || property.id}`}
          className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-teal-600 transition"
        >
          {property.title}
        </Link>

        {/* Address */}
        <p className="text-xs text-slate-500 mt-1 line-clamp-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          {property.address}, {property.city}
        </p>

        {/* Amenities preview */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
            {property.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity.id}
                className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
              >
                {amenity.name}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-[11px] text-slate-400 px-1 py-0.5">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Pricing & Footer Button */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
          <div>
            <span className="text-xl font-extrabold text-slate-900">
              ${Math.round(property.price_per_month)}
            </span>
            <span className="text-xs text-slate-500 font-medium"> / month</span>
          </div>

          <Link
            to={`/properties/${property.slug || property.id}`}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white transition shadow-sm"
          >
            View Property
          </Link>
        </div>
      </div>
    </div>
  );
}

