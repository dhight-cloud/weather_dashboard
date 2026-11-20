const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Your MySQL connection pool

// Get all saved favorite cities
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM favorite_locations ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve favorite locations' });
  }
});

// Save a new city
router.post('/', async (req, res) => {
  const { cityName, stateCode, countryCode, latitude, longitude } = req.body;
  
  if (!cityName || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing required location fields' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO favorite_locations (city_name, state_code, country_code, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
      [cityName, stateCode || '', countryCode, latitude, longitude]
    );
    res.status(201).json({ id: result.insertId, cityName, latitude, longitude });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save favorite location' });
  }
});

module.exports = router;