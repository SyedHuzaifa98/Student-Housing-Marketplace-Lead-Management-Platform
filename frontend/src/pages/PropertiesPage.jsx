import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Map,
  Grid,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Search,
  Building,
  AlertCircle,
  X,
} from 'lucide-react';
import apiClient from '../api/client';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import FilterSidebar from '../components/FilterSidebar';

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // View mode: 'grid' or 'split' (grid + map)
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Parse filters from URL
  const getFiltersFromUrl = () => ({
    search: searchParams.get('search') || '',
    university_id: searchParams.get('university_id') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    room_types: searchParams.get('room_types') || '',
    bills_included: searchParams.get('bills_included') || '',
    available_now: searchParams.get('available_now') || '',
    max_distance: searchParams.get('max_distance') || '',
    amenities: searchParams.get('amenities') || '',
    sort: searchParams.get('sort') || 'featured',
    page: searchParams.get('page') || '1',
  });

  const [filters, setFilters] = useState(getFiltersFromUrl());

  // Load Meta initially
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const metaRes = await apiClient('/meta');
        setMeta(metaRes);
      } catch (err) {
        console.error('Meta fetch error:', err);
      }
    };
    fetchMeta();
  }, []);

  // Fetch properties whenever searchParams changes
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const query = searchParams.toString();
        const res = await apiClient(`/properties?${query}`);
        setProperties(res.data || []);
        setTotal(res.total || 0);
        setCurrentPage(res.current_page || 1);
        setLastPage(res.last_page || 1);
      } catch (err) {
        console.error('Properties fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
    setFilters(getFiltersFromUrl());
  }, [searchParams]);

  // Update a filter and sync to URL
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: '1' };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) {
        params.append(k, v);
      }
    });
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      university_id: '',
      min_price: '',
      max_price: '',
      room_types: '',
      bills_included: '',
      available_now: '',
      max_distance: '',
      amenities: '',
      sort: 'featured',
      page: '1',
    });
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      handleFilterChange('page', newPage.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Active filter pills
  const activeFilters = [];
  if (filters.university_id && meta?.universities) {
    const uni = meta.universities.find((u) => u.id.toString() === filters.university_id);
    if (uni) activeFilters.push({ key: 'university_id', label: `Uni: ${uni.name}` });
  }
  if (filters.min_price) activeFilters.push({ key: 'min_price', label: `Min: Rs. ${Number(filters.min_price).toLocaleString('en-PK')}` });
  if (filters.max_price) activeFilters.push({ key: 'max_price', label: `Max: Rs. ${Number(filters.max_price).toLocaleString('en-PK')}` });
  if (filters.room_types) {
    filters.room_types.split(',').forEach((t) => {
      activeFilters.push({ key: 'room_types', subVal: t, label: `Type: ${t}` });
    });
  }
  if (filters.bills_included === 'true') {
    activeFilters.push({ key: 'bills_included', label: 'Bills Included' });
  }
  if (filters.available_now === 'true') {
    activeFilters.push({ key: 'available_now', label: 'Available Now' });
  }
  if (filters.max_distance) {
    activeFilters.push({ key: 'max_distance', label: `< ${filters.max_distance} km to campus` });
  }

  const removeFilterPill = (filterItem) => {
    if (filterItem.subVal && filterItem.key === 'room_types') {
      const remaining = filters.room_types
        .split(',')
        .filter((t) => t !== filterItem.subVal)
        .join(',');
      handleFilterChange('room_types', remaining);
    } else {
      handleFilterChange(filterItem.key, '');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-200">
        {/* Full-text search input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, location, or street..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
          />
        </div>

        {/* View Toggle & Sorting Controls */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          {/* Mobile Filter Trigger */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl"
          >
            <SlidersHorizontal className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">Sort:</span>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500"
            >
              <option value="featured" className="dark:bg-slate-900">Featured First</option>
              <option value="price_asc" className="dark:bg-slate-900">Price: Low &rarr; High</option>
              <option value="price_desc" className="dark:bg-slate-900">Price: High &rarr; Low</option>
              <option value="distance_asc" className="dark:bg-slate-900">Distance to Campus</option>
              <option value="newest" className="dark:bg-slate-900">Newest Listed</option>
            </select>
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Map & Grid View"
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Pills */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
            Active Filters:
          </span>
          {activeFilters.map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800"
            >
              {f.label}
              <button
                onClick={() => removeFilterPill(f)}
                className="hover:text-rose-600 dark:hover:text-rose-400 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 ml-2 underline"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Content Layout (Sidebar + Results) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden md:block md:col-span-1 sticky top-24">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            meta={meta}
            totalResults={total}
          />
        </div>

        {/* Results Area */}
        <div className="md:col-span-3 space-y-6">
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{properties.length}</strong> of{' '}
              <strong className="text-slate-900 dark:text-white">{total}</strong> available accommodations
            </span>
            <span>
              Page {currentPage} of {lastPage}
            </span>
          </div>

          {/* Interactive Map (if Split View is enabled) */}
          {viewMode === 'split' && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <PropertyMap properties={properties} height="360px" />
            </div>
          )}

          {/* Listings Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto">
              <AlertCircle className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No matching accommodations</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try widening your price budget or clearing distance / amenity filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                    p === currentPage
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= lastPage}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 flex flex-col justify-end md:hidden">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white">Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              meta={meta}
              totalResults={total}
            />
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition"
            >
              Show {total} Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
