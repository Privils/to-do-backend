const mysql = require("mysql2/promise");
require("dotenv").config();

// Create a MariaDB connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost", 
  port: process.env.DB_PORT || 3306, // MariaDB default port
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "to_do_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Successfully connected to MariaDB");
    connection.release();
  } catch (error) {
    console.error("Database connection error:", error);
  }
};
 
testConnection(); 

module.exports = pool;
 