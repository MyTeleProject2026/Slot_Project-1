const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const sslEnabled = String(process.env.DB_SSL || 'true').toLowerCase() !== 'false';
const poolOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '4000', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fattbet_clone',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

if (sslEnabled) {
  poolOptions.ssl = {
    rejectUnauthorized: true,
  };
}

const pool = mysql.createPool(poolOptions);

pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = pool;
