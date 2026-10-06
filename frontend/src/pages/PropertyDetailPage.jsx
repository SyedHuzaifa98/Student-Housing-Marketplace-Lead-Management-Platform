import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Building,
  DollarSign,
  Calendar,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Mail,
  Share2,
  Heart,
  Send,
  ArrowLeft,
  Bed,
  Eye,
  ExternalLink,
} from 'lucide-react';
import apiClient from '../api/client';
import InquiryModal from '../components/InquiryModal';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';

export default function PropertyDetailPage() {
  const { identifier } = useParams();

  const [property, setProperty] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await apiClient(`/properties/${identifier}`);
        setProperty(res.property);
        setSimilar(res.similar || []);
        setActiveImage(0);
      } catch (err) {
        console.error('Property fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [identifier]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-96 bg-slate-200 animate-pulse rounded-3xl mb-8"></div>
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 h-64 bg-slate-200 animate-pulse rounded-2xl"></div>
          <div className="col-span-1 h-64 bg-slate-200 animate-pulse rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Property Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">
          The property listing you are looking for may have been archived or removed.
        </p>
        <Link
          to="/properties"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : [{ image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200' }];

  const roomTypeLabels = {
    private: 'Private En-suite Room',
    studio: 'Self-Contained Studio',
    shared: 'Shared Student Room',
    entire_flat: 'Entire Student Apartment',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-teal-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all listings
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
            {roomTypeLabels[property.room_type] || property.room_type}
          </span>
        </div>
      </div>

      {/* Title & Key Header Info */}
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {property.title}
          </h1>

          <div className="shrink-0 flex items-baseline gap-1 bg-teal-50/80 px-4 py-2 rounded-2xl border border-teal-200/60">
            <span className="text-3xl font-black text-teal-900">
              ${Math.round(property.price_per_month)}
            </span>
            <span className="text-xs font-semibold text-teal-700"> / month</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-4 h-4 text-teal-600" />
            {property.address}, {property.city}
          </span>

          {property.university && (
            <span className="flex items-center gap-1.5 font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
              <Building className="w-3.5 h-3.5 text-teal-600" />
              {property.distance_km} km from {property.university.name}
            </span>
          )}

          {property.bills_included && (
            <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              All Bills Included
            </span>
          )}
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Large Photo */}
        <div className="md:col-span-3 aspect-[16/10] rounded-3xl overflow-hidden bg-slate-900 shadow-md">
          <img
            src={images[activeImage]?.image_url}
            alt={property.title}
            className="w-full h-full object-cover transition duration-300"
          />
        </div>

        {/* Thumbnails Column */}
        <div className="grid grid-cols-3 md:grid-cols-1 gap-3 overflow-y-auto max-h-[420px]">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`aspect-[4/3] rounded-2xl overflow-hidden border-2 transition ${
                activeImage === idx ? 'border-teal-600 ring-2 ring-teal-400/30' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.image_url}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Core Details Grid: Main Body + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Description, Specs, Amenities, Map */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Property Highlights Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-2xl border border-slate-200 text-center">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Room Type
              </span>
              <span className="text-sm font-bold text-slate-800 capitalize mt-0.5 block">
                {property.room_type}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Campus Distance
              </span>
              <span className="text-sm font-bold text-teal-600 mt-0.5 block">
                {property.distance_km} km
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Deposit
              </span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                ${Math.round(property.deposit_amount || 0)}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Available From
              </span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                {new Date(property.available_from).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">About this accommodation</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities Grid */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">
                Included Amenities & Features
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location Map */}
          {property.latitude && property.longitude && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Location & Proximity</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {property.address}, {property.city}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {property.university && (
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                      {property.distance_km} km to campus
                    </span>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-full border border-teal-200 transition"
                    title="Open in Maps for Directions"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>
              <PropertyMap properties={[property]} height="320px" />
            </div>
          )}
        </div>

        {/* Right Column: Landlord Card & Inquiry CTA */}
        <div className="lg:col-span-1 space-y-6 sticky top-24">
          {/* Main Action Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg shadow-teal-900/5 space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                Direct Landlord Lead Channel
              </span>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">
                  ${Math.round(property.price_per_month)}
                </span>
                <span className="text-xs text-slate-500 font-medium"> / month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Deposit: ${Math.round(property.deposit_amount || 0)} &bull; {property.bills_included ? 'All bills included' : 'Bills excluded'}
              </p>
            </div>

            {/* Quick Inquiry CTA */}
            <button
              onClick={() => setInquiryModalOpen(true)}
              className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              Book Viewing / Contact Landlord
            </button>

            {/* Landlord Profile Snippet */}
            {property.landlord && (
              <div className="pt-6 border-t border-slate-100 flex items-center gap-3.5">
                <img
                  src={
                    property.landlord.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      property.landlord.name
                    )}&background=0d9488&color=fff`
                  }
                  alt={property.landlord.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    {property.landlord.name}
                    <ShieldCheck className="w-4 h-4 text-teal-600" title="Verified Landlord" />
                  </h4>
                  <p className="text-xs text-slate-500">
                    {property.landlord.company_name || 'Verified Property Manager'}
                  </p>
                  <p className="text-[11px] text-teal-600 font-medium mt-0.5">
                    Avg. response time: &lt; 2 hours
                  </p>
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <p className="flex items-center gap-1.5 font-medium text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Verified Student Accommodation
              </p>
              <p>Inquiries are delivered immediately to the landlord's dashboard CRM pipeline.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Accommodations Section */}
      {similar.length > 0 && (
        <div className="pt-12 border-t border-slate-200">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
            Similar Student Listings Nearby
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.map((sim) => (
              <PropertyCard key={sim.id} property={sim} />
            ))}
          </div>
        </div>
      )}

      {/* Lead Inquiry Modal */}
      <InquiryModal
        property={property}
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
      />
    </div>
  );
}

