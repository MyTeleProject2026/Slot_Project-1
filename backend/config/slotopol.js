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

const url = process.env.SLOTOPOL_URL;
const adminEmail = process.env.SLOTOPOL_ADMIN_EMAIL;
const adminPassword = process.env.SLOTOPOL_ADMIN_PASSWORD;

if (!url) throw new Error('SLOTOPOL_URL must be configured');
if (!adminEmail) throw new Error('SLOTOPOL_ADMIN_EMAIL must be configured');
if (!adminPassword) throw new Error('SLOTOPOL_ADMIN_PASSWORD must be configured');

module.exports = {
  url,
  adminEmail,
  adminPassword,
  clubId: configuredClubId,
};
