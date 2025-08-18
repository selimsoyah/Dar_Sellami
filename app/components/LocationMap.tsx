"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

// Fallback component
const StaticLocation = dynamic(() => import('./StaticLocation'), { ssr: false });

interface LocationMapProps {
  address: string;
  lat: number;
  lng: number;
  businessName: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ address, lat, lng, businessName }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    // Import Leaflet CSS dynamically to avoid SSR issues
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    
    link.onload = () => {
      setMapLoaded(true);
    };
    
    link.onerror = () => {
      setMapError(true);
    };
    
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const openInGoogleMaps = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  const openInAppleMaps = () => {
    const appleMapsUrl = `https://maps.apple.com/?q=${lat},${lng}`;
    window.open(appleMapsUrl, '_blank');
  };

  const openInWaze = () => {
    const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    window.open(wazeUrl, '_blank');
  };

  // Show fallback if map failed to load or hasn't loaded yet
  if (mapError || !mapLoaded) {
    return <StaticLocation address={address} lat={lat} lng={lng} businessName={businessName} />;
  }

  return (
    <div className="location-map-container">
      <div className="map-wrapper">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          style={{ height: '300px', width: '100%', borderRadius: '8px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]}>
            <Popup>
              <div className="map-popup">
                <h4>{businessName}</h4>
                <p>{address}</p>
                <div className="popup-actions">
                  <button onClick={openInGoogleMaps} className="map-action-btn google-maps">
                    📍 Google Maps
                  </button>
                  <button onClick={openInWaze} className="map-action-btn waze">
                    🚗 Waze
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      
      <div className="map-actions">
        <h4>🗺️ Get Directions:</h4>
        <div className="direction-buttons">
          <button onClick={openInGoogleMaps} className="direction-btn google-maps">
            <span className="btn-icon">📍</span>
            Google Maps
          </button>
          <button onClick={openInAppleMaps} className="direction-btn apple-maps">
            <span className="btn-icon">🧭</span>
            Apple Maps
          </button>
          <button onClick={openInWaze} className="direction-btn waze">
            <span className="btn-icon">🚗</span>
            Waze
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
