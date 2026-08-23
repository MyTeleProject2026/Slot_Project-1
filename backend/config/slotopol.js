const dotenv = require('dotenv');
dotenv.config();

const configuredClubId = Number(
  process.env.N999BET_SLOTOPOL_CLUB_ID ||
  process.env.N999BET_DEFAULT_CLUB_ID ||
  1
);

if (!Number.isInteger(configuredClubId) || configuredClubId <= 0) {
  throw new Error('N999BET_SLOTOPOL_CLUB_ID must be a positive integer');
}

module.exports = {
  url: process.env.SLOTOPOL_URL || 'http://localhost:8080',
  adminEmail: process.env.SLOTOPOL_ADMIN_EMAIL || 'admin@slotopol.com',
  adminPassword: process.env.SLOTOPOL_ADMIN_PASSWORD || 'admin123',

  // N999Bet is explicitly bound to Slotopol Club ID 1 by default.
  // Override only when deploying a different N999Bet instance.
  clubId: configuredClubId,
};
