"use client";

interface StaticLocationProps {
  address: string;
  lat: number;
  lng: number;
  businessName: string;
}

const StaticLocation: React.FC<StaticLocationProps> = ({ address, lat, lng, businessName }) => {
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

  return (
    <div className="static-location-container">
      <div className="static-map-placeholder">
        <div className="map-placeholder-content">
          <div className="location-icon">📍</div>
          <h4>{businessName}</h4>
          <p>{address}</p>
          <p className="coordinates">Coordinates: {lat}, {lng}</p>
        </div>
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

export default StaticLocation;
