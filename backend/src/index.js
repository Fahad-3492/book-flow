require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await testConnection();
    console.log('Database connection OK.');

    app.listen(PORT, () => {
      console.log(`BookFlow API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server — database connection failed:');
    console.error(err.message);
    process.exit(1);
  }
}

start();
