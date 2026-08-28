const dotenv = require('dotenv');
dotenv.config();

const configuredClubId = Number(process.env.N999BET_SLOTOPOL_CLUB_ID || process.env.N999BET_DEFAULT_CLUB_ID || 1);
if (!Number.isInteger(configuredClubId) || configuredClubId <= 0) throw new Error('N999BET_SLOTOPOL_CLUB_ID must be a positive integer');

const url = String(process.env.SLOTOPOL_URL || '').trim().replace(/\/+$/, '');
const adminEmail = String(process.env.SLOTOPOL_ADMIN_EMAIL || '').trim();
const adminPassword = String(process.env.SLOTOPOL_ADMIN_PASSWORD || '');

// The backend can boot and serve /api/health without Slotopol credentials.
// Slotopol credentials are required only when a Slotopol operation is requested.
const requireSlotopolConfig = () => {
  if (!url) { const e = new Error('SLOTOPOL_URL must be configured'); e.code = 'SLOTOPOL_CONFIG_MISSING'; e.status = 503; throw e; }
  if (!adminEmail) { const e = new Error('SLOTOPOL_ADMIN_EMAIL must be configured'); e.code = 'SLOTOPOL_CONFIG_MISSING'; e.status = 503; throw e; }
  if (!adminPassword) { const e = new Error('SLOTOPOL_ADMIN_PASSWORD must be configured'); e.code = 'SLOTOPOL_CONFIG_MISSING'; e.status = 503; throw e; }
  return { url, adminEmail, adminPassword, clubId: configuredClubId };
};

module.exports = { url, adminEmail, adminPassword, clubId: configuredClubId, requireSlotopolConfig };