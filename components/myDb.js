const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ 
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    port: process.env.port
});

// Connecting to the database
pool.connect((err, client, release) => {
    if (err) {
        console.error("Error connecting to the database:", err);
    } else {
        console.log("Successfully connected to the database");
    }
    if (release) release(); 
});

module.exports = pool;
