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

function formatForecastDay(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

const skyCardStyle = {
  borderTop: '1px solid rgba(255, 255, 255, 0.55)',
  borderLeft: '1px solid rgba(255, 255, 255, 0.35)',
  borderRight: '1px solid rgba(0, 0, 0, 0.35)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.5)',
  borderRadius: '18px',
  padding: '22px 26px 24px',
  background: 'linear-gradient(155deg, #0284c7 0%, #0369a1 50%, #1e40af 100%)',
  boxShadow: [
    '0 28px 50px -10px rgba(0, 0, 0, 0.9)',
    '0 10px 20px -5px rgba(0, 0, 0, 0.75)',
    'inset 0 1px 1px rgba(255, 255, 255, 0.45)',
    'inset 0 -3px 6px rgba(0, 0, 0, 0.35)',
  ].join(', '),
  boxSizing: 'border-box',
  color: '#ffffff',
};

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

  const daily = weatherData?.daily;
  const nextFiveDays = daily?.time
    ? daily.time.slice(1, 6).map((dateStr, idx) => {
        const actualIndex = idx + 1;
        const dayCondition = getWeatherDisplay(daily.weather_code?.[actualIndex], 1);
        return {
          date: dateStr,
          dayLabel: formatForecastDay(dateStr),
          icon: dayCondition.icon,
          label: dayCondition.label,
          high: Math.round(daily.temperature_2m_max?.[actualIndex]),
          low: Math.round(daily.temperature_2m_min?.[actualIndex]),
        };
      })
    : [];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top center, #1e3a8a 0%, #0f172a 65%, #020617 100%)',
        padding: '44px 20px',
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: '18px',
            color: '#ffffff',
            textAlign: 'center',
            letterSpacing: '0.02em',
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.45)',
          }}
        >
          Weather Dashboard
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            maxWidth: '310px',
            marginBottom: '28px',
          }}
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
              minWidth: 0,
              height: '36px',
              padding: '0 12px',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#0f172a',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              backgroundColor: '#ffffff',
              boxShadow:
                '0 14px 26px -6px rgba(0, 0, 0, 0.85), inset 0 2px 4px rgba(15, 23, 42, 0.15)',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            style={{
              height: '36px',
              padding: '0 16px',
              fontSize: '0.92rem',
              fontWeight: 600,
              borderRadius: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.5)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
              borderRight: '1px solid rgba(0, 0, 0, 0.35)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.5)',
              backgroundColor: '#0284c7',
              color: '#fff',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow:
                '0 14px 26px -6px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
              boxSizing: 'border-box',
            }}
          >
            Get Weather
          </button>
        </form>

        {loading && (
          <div style={{ padding: '12px 0', color: '#e0f2fe', fontWeight: 600, textAlign: 'center' }}>
            Loading live weather conditions...
          </div>
        )}

        {!loading && error && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '10px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              maxWidth: '380px',
              textAlign: 'center',
              boxShadow: '0 14px 28px rgba(0, 0, 0, 0.65)',
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && current && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'stretch',
              gap: '26px',
            }}
          >
            {/* Left Card: Local Weather */}
            <div
              style={{
                ...skyCardStyle,
                flex: '1 1 350px',
                maxWidth: '390px',
              }}
            >
              {/* Date + Time at Top */}
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#e0f2fe',
                  paddingBottom: '10px',
                  marginBottom: '16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                {topDateTime}
              </div>

              {/* Centered Icon + City, State + Condition */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '8px',
                  paddingBottom: '18px',
                  marginBottom: '16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                <span
                  style={{
                    fontSize: '4.6rem',
                    lineHeight: 0.9,
                    filter: 'drop-shadow(0 8px 12px rgba(15, 23, 42, 0.35))',
                  }}
                  aria-hidden="true"
                >
                  {condition.icon}
                </span>

                <div
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    textShadow: '0 2px 4px rgba(15, 23, 42, 0.25)',
                  }}
                >
                  {cityStateLabel}
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e0f2fe' }}>
                  {condition.label}
                </div>
              </div>

              {/* Weather Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: '#e0f2fe' }}>Temperature</span>
                  <strong
                    style={{
                      fontSize: '1.45rem',
                      color: '#ffffff',
                      textShadow: '0 2px 4px rgba(15, 23, 42, 0.25)',
                    }}
                  >
                    {current.temperature_2m} {units.temperature_2m || '°F'}
                  </strong>
                </div>

                {current.apparent_temperature !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#e0f2fe' }}>Feels Like</span>
                    <strong>
                      {current.apparent_temperature} {units.apparent_temperature || '°F'}
                    </strong>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#e0f2fe' }}>Humidity</span>
                  <strong>
                    {current.relative_humidity_2m} {units.relative_humidity_2m || '%'}
                  </strong>
                </div>

                {current.wind_speed_10m !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#e0f2fe' }}>Wind</span>
                    <strong>
                      {current.wind_speed_10m} {units.wind_speed_10m || 'mph'}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            {/* Right Card: 5-Day Forecast */}
            {nextFiveDays.length > 0 && (
              <div
                style={{
                  ...skyCardStyle,
                  flex: '1 1 380px',
                  maxWidth: '460px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <h2
                  style={{
                    margin: '0 0 12px',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    paddingBottom: '10px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
                    textShadow: '0 2px 4px rgba(15, 23, 42, 0.25)',
                  }}
                >
                  5-Day Forecast
                </h2>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flex: 1,
                  }}
                >
                  {nextFiveDays.map((day, index) => (
                    <div
                      key={day.date}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        padding: '12px 0',
                        borderBottom:
                          index < nextFiveDays.length - 1
                            ? '1px solid rgba(255, 255, 255, 0.2)'
                            : 'none',
                      }}
                    >
                      <div style={{ minWidth: '105px', fontWeight: 700, color: '#ffffff' }}>
                        {day.dayLabel}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <span
                          style={{
                            fontSize: '1.55rem',
                            lineHeight: 1,
                            filter: 'drop-shadow(0 3px 5px rgba(15, 23, 42, 0.3))',
                          }}
                          aria-hidden="true"
                        >
                          {day.icon}
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e0f2fe' }}>
                          {day.label}
                        </span>
                      </div>

                      <div style={{ whiteSpace: 'nowrap', fontSize: '0.98rem' }}>
                        <strong style={{ color: '#ffffff' }}>{day.high}°</strong>
                        <span style={{ color: '#bae6fd', marginLeft: '8px' }}>{day.low}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;