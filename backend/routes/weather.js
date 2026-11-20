const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required query parameters' });
  }

  try {
    // URLSearchParams builds the query string safely and prevents symbol corruption
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,weather_code',
      timezone: 'auto'
    });

    const externalUrl = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    
    const apiResponse = await fetch(externalUrl);
    const weatherData = await apiResponse.json();

    res.json(weatherData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch external weather data' });
  }
});

module.exports = router;