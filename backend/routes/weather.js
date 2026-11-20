const express = require('express');
const router = express.Router();

const FORECAST_FIELDS =
  'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day';

async function fetchForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: FORECAST_FIELDS,
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
    timezone: 'auto',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch forecast from Open-Meteo');
  }
  return response.json();
}

router.get('/', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required query parameters' });
  }

  try {
    const weatherData = await fetchForecast(lat, lon);
    res.json(weatherData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch external weather data' });
  }
});

router.get('/zip', async (req, res) => {
  const zip = (req.query.zip || '').trim();

  if (!/^\d{5}$/.test(zip)) {
    return res.status(400).json({ error: 'Please enter a valid 5-digit US ZIP code.' });
  }

  try {
    const geoParams = new URLSearchParams({
      name: zip,
      count: '5',
      language: 'en',
      format: 'json',
    });

    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?${geoParams.toString()}`
    );
    if (!geoResponse.ok) {
      throw new Error('Geocoding lookup failed');
    }

    const geoData = await geoResponse.json();
    const results = Array.isArray(geoData.results) ? geoData.results : [];

    // Prefer US results matching the searched postal code
    const usMatch =
      results.find(
        (item) =>
          item.country_code === 'US' &&
          Array.isArray(item.postcodes) &&
          item.postcodes.includes(zip)
      ) ||
      results.find((item) => item.country_code === 'US') ||
      results[0];

    if (!usMatch) {
      return res.status(404).json({ error: `No location found for ZIP code ${zip}.` });
    }

    const weatherData = await fetchForecast(usMatch.latitude, usMatch.longitude);

    res.json({
      location: {
        city: usMatch.name,
        state: usMatch.admin1 || '',
        zip,
      },
      weather: weatherData,
    });
  } catch (err) {
    res.status(500).json({ error: 'Unable to look up ZIP code weather right now.' });
  }
});

module.exports = router;