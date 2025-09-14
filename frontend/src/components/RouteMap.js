// RouteMap.js
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 39.8283, // Center of the US
  lng: -98.5795
};

const RouteMap = ({ tripData }) => {
  const [response, setResponse] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Safe number formatting function
  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    return parseFloat(value).toFixed(decimals);
  };

  // Directions callback
  const directionsCallback = useCallback((response) => {
    if (response !== null) {
      if (response.status === 'OK') {
        setResponse(response);
      } else {
        console.error('Error: ', response);
        setMapError('Failed to calculate route. Please check your locations.');
      }
    }
  }, []);

  // Reset map when new trip data arrives
  useEffect(() => {
    setResponse(null);
    setMapError(null);
  }, [tripData]);

  return (
    <div className="route-map">
      <h2>Route Information</h2>
      
      <LoadScript 
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        onLoad={() => setIsMapLoaded(true)}
        onError={() => setMapError("Failed to load Google Maps. Please check your API key.")}
      >
        {mapError ? (
          <div className="map-error">
            <p>{mapError}</p>
            <p>Please check your API key and try again.</p>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={4}
            options={{
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
              zoomControl: true,
            }}
          >
            {isMapLoaded && tripData && (
              <DirectionsService
                options={{
                  origin: tripData.trip.current_location,
                  destination: tripData.trip.dropoff_location,
                  waypoints: tripData.trip.pickup_location !== tripData.trip.current_location ? 
                    [{ location: tripData.trip.pickup_location, stopover: true }] : [],
                  travelMode: 'DRIVING',
                  optimizeWaypoints: true
                }}
                callback={directionsCallback}
              />
            )}
            
            {response !== null && response.status === 'OK' && (
              <DirectionsRenderer
                options={{
                  directions: response,
                  suppressMarkers: false,
                  polylineOptions: {
                    strokeColor: '#4285F4',
                    strokeOpacity: 0.8,
                    strokeWeight: 6
                  }
                }}
              />
            )}
            
            {/* Custom markers for better visibility */}
            {response && response.status === 'OK' && (
              <>
                <Marker
                  position={response.routes[0].legs[0].start_location}
                  label={{
                    text: "O",
                    color: "#FFFFFF",
                    fontWeight: "bold"
                  }}
                  icon={{
                    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                  }}
                />
                
                {tripData.trip.pickup_location !== tripData.trip.current_location && (
                  <Marker
                    position={response.routes[0].legs[0].via_waypoints && 
                              response.routes[0].legs[0].via_waypoints.length > 0 ? 
                              response.routes[0].legs[0].via_waypoints[0] : 
                              response.routes[0].legs[0].start_location}
                    label={{
                      text: "P",
                      color: "#FFFFFF",
                      fontWeight: "bold"
                    }}
                    icon={{
                      url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                    }}
                  />
                )}
                
                <Marker
                  position={response.routes[0].legs[0].end_location}
                  label={{
                    text: "D",
                    color: "#FFFFFF",
                    fontWeight: "bold"
                  }}
                  icon={{
                    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                  }}
                />
              </>
            )}
          </GoogleMap>
        )}
      </LoadScript>
      
      <div className="route-details">
        <h3>Trip Details</h3>
        <p><strong>Distance:</strong> {formatNumber(tripData.route_info.distance)} miles</p>
        <p><strong>Estimated Drive Time:</strong> {formatNumber(tripData.route_info.duration)} hours</p>
        <p><strong>Total Trip Time:</strong> {formatNumber(tripData.trip.total_trip_time)} hours (including breaks)</p>
        
        {tripData.route_info.breaks && tripData.route_info.breaks.length > 0 && (
          <div className="breaks">
            <h4>Required Breaks:</h4>
            <ul>
              {tripData.route_info.breaks.map((breakItem, index) => (
                <li key={index}>
                  {breakItem.type.replace('_', ' ')} after {breakItem.after_hours} hours of driving
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <p><strong>Fuel Stops:</strong> {tripData.route_info.fuel_stops || 0}</p>
        {tripData.route_info.overnight_rests > 0 && (
          <p><strong>Overnight Rests Required:</strong> {tripData.route_info.overnight_rests}</p>
        )}
        
        {response && response.status === 'OK' && (
          <div className="route-stats">
            <h4>Route Statistics</h4>
            <p><strong>Start Address:</strong> {response.routes[0].legs[0].start_address}</p>
            <p><strong>End Address:</strong> {response.routes[0].legs[0].end_address}</p>
            <p><strong>Estimated Duration:</strong> {response.routes[0].legs[0].duration.text}</p>
            <p><strong>Estimated Distance:</strong> {response.routes[0].legs[0].distance.text}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteMap;