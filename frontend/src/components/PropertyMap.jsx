import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// Custom Map Controller to center map dynamically when properties change
function MapRecenter({ properties }) {
  const map = useMap();

  useEffect(() => {
    if (!properties || properties.length === 0) return;

    const validCoords = properties
      .filter((p) => p.latitude && p.longitude)
      .map((p) => [parseFloat(p.latitude), parseFloat(p.longitude)]);

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [properties, map]);

  return null;
}

export default function PropertyMap({ properties, height = '500px' }) {
  // Default center (Oxford/UK or first property)
  const defaultCenter = [51.7548, -1.2543];

  const createPriceIcon = (price) => {
    return L.divIcon({
      className: 'custom-price-marker',
      html: `
        <div style="
          background-color: #0f766e;
          color: white;
          font-weight: 700;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 9999px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
          border: 2px solid white;
          white-space: nowrap;
          cursor: pointer;
          transition: transform 0.2s;
        ">
          $${Math.round(price)}/mo
        </div>
      `,
      iconSize: [60, 24],
      iconAnchor: [30, 12],
    });
  };

  const validProperties = properties.filter((p) => p.latitude && p.longitude);

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter properties={validProperties} />

        {validProperties.map((property) => (
          <Marker
            key={property.id}
            position={[parseFloat(property.latitude), parseFloat(property.longitude)]}
            icon={createPriceIcon(property.price_per_month)}
          >
            <Popup className="property-map-popup">
              <div className="w-56 p-1">
                <img
                  src={
                    property.images?.[0]?.image_url ||
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300'
                  }
                  alt={property.title}
                  className="w-full h-28 object-cover rounded-lg mb-2"
                />
                <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                  {property.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ${Math.round(property.price_per_month)}/mo &bull; {property.room_type}
                </p>
                <p className="text-[10px] text-teal-600 font-medium mt-0.5">
                  {property.distance_km} km to campus
                </p>
                <Link
                  to={`/properties/${property.slug || property.id}`}
                  className="mt-2 block w-full text-center py-1 bg-teal-600 text-white rounded text-[11px] font-semibold hover:bg-teal-700"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

