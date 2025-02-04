const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ 
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    port: process.env.port
});

// Test the connection (simpler approach)
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the database:', res.rows[0]);
    }
});

module.exports = pool;
