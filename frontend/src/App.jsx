import React, { useState, useEffect, useCallback } from 'react';

const DEFAULT_ZIP = '37066';

function getWeatherDisplay(code, isDay = 1) {
  if (code === 0) {
    return isDay
      ? { label: 'Clear Sky', icon: '☀️' }
      : { label: 'Clear Night', icon: '🌙' };
  }
  if (code === 1 || code === 2) {
    return isDay
      ? { label: 'Partly Cloudy', icon: '⛅' }
      : { label: 'Partly Cloudy Night', icon: '☁️' };
  }
  if (code === 3) {
    return { label: 'Overcast', icon: '☁️' };
  }
  if (code === 45 || code === 48) {
    return { label: 'Foggy', icon: '🌫️' };
  }
  if (code >= 51 && code <= 67) {
    return { label: 'Rain / Drizzle', icon: '🌧️' };
  }
  if (code >= 71 && code <= 77) {
    return { label: 'Snow', icon: '❄️' };
  }
  if (code >= 80 && code <= 82) {
    return { label: 'Rain Showers', icon: '🌦️' };
  }
  if (code >= 95) {
    return { label: 'Thunderstorm', icon: '⛈️' };
  }
  return { label: 'Mixed Conditions', icon: '🌡️' };
}

function formatDateTime(isoString, timeZone) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;

  const tzOptions = timeZone ? { timeZone } : {};

  const dateStr = date.toLocaleDateString('en-US', {
    ...tzOptions,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const timeStr = date.toLocaleTimeString('en-US', {
    ...tzOptions,
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${dateStr} • ${timeStr}`;
}

function App() {
  const [zipInput, setZipInput] = useState(DEFAULT_ZIP);
  const [locationInfo, setLocationInfo] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWeatherByZip = useCallback(async (zipToSearch) => {
    const cleaned = zipToSearch.trim();
    if (!/^\d{5}$/.test(cleaned)) {
      setError('Please enter a valid 5-digit ZIP code.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:5000/api/weather/zip?zip=${encodeURIComponent(cleaned)}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch weather for that ZIP code.');
      }

      setLocationInfo(data.location);
      setWeatherData(data.weather);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeatherByZip(DEFAULT_ZIP);
  }, [loadWeatherByZip]);

  function handleSubmit(e) {
    e.preventDefault();
    loadWeatherByZip(zipInput);
  }

  const current = weatherData?.current;
  const units = weatherData?.current_units || {};
  const condition = current
    ? getWeatherDisplay(current.weather_code, current.is_day)
    : { label: 'Mixed Conditions', icon: '🌡️' };
  const topDateTime = current ? formatDateTime(current.time, weatherData.timezone) : '';
  const cityStateLabel = locationInfo
    ? [locationInfo.city, locationInfo.state].filter(Boolean).join(', ')
    : '';

  return (
    <div style={{ padding: '36px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginTop: 0, marginBottom: '16px' }}>Weather Dashboard</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', gap: '8px', maxWidth: '250px', marginBottom: '10px' }}
      >
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={zipInput}
          onChange={(e) => setZipInput(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter 5-digit ZIP"
          aria-label="ZIP code"
          style={{
            flex: 1,
            padding: '1px 12px',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '1px 12px',
            fontSize: '.9rem',
            fontWeight: 550,
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#2563eb',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Get Weather
        </button>
      </form>

      {loading && <div style={{ padding: '12px 0' }}>Loading live weather conditions...</div>}

      {!loading && error && (
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            maxWidth: '380px',
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && current && (
        <div
          style={{
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            padding: '24px',
            maxWidth: '380px',
            backgroundColor: '#f9fafb',
            boxSizing: 'border-box',
          }}
        >
          {/* 1. Formatted Date & Time at the Top */}
          <div
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#4b5563',
              paddingBottom: '12px',
              marginBottom: '14px',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            {topDateTime}
          </div>

          {/* 2. Current Conditions Header */}
          <h2 style={{ margin: '0 0 14px', fontSize: '1.2rem' }}>Current Conditions</h2>

          {/* 3. Centered Icon + City, State */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '6px',
              paddingBottom: '16px',
              marginBottom: '16px',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <span style={{ fontSize: '2.8rem', lineHeight: 1 }} aria-hidden="true">
              {condition.icon}
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
              {cityStateLabel}
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#4b5563' }}>
              {condition.label}
            </div>
          </div>

          {/* 4. Weather Metrics Below */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ color: '#4b5563' }}>Temperature</span>
              <strong style={{ fontSize: '1.35rem' }}>
                {current.temperature_2m} {units.temperature_2m || '°F'}
              </strong>
            </div>

            {current.apparent_temperature !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4b5563' }}>Feels Like</span>
                <strong>
                  {current.apparent_temperature} {units.apparent_temperature || '°F'}
                </strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4b5563' }}>Humidity</span>
              <strong>
                {current.relative_humidity_2m} {units.relative_humidity_2m || '%'}
              </strong>
            </div>

            {current.wind_speed_10m !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4b5563' }}>Wind</span>
                <strong>
                  {current.wind_speed_10m} {units.wind_speed_10m || 'mph'}
                </strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;