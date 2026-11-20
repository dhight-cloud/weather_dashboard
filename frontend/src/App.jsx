import React, { useState, useEffect } from 'react';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from your Express backend proxy on port 5000
    fetch('http://localhost:5000/api/weather?lat=35.16&lon=-86.84')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch weather data');
        return res.json();
      })
      .then((data) => {
        setWeatherData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading live weather conditions...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

  const current = weatherData.current;
  const units = weatherData.current_units;

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Weather Dashboard</h1>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '300px', background: '#f9f9f9', marginTop: '20px' }}>
        <h3>Current Conditions</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0' }}>
          {current.temperature_2m} {units.temperature_2m}
        </p>
        <p>Humidity: {current.relative_humidity_2m} {units.relative_humidity_2m}</p>
        <p style={{ fontSize: '0.85rem', color: '#666' }}>Time: {current.time}</p>
      </div>
    </div>
  );
}

export default App;