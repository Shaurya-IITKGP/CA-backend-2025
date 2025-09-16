//testDb.js

require('dotenv').config();
const pool = require('./db');

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT NOW() AS currentTime');
    console.log('✅ Database connected successfully!');
    console.log('Server time:', rows[0].currentTime);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  } finally {
    if (pool && pool.end) {
      await pool.end();
    }
  }
}

testConnection();
