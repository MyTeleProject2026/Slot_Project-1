const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/roles');
const slotopolConfig = require('../config/slotopol');
const SlotopolService = require('../services/slotopolService');

const capabilities = {
  auth: ['/api/auth/login', '/api/auth/refresh', '/api/auth/me'],
  player: ['/api/users', '/api/games', '/api/wallet', '/api/promotions', '/api/chat'],
  employee: ['/api/admin/users', '/api/admin/transactions', '/api/admin/games', '/api/admin/promotions', '/api/admin/support/messages'],
  superAdmin: ['/api/super-admin', '/api/super-admin/payment-providers', '/api/slotopol-funding'],
  realtime: ['/socket.io'],
};

router.get('/status', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN), async (req, res) => {
  const checks = {};

  try {
    await pool.query('SELECT 1');
    checks.database = { ok: true, engine: 'TiDB/MySQL' };
  } catch (error) {
    checks.database = { ok: false, error: error.message };
  }

  checks.authentication = { ok: true, userId: req.userId, role: req.userRole };
  checks.country = process.env.DEFAULT_COUNTRY_CODE || 'MM';
  checks.currency = process.env.DEFAULT_CURRENCY || 'MMK';
  checks.timezone = process.env.DEFAULT_TIMEZONE || 'Asia/Yangon';

  try {
    const config = slotopolConfig.requireSlotopolConfig();
    checks.slotopol = { configured: true, url: config.url, clubId: config.clubId };
    try {
      await SlotopolService.getToken();
      checks.slotopol.reachable = true;
      checks.slotopol.authenticated = true;
    } catch (error) {
      checks.slotopol.reachable = true;
      checks.slotopol.authenticated = false;
      checks.slotopol.error = error.message;
    }
  } catch (error) {
    checks.slotopol = { configured: false, reachable: false, authenticated: false, error: error.message };
  }

  const ok = checks.database.ok && checks.authentication.ok;
  res.status(ok ? 200 : 503).json({
    success: ok,
    service: 'n999bet-backend',
    version: process.env.APP_VERSION || 'unknown',
    timestamp: new Date().toISOString(),
    checks,
    capabilities,
  });
});

module.exports = router;
