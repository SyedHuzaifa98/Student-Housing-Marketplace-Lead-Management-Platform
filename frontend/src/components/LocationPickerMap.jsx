import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, Navigation, Crosshair, X, Check, Loader2 } from 'lucide-react';

// Custom modern SVG vector pin icon for the property location
const createPropertyPinIcon = () => {
  return L.divIcon({
    className: 'custom-property-pin',
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.45);
          border: 2px solid #ffffff;
        ">
          <div style="
            width: 12px;
            height: 12px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
        <div style="
          width: 10px;
          height: 3px;
          background: rgba(0, 0, 0, 0.35);
          border-radius: 50%;
          margin-top: 2px;
          filter: blur(1px);
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// University reference marker icon
const createUniversityPinIcon = () => {
  return L.divIcon({
    className: 'custom-university-pin',
    html: `
      <div style="
        display: flex;
        align-items: center;
        gap: 4px;
        background: #4f46e5;
        color: white;
        padding: 3px 8px;
        border-radius: 9999px;
        font-size: 10px;
        font-weight: 700;
        box-shadow: 0 3px 8px rgba(79, 70, 229, 0.35);
        border: 1.5px solid white;
        white-space: nowrap;
        transform: translate(-50%, -50%);
      ">
        🎓 Campus
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// Map click handler sub-component
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Controller to smoothly pan the map to coordinates
function MapFlyTo({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.flyTo(position, zoom || map.getZoom(), { duration: 1.2 });
    }
  }, [position, zoom, map]);
  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onChange,
  universityLat,
  universityLng,
  defaultAddress = '',
  height = '300px',
}) {
  // Default coordinates fallback (e.g. Oxford, UK or London)
  const defaultCenter = useMemo(() => {
    if (universityLat && universityLng) {
      return [parseFloat(universityLat), parseFloat(universityLng)];
    }
    return [51.752, -1.2577]; // Oxford
  }, [universityLat, universityLng]);

  const currentLat = latitude ? parseFloat(latitude) : null;
  const currentLng = longitude ? parseFloat(longitude) : null;
  const hasCoordinates = currentLat !== null && currentLng !== null && !isNaN(currentLat) && !isNaN(currentLng);

  const [flyTarget, setFlyTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [geoLocating, setGeoLocating] = useState(false);

  const propertyPin = useMemo(() => createPropertyPinIcon(), []);
  const universityPin = useMemo(() => createUniversityPinIcon(), []);

  // When university changes and no pin has been picked yet, fly to campus
  useEffect(() => {
    if (!hasCoordinates && universityLat && universityLng) {
      setFlyTarget([parseFloat(universityLat), parseFloat(universityLng)]);
    }
  }, [universityLat, universityLng, hasCoordinates]);

  // Handle pin placement on map click
  const handleSelectCoords = (lat, lng) => {
    const fixedLat = parseFloat(lat.toFixed(6));
    const fixedLng = parseFloat(lng.toFixed(6));
    onChange({ latitude: fixedLat, longitude: fixedLng });
    setFlyTarget([fixedLat, fixedLng]);
    setSearchError('');
  };

  // Drag pin handler
  const handleMarkerDragEnd = (e) => {
    const marker = e.target;
    const position = marker.getLatLng();
    handleSelectCoords(position.lat, position.lng);
  };

  // Free OpenStreetMap Nominatim search
  const handleSearchAddress = async (e) => {
    if (e) e.preventDefault();
    const query = (searchQuery || defaultAddress).trim();
    if (!query) {
      setSearchError('Please type a street, area, or landmark to search.');
      return;
    }

    setSearching(true);
    setSearchError('');
    try {
      const endpoint = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        query
      )}`;
      const response = await fetch(endpoint, {
        headers: {
          'Accept-Language': 'en',
        },
      });
      const data = await response.json();

      if (data && data.length > 0) {
        const found = data[0];
        const lat = parseFloat(found.lat);
        const lon = parseFloat(found.lon);
        handleSelectCoords(lat, lon);
      } else {
        setSearchError('Address not found on map. Try searching a nearby street or landmark.');
      }
    } catch (err) {
      console.warn('Geocoding search failed:', err);
      setSearchError('Could not reach map search. You can click directly on the map to set your pin.');
    } finally {
      setSearching(false);
    }
  };

  // Locate current position
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLocating(true);
    setSearchError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocating(false);
        handleSelectCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setGeoLocating(false);
        console.warn('Geolocation error:', err);
        setSearchError('Could not retrieve your device location. Please click on the map.');
      },
      { timeout: 8000 }
    );
  };

  const handleClearPin = () => {
    onChange({ latitude: '', longitude: '' });
  };

  return (
    <div className="space-y-2">
      {/* Search Bar & Location Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress(e)}
            placeholder="Search street, postcode, or area to place pin..."
            className="w-full pl-8 pr-20 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition"
          />
          <button
            type="button"
            onClick={handleSearchAddress}
            disabled={searching}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-lg transition flex items-center gap-1"
          >
            {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Find'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={geoLocating}
            className="px-2.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
            title="Use My Current GPS Position"
          >
            {geoLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-teal-600" />
            )}
            <span className="hidden sm:inline">My GPS</span>
          </button>

          {hasCoordinates && (
            <button
              type="button"
              onClick={handleClearPin}
              className="px-2.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition flex items-center gap-1"
              title="Remove Pin"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {searchError && (
        <p className="text-[11px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
          {searchError}
        </p>
      )}

      {/* Map Container */}
      <div
        style={{ height }}
        className="w-full rounded-2xl overflow-hidden border border-slate-300 shadow-inner relative z-0"
      >
        <MapContainer
          center={hasCoordinates ? [currentLat, currentLng] : defaultCenter}
          zoom={hasCoordinates ? 15 : 13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Free OpenStreetMap Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <MapClickHandler onLocationSelect={handleSelectCoords} />

          {flyTarget && <MapFlyTo position={flyTarget} zoom={15} />}

          {/* University Marker (if known) */}
          {universityLat && universityLng && (
            <Marker
              position={[parseFloat(universityLat), parseFloat(universityLng)]}
              icon={universityPin}
              interactive={false}
            />
          )}

          {/* Draggable Property Location Pin */}
          {hasCoordinates && (
            <Marker
              position={[currentLat, currentLng]}
              icon={propertyPin}
              draggable={true}
              eventHandlers={{
                dragend: handleMarkerDragEnd,
              }}
            >
              <Popup className="property-pin-popup">
                <div className="text-center p-1 text-xs">
                  <p className="font-bold text-teal-800">Property Location</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Drag this pin to fine-tune exact building entrance.
                  </p>
                  <div className="mt-1 font-mono text-[9px] text-slate-400">
                    {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Overlay instructions badge */}
        <div className="absolute top-2 left-2 z-[400] pointer-events-none bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm border border-slate-200/80 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
          <span>Click anywhere or drag pin to position</span>
        </div>
      </div>

      {/* Selected Coordinates & Status Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1">
        {hasCoordinates ? (
          <div className="flex items-center gap-2 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <Check className="w-3.5 h-3.5" />
            <span>
              Exact Location Pin Set: <span className="font-mono text-emerald-800">{currentLat.toFixed(5)}, {currentLng.toFixed(5)}</span>
            </span>
          </div>
        ) : (
          <div className="text-slate-500 italic flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>No coordinates selected yet. Click the map to drop a pin.</span>
          </div>
        )}

        <span className="text-[10px] text-slate-400">
          Free Map Powered by OpenStreetMap
        </span>
      </div>
    </div>
  );
}
