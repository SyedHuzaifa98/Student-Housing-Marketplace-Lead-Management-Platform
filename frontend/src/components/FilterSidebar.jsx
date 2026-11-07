import React from 'react';
import { Filter, RotateCcw, Building, DollarSign, Bed, Zap, Sparkles, MapPin } from 'lucide-react';

export default function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  meta,
  totalResults,
}) {
  const roomTypes = meta?.room_types || [
    { value: 'private', label: 'Private Room' },
    { value: 'studio', label: 'Studio Apartment' },
    { value: 'shared', label: 'Shared Room' },
    { value: 'entire_flat', label: 'Entire Flat' },
  ];

  const handleRoomTypeToggle = (type) => {
    let currentTypes = filters.room_types ? filters.room_types.split(',').filter(Boolean) : [];
    if (currentTypes.includes(type)) {
      currentTypes = currentTypes.filter((t) => t !== type);
    } else {
      currentTypes.push(type);
    }
    onFilterChange('room_types', currentTypes.join(','));
  };

  const handleAmenityToggle = (slug) => {
    let currentAmenities = filters.amenities ? filters.amenities.split(',').filter(Boolean) : [];
    if (currentAmenities.includes(slug)) {
      currentAmenities = currentAmenities.filter((s) => s !== slug);
    } else {
      currentAmenities.push(slug);
    }
    onFilterChange('amenities', currentAmenities.join(','));
  };

  const selectedRoomTypes = filters.room_types ? filters.room_types.split(',').filter(Boolean) : [];
  const selectedAmenities = filters.amenities ? filters.amenities.split(',').filter(Boolean) : [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Faceted Filters</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* 1. Target University */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          University / Campus
        </label>
        <select
          value={filters.university_id || ''}
          onChange={(e) => onFilterChange('university_id', e.target.value)}
          className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
        >
          <option value="" className="text-slate-800 dark:text-slate-100 dark:bg-slate-900">All Universities ({meta?.universities?.length || 0})</option>
          {meta?.universities?.map((u) => (
            <option key={u.id} value={u.id} className="text-slate-800 dark:text-slate-100 dark:bg-slate-900">
              {u.name} ({u.city})
            </option>
          ))}
        </select>
      </div>

      {/* 2. Monthly Budget Range */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          Monthly Budget ($)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Min ($)</span>
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={filters.min_price || ''}
              onChange={(e) => onFilterChange('min_price', e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Max ($)</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={filters.max_price || ''}
              onChange={(e) => onFilterChange('max_price', e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>
        </div>
      </div>

      {/* 3. Room Type */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Bed className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          Room Type
        </label>
        <div className="space-y-2">
          {roomTypes.map((rt) => {
            const isChecked = selectedRoomTypes.includes(rt.value);
            return (
              <label
                key={rt.value}
                className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleRoomTypeToggle(rt.value)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                />
                <span>{rt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Distance to Campus */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          Proximity: {filters.max_distance ? `< ${filters.max_distance} km` : 'Any Distance'}
        </label>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.5"
          value={filters.max_distance || '5'}
          onChange={(e) => onFilterChange('max_distance', e.target.value)}
          className="w-full accent-teal-600 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          <span>0.5 km</span>
          <span>2.5 km</span>
          <span>5.0 km+</span>
        </div>
      </div>

      {/* 5. Quick Toggles (Bills Included & Available Now) */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            Bills Included
          </span>
          <input
            type="checkbox"
            checked={filters.bills_included === 'true' || filters.bills_included === true}
            onChange={(e) => onFilterChange('bills_included', e.target.checked ? 'true' : '')}
            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Available Now
          </span>
          <input
            type="checkbox"
            checked={filters.available_now === 'true' || filters.available_now === true}
            onChange={(e) => onFilterChange('available_now', e.target.checked ? 'true' : '')}
            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
      </div>

      {/* 6. Student Amenities */}
      {meta?.amenities && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
            Key Amenities
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {meta.amenities.map((amenity) => {
              const isChecked = selectedAmenities.includes(amenity.slug);
              return (
                <label
                  key={amenity.id}
                  className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleAmenityToggle(amenity.slug)}
                    className="w-3.5 h-3.5 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <span>{amenity.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
