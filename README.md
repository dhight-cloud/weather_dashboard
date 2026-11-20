# Weather Dashboard (Work in Progress)

A full-stack weather tracking application built with React, Node.js, Express, and MySQL. This project demonstrates decoupled client-server architecture, RESTful API proxying, and relational database persistence for saving user-favorite locations.

## Project Status
**Active Development** — Core backend API proxy, MySQL database schema, and initial React data rendering are operational. Next milestones focus on dynamic city search and full CRUD functionality for saved locations.

### Completed
- [x] **MySQL Database Setup:** Created `weather_dashboard` schema and `favorite_locations` table.
- [x] **Express API Proxy:** Configured Node/Express server (`port 5000`) to safely query the Open-Meteo API using `URLSearchParams` and serve clean JSON to the client.
- [x] **React + Vite Frontend:** Initialized client (`port 5173`) and connected live weather data fetching via `useEffect`.

### Up Next
- [ ] Interactive city search bar (geocoding city names to coordinates).
- [ ] Save and delete favorite locations persisted in MySQL.
- [ ] Responsive UI styling and multi-day forecast cards.

## Tech Stack
* **Frontend:** React, Vite, JavaScript (ES6+), CSS3
* **Backend:** Node.js, Express
* **Database:** MySQL (MariaDB via XAMPP)
* **External API:** Open-Meteo Public Weather API

## Architecture Overview
Rather than calling external APIs directly from the browser, the React frontend communicates exclusively with a custom Express backend (`http://localhost:5000/api/weather`). This middleman pattern centralizes request formatting, error handling, and database operations.

## Local Setup
1. **Clone the repository:**
   ```bash
   git clone [https://github.com/dhight-cloud/weather-dashboard.git](https://github.com/dhight-cloud/weather-dashboard.git)
   ```
2. **Start MySQL:** Launch **MySQL** in the XAMPP Control Panel and create the `weather_dashboard` database.
3. **Start the Backend (`port 5000`):**
   ```bash
   cd backend
   npm install
   node server.js
   ```
4. **Start the Frontend (`port 5173`):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```