import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 39.8283,
  lng: -98.5795
};

function RealMap({ origin, destination, waypoints }) {
  const [directions, setDirections] = useState(null);
  const [error, setError] = useState(null);

  const directionsCallback = (response) => {
    if (response !== null) {
      if (response.status === 'OK') {
        setDirections(response);
      } else {
        setError(response.status);
      }
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={4}
      >
        {origin && destination && (
          <DirectionsService
            options={{
              origin: origin,
              destination: destination,
              waypoints: waypoints,
              travelMode: 'DRIVING'
            }}
            callback={directionsCallback}
          />
        )}
        {directions && (
          <DirectionsRenderer
            options={{
              directions: directions
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default RealMap;