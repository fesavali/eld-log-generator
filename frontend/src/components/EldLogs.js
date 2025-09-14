// EldLogs.js
import React from 'react';

const EldLogs = ({ logs }) => {
  return (
    <div className="eld-logs">
      <h2>ELD Logs</h2>
      
      {logs.map((log, index) => (
        <div key={index} className="eld-log">
          <h3>Log for {new Date(log.log_date).toLocaleDateString()}</h3>
          
          <div className="log-sheet">
            <div className="log-header">
              <div className="log-field">
                <label>Driver Name:</label>
                <span>{log.driver_name}</span>
              </div>
              <div className="log-field">
                <label>Carrier Name:</label>
                <span>{log.carrier_name}</span>
              </div>
              <div className="log-field">
                <label>Vehicle Number:</label>
                <span>{log.vehicle_number}</span>
              </div>
              <div className="log-field">
                <label>Total Miles:</label>
                <span>{log.total_miles}</span>
              </div>
            </div>
            
            <div className="log-grid">
              <div className="grid-header">
                <div className="status-type">Status</div>
                {Array.from({length: 24}, (_, i) => (
                  <div key={i} className="hour-header">{i}</div>
                ))}
              </div>
              
              <div className="grid-row">
                <div className="status-type">Off Duty</div>
                {log.off_duty.map((min, i) => (
                  <div key={i} className={`hour-cell ${min > 0 ? 'active' : ''}`}>
                    {min > 0 ? 'X' : ''}
                  </div>
                ))}
              </div>
              
              <div className="grid-row">
                <div className="status-type">Sleeper Berth</div>
                {log.sleeper_berth.map((min, i) => (
                  <div key={i} className={`hour-cell ${min > 0 ? 'active' : ''}`}>
                    {min > 0 ? 'X' : ''}
                  </div>
                ))}
              </div>
              
              <div className="grid-row">
                <div className="status-type">Driving</div>
                {log.driving.map((min, i) => (
                  <div key={i} className={`hour-cell ${min > 0 ? 'active' : ''}`}>
                    {min > 0 ? 'X' : ''}
                  </div>
                ))}
              </div>
              
              <div className="grid-row">
                <div className="status-type">On Duty</div>
                {log.on_duty.map((min, i) => (
                  <div key={i} className={`hour-cell ${min > 0 ? 'active' : ''}`}>
                    {min > 0 ? 'X' : ''}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="log-remarks">
              <h4>Remarks:</h4>
              <p>{log.remarks}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EldLogs;