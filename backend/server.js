const express = require('express');
const cors = require('cors');
const favoritesRouter = require('./routes/favorites');
const weatherRouter = require('./routes/weather');

const app = express();
const PORT = process.env.PORT || 5000;



// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/favorites', favoritesRouter);
app.use('/api/weather', weatherRouter);

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'Weather Dashboard API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});