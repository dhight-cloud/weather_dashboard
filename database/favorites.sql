CREATE DATABASE IF NOT EXISTS weather_dashboard;
USE weather_dashboard;

-- Table to store saved/favorite locations for quick dashboard loading
CREATE TABLE IF NOT EXISTS favorite_locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_name VARCHAR(100) NOT NULL,
  state_code VARCHAR(10),
  country_code VARCHAR(10) NOT NULL,
  latitude DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);