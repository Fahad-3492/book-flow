const mysql = require('mysql2/promise');

// A connection pool reuses a set of open connections instead of opening
// a new one for every query. Pool size of 10 is plenty for a small app.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: false,
  // Some hosts (e.g. PlanetScale) require TLS; Railway's own MySQL plugin
  // does not. Set DB_SSL=true in that environment's variables if needed —
  // left off by default so local development needs no extra config.
  ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {}),
});

// Quick sanity check used at server startup so a bad DB config fails loudly
// at boot instead of silently failing on the first request.
async function testConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}

module.exports = { pool, testConnection };
