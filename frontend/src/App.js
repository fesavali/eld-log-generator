// App.js
import React, { useState } from 'react';
import TripForm from './components/TripForm';
import RouteMap from './components/RouteMap';
import EldLogs from './components/EldLogs';
import { calculateRoute } from './services/api';
import './styles/App.css';

function App() {
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await calculateRoute(formData);
      setTripData(result.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ELD Log Generator</h1>
        <p>FMCSA Compliant Hours of Service Calculator</p>
      </header>
      
      <main className="App-main">
        <TripForm onSubmit={handleSubmit} loading={loading} />
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {tripData && (
          <>
            <RouteMap tripData={tripData} />
            <EldLogs logs={tripData.eld_logs} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;