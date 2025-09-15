// RouteMap.js
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 39.8283,
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

  // Convert seconds to "X h Y m"
  const humanDuration = (totalSeconds) => {
    if (!totalSeconds || isNaN(totalSeconds)) return 'N/A';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.round((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours} h ${minutes} m`;
    return `${minutes} m`;
  };

  // Directions callback
  const directionsCallback = useCallback((res) => {
    if (res !== null) {
      if (res.status === 'OK') {
        setResponse(res);
        setMapError(null);
      } else {
        console.error('Directions error:', res);
        setResponse(null);
        setMapError('Failed to calculate route. Please check your locations.');
      }
    }
  }, []);

  // Reset map when new trip data arrives
  useEffect(() => {
    setResponse(null);
    setMapError(null);
  }, [tripData]);

  // Safe helper to get numeric totals from tripData or response
  const computeTotalsFromResponse = (resp) => {
    if (!resp || !resp.routes || resp.routes.length === 0) return { distanceMiles: 0, durationSeconds: 0 };

    const legs = resp.routes[0].legs || [];
    const totalMeters = legs.reduce((sum, leg) => sum + (leg.distance && leg.distance.value ? leg.distance.value : 0), 0);
    const totalSeconds = legs.reduce((sum, leg) => sum + (leg.duration && leg.duration.value ? leg.duration.value : 0), 0);

    const distanceMiles = totalMeters / 1609.34;
    return { distanceMiles, durationSeconds: totalSeconds };
  };

  // Prefer backend route_info totals, fallback to response-summed totals
  const getTotalDistance = () => {
    if (!tripData) return null;
    const r = tripData.route_info || {};
    if (typeof r.total_distance === 'number') return r.total_distance;
    if (typeof r.distance === 'number') return r.distance;
    if (response) return computeTotalsFromResponse(response).distanceMiles;
    return null;
  };

  const getTotalDurationHours = () => {
    if (!tripData) return null;
    const r = tripData.route_info || {};
    if (typeof r.total_duration === 'number') return r.total_duration;
    if (typeof r.duration === 'number') return r.duration;
    if (response) return computeTotalsFromResponse(response).durationSeconds / 3600;
    return null;
  };

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
                  waypoints:
                    tripData.trip.pickup_location && tripData.trip.pickup_location !== tripData.trip.current_location
                      ? [{ location: tripData.trip.pickup_location, stopover: true }]
                      : [],
                  travelMode: 'DRIVING',
                  optimizeWaypoints: false // preserve waypoint order so pickup stays between origin and destination
                }}
                callback={directionsCallback}
              />
            )}

            {response !== null && response.status === 'OK' && (
              <DirectionsRenderer
                options={{
                  directions: response,
                  suppressMarkers: true, // we'll render custom markers
                  polylineOptions: {
                    strokeColor: '#4285F4',
                    strokeOpacity: 0.8,
                    strokeWeight: 6
                  }
                }}
              />
            )}

            {/* Custom markers using correct leg indices */}
            {response && response.status === 'OK' && (() => {
              const legs = (response.routes && response.routes[0] && response.routes[0].legs) || [];
              if (!legs || legs.length === 0) return null;

              const firstLeg = legs[0];
              const lastLeg = legs[legs.length - 1];

              const startPos = firstLeg.start_location;
              const endPos = lastLeg.end_location;

              // If pickup exists and route has >1 leg, pickup is end of first leg
              const showPickup = tripData.trip.pickup_location !== tripData.trip.current_location && legs.length > 1;
              const pickupPos = showPickup ? firstLeg.end_location : null;

              return (
                <>
                  {/* Origin */}
                  {startPos && (
                    <Marker
                      position={startPos}
                      label={{
                        text: "O",
                        color: "#FFFFFF",
                        fontWeight: "bold"
                      }}
                      icon={{ url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
                    />
                  )}

                  {/* Pickup */}
                  {showPickup && pickupPos && (
                    <Marker
                      position={pickupPos}
                      label={{
                        text: "P",
                        color: "#FFFFFF",
                        fontWeight: "bold"
                      }}
                      icon={{ url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png" }}
                    />
                  )}

                  {/* Dropoff */}
                  {endPos && (
                    <Marker
                      position={endPos}
                      label={{
                        text: "D",
                        color: "#FFFFFF",
                        fontWeight: "bold"
                      }}
                      icon={{ url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png" }}
                    />
                  )}
                </>
              );
            })()}
          </GoogleMap>
        )}
      </LoadScript>

      <div className="route-details">
        <h3>Trip Details</h3>
        <p><strong>Distance:</strong> {formatNumber(getTotalDistance())} miles</p>
        <p><strong>Estimated Drive Time:</strong> {formatNumber(getTotalDurationHours())} hours</p>
        <p><strong>Total Trip Time:</strong> {formatNumber(tripData && tripData.trip ? tripData.trip.total_trip_time : null)} hours (including breaks)</p>

        {tripData && tripData.route_info && tripData.route_info.breaks && tripData.route_info.breaks.length > 0 && (
          <div className="breaks">
            <h4>Required Breaks:</h4>
            <ul>
              {tripData.route_info.breaks.map((breakItem, index) => (
                <li key={index}>
                  {breakItem.type ? breakItem.type.replace('_', ' ') : 'break'} after {breakItem.after_hours} hours of driving
                </li>
              ))}
            </ul>
          </div>
        )}

        <p><strong>Fuel Stops:</strong> {(tripData && tripData.route_info && tripData.route_info.fuel_stops) || 0}</p>
        {tripData && tripData.route_info && tripData.route_info.overnight_rests > 0 && (
          <p><strong>Overnight Rests Required:</strong> {tripData.route_info.overnight_rests}</p>
        )}

        {response && response.status === 'OK' && (() => {
          const legs = (response.routes && response.routes[0] && response.routes[0].legs) || [];
          if (!legs || legs.length === 0) return null;

          const firstLeg = legs[0];
          const lastLeg = legs[legs.length - 1];
          const totalSecs = legs.reduce((s, l) => s + (l.duration && l.duration.value ? l.duration.value : 0), 0);
          const totalMeters = legs.reduce((s, l) => s + (l.distance && l.distance.value ? l.distance.value : 0), 0);

          return (
            <div className="route-stats">
              <h4>Route Statistics</h4>
              <p><strong>Start Address:</strong> {firstLeg.start_address}</p>
              <p><strong>End Address:</strong> {lastLeg.end_address}</p>
              <p><strong>Estimated Duration:</strong> {humanDuration(totalSecs)}</p>
              <p><strong>Estimated Distance:</strong> {formatNumber(totalMeters / 1609.34)} miles</p>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default RouteMap;