// TripForm.js
import React, { useState } from 'react';

const TripForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="trip-form">
      <h2>Trip Details</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="current_location">Current Location:</label>
          <input
            type="text"
            id="current_location"
            name="current_location"
            value={formData.current_location}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="pickup_location">Pickup Location:</label>
          <input
            type="text"
            id="pickup_location"
            name="pickup_location"
            value={formData.pickup_location}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="dropoff_location">Dropoff Location:</label>
          <input
            type="text"
            id="dropoff_location"
            name="dropoff_location"
            value={formData.dropoff_location}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="current_cycle_used">Current Cycle Used (Hours):</label>
          <input
            type="number"
            id="current_cycle_used"
            name="current_cycle_used"
            value={formData.current_cycle_used}
            onChange={handleChange}
            min="0"
            max="70"
            step="0.1"
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Route & ELD Logs'}
        </button>
      </form>
    </div>
  );
};

export default TripForm;