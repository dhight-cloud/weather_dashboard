const mysql = require('mysql2/promise');

// Create a connection pool to your local MySQL/XAMPP instance
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',         // Default XAMPP username
  password: '',         // Default XAMPP password is usually blank
  database: 'weather_dashboard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;