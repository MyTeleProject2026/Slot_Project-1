const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  url: process.env.SLOTOPOL_URL || 'http://localhost:8080',
  adminEmail: process.env.SLOTOPOL_ADMIN_EMAIL || 'admin@slotopol.com',
  adminPassword: process.env.SLOTOPOL_ADMIN_PASSWORD || 'admin123',
};
