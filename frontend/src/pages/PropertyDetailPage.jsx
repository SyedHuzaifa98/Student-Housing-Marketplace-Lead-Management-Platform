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
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Footprints,
  Bike,
  Bus,
  Sparkles,
  HelpCircle,
  BadgeCheck,
  Lock,
  MessageSquare,
} from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import InquiryModal from '../components/InquiryModal';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';

export default function PropertyDetailPage() {
  const { identifier } = useParams();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

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

  // Handle Share link
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Handle Save toggle
  const handleFavoriteToggle = async () => {
    if (!user) {
      alert('Please sign in to save this property to your favorites!');
      return;
    }
    if (!property) return;

    try {
      const res = await apiClient(`/student/saved-properties/${property.id}/toggle`, {
        method: 'POST',
      });
      setIsSaved(res.saved);
    } catch (err) {
      console.error('Save property error:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg"></div>
        <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"></div>
        <div className="h-[440px] bg-slate-200 dark:bg-slate-800 animate-pulse rounded-3xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
          <div className="lg:col-span-1 h-96 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <Building className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Property Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
          The property listing you are looking for may have been archived, rented, or temporarily unpublished.
        </p>
        <Link
          to="/properties"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Explore Other Student Accommodations
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

  const distanceKm = Number(property.distance_km || 1.2);
  const walkMinutes = Math.max(2, Math.round(distanceKm * 12));
  const bikeMinutes = Math.max(1, Math.round(distanceKm * 4));
  const transitMinutes = Math.max(3, Math.round(distanceKm * 6));

  const faqs = [
    {
      q: 'How does booking a viewing or inquiring work?',
      a: 'Click "Request Viewing / Contact Landlord" to submit your preferred date, move-in period, and questions. Inquiries go directly to the verified landlord who typically responds within 2 hours.',
    },
    {
      q: 'Are utility bills and high-speed Wi-Fi included?',
      a: property.bills_included
        ? 'Yes! All utility bills including high-speed internet, electricity, heating, and water are included with zero unexpected bills at month-end.'
        : 'Utilities (electricity, water, Wi-Fi) are billed separately based on actual usage, estimated at approximately Rs. 3,000 - Rs. 6,000/month depending on season.',
    },
    {
      q: 'How is my security deposit protected?',
      a: `Your refundable deposit of Rs. ${Math.round(property.deposit_amount || 0).toLocaleString('en-PK')} is safeguarded in a tenancy deposit protection agreement and is returned upon lease completion.`,
    },
    {
      q: 'Can international students apply without a local guarantor?',
      a: 'Yes, most student landlords on our platform accept international students with proof of university admission and visa status, or with a nominal advance rent deposit.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header: Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 truncate">
          <Link to="/" className="hover:text-teal-600 dark:hover:text-teal-400 transition">Home</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-teal-600 dark:hover:text-teal-400 transition">Accommodations</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 truncate">{property.city}</span>
        </nav>

        {/* Share & Favorite Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title="Share this accommodation"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            onClick={handleFavoriteToggle}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition ${
              isSaved
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-rose-500' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Title & Key Highlights Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/80">
            <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            {roomTypeLabels[property.room_type] || property.room_type}
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Verified Student Listing
          </span>

          {property.bills_included && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
              <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              All Bills Included
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {property.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{property.address}, {property.city}</span>
              {property.university && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  <span className="font-medium text-teal-700 dark:text-teal-300">
                    {property.distance_km} km to {property.university.name}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="shrink-0 flex items-baseline gap-1.5 bg-slate-50 dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Rs. {Math.round(property.price_per_month).toLocaleString('en-PK')}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400"> / month</span>
          </div>
        </div>
      </div>

      {/* Professional Multi-Photo Gallery (Airbnb Style) */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 aspect-[16/9] md:aspect-[21/9] max-h-[520px]">
          {/* Main Large Showcase Photo */}
          <div
            onClick={() => { setActiveImage(0); setLightboxOpen(true); }}
            className="md:col-span-3 h-full cursor-pointer relative group overflow-hidden"
          >
            <img
              src={images[activeImage]?.image_url}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />
          </div>

          {/* Side Thumbnail Strip */}
          <div className="hidden md:flex flex-col gap-2 h-full overflow-hidden">
            {images.slice(1, 3).map((img, idx) => (
              <div
                key={idx}
                onClick={() => { setActiveImage(idx + 1); setLightboxOpen(true); }}
                className="flex-1 cursor-pointer relative group overflow-hidden"
              >
                <img
                  src={img.image_url}
                  alt={`Gallery ${idx + 2}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />
              </div>
            ))}

            {/* Fallback if only 1 image */}
            {images.length <= 1 && (
              <div
                onClick={() => setLightboxOpen(true)}
                className="flex-1 bg-slate-800 flex items-center justify-center cursor-pointer text-slate-400 text-xs"
              >
                View Full Size
              </div>
            )}
          </div>
        </div>

        {/* View All Photos Trigger Button */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white font-bold text-xs shadow-lg backdrop-blur-md hover:bg-white dark:hover:bg-slate-900 transition border border-slate-200/80 dark:border-slate-800/80"
        >
          <Camera className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Show all {images.length} photos</span>
        </button>
      </div>

      {/* Main Content & Sticky Booking Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Accommodation
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize mt-1 block truncate">
                {roomTypeLabels[property.room_type] || property.room_type}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Campus Distance
              </span>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-1 block">
                {property.distance_km} km away
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Security Deposit
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                Rs. {Math.round(property.deposit_amount || 0).toLocaleString('en-PK')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Available From
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                {new Date(property.available_from).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Commute & University Proximity Calculator */}
          {property.university && (
            <div className="p-5 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 dark:from-teal-500/10 dark:to-slate-900 rounded-2xl border border-teal-500/20 dark:border-teal-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Commute to {property.university.name}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                  {property.distance_km} km direct
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <Footprints className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">~{walkMinutes} mins</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Walking</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <Bike className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">~{bikeMinutes} mins</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Bicycle</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <Bus className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">~{transitMinutes} mins</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Public Transit</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-4 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              About this accommodation
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities Grid */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">
                Included Amenities & Facilities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Protection & Trust Banner (AmberStudent/Uniplaces Inspired) */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Student Protection & Quality Guarantee
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Book with peace of mind. Every listing on our platform undergoes multi-point verification.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">✓ 100% Verified Listing</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Owner identity and tenancy rights verified to eliminate rental scams.</p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">✓ Protected Deposit</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Safeguarded within registered student tenancy deposit schemes.</p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">✓ Direct Landlord Chat</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Zero broker commissions or hidden markups for students.</p>
              </div>
            </div>
          </div>

          {/* Interactive Map Section */}
          {property.latitude && property.longitude && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Location & Surroundings</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {property.address}, {property.city}
                  </p>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 hover:text-teal-900 dark:hover:text-teal-100 bg-teal-50 dark:bg-teal-950/60 px-3.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 transition self-start sm:self-auto"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                </a>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <PropertyMap properties={[property]} height="340px" />
              </div>
            </div>
          )}

          {/* Student FAQs Accordion */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-4 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Frequently Asked Questions
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {faqs.map((faq, idx) => (
                <div key={idx} className="py-3.5">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                    className="w-full flex items-center justify-between text-left text-sm font-semibold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking & Professional Landlord Card */}
        <div className="lg:col-span-1 space-y-6 sticky top-24">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl shadow-slate-900/5 dark:shadow-slate-950 space-y-6">
            {/* Price Header & Free Booking Tag */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200/60 dark:border-teal-800/60">
                  Verified Pricing
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  Rs. 0 Student Booking Fee
                </span>
              </div>

              <div className="mt-3.5 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  Rs. {Math.round(property.price_per_month).toLocaleString('en-PK')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium"> / month</span>
              </div>

              {/* Price Breakdown */}
              <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Utilities & Wi-Fi:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {property.bills_included ? 'All Included' : 'Excluded (~Rs. 3,500/mo)'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Security Deposit:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Rs. {Math.round(property.deposit_amount || 0).toLocaleString('en-PK')} (Refundable)
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Service & Admin Fee:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE (Rs. 0)</span>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-2">
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                Request Viewing / Contact
              </button>

              <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
                🔒 Free cancellation & inquiries without financial commitment
              </p>
            </div>

            {/* Professional Landlord / Host Trust Card (Clean & Redesigned) */}
            {property.landlord && (
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                {/* Landlord Identity Row */}
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={
                        property.landlord.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          property.landlord.name
                        )}&background=0d9488&color=fff`
                      }
                      alt={property.landlord.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                    />
                    {/* Active Presence Dot on Avatar */}
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                        property.landlord.is_active_today !== false
                          ? 'bg-emerald-500'
                          : 'bg-slate-400'
                      }`}
                      title={property.landlord.last_seen_badge || 'Active today'}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {property.landlord.name}
                      </h4>
                      <BadgeCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" title="Verified Host" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {property.landlord.company_name || 'Verified Property Manager'}
                    </p>
                  </div>
                </div>

                {/* Professional Trust & Responsiveness Micro-Badges (Clean, NO duplicate emojis) */}
                <div className="space-y-2 pt-1">
                  {/* Active Indicator */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                      <span className="text-slate-600 dark:text-slate-400">Activity:</span>
                    </div>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {property.landlord.last_seen_badge || 'Active today'}
                    </span>
                  </div>

                  {/* Response Time */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 fill-amber-500" />
                      <span className="text-slate-600 dark:text-slate-400">Response time:</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {property.landlord.response_time_badge || 'Typically replies in 2 hours'}
                    </span>
                  </div>

                  {/* Listing Freshness */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">Listing status:</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {property.updated_recently_badge || 'Updated recently'}
                    </span>
                  </div>
                </div>

                {/* Direct Landlord Contact CTA */}
                <button
                  onClick={() => setInquiryModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Ask Landlord a Question
                </button>
              </div>
            )}

            {/* Direct CRM Pipeline guarantee notice */}
            <div className="text-[11px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1">
              <p className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Lock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Direct Landlord Lead CRM
              </p>
              <p>Your inquiry is sent instantly to the landlord's dashboard for prompt viewing scheduling.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Accommodations Section */}
      {similar.length > 0 && (
        <div className="pt-12 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Similar Student Listings Nearby
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Other popular verified student rooms close to {property.university?.name || 'campus'}
              </p>
            </div>
            <Link
              to="/properties"
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Browse all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.map((sim) => (
              <PropertyCard key={sim.id} property={sim} />
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-md animate-fade-in">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10">
            <span className="text-sm font-semibold text-slate-300">
              {activeImage + 1} / {images.length} &bull; {property.title}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Central Image with Prev / Next */}
          <div className="relative flex-1 flex items-center justify-center max-w-6xl mx-auto w-full my-4">
            <button
              onClick={() => setActiveImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              className="absolute left-2 sm:left-4 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition border border-white/20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={images[activeImage]?.image_url}
              alt={`Photo ${activeImage + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />

            <button
              onClick={() => setActiveImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
              className="absolute right-2 sm:right-4 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition border border-white/20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Thumbnails */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                  activeImage === idx ? 'border-teal-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              </button>
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
