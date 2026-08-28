const express = require('express');
const router = express.Router();
const pool = require('../config/database');

async function initTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS payment_providers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,
    type VARCHAR(32) NOT NULL,
    name VARCHAR(128) NOT NULL,
    currency VARCHAR(16) NOT NULL DEFAULT 'MMK',
    config JSON NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);
}

// Public/player-safe view: never expose private provider configuration.
router.get('/', async (req, res, next) => {
  try {
    await initTable();
    const [rows] = await pool.query(
      'SELECT id, code, type, name, currency, config, enabled FROM payment_providers WHERE enabled=1 ORDER BY id DESC'
    );
    const providers = rows.map(row => {
      let config = row.config;
      if (typeof config === 'string') {
        try { config = JSON.parse(config || '{}'); } catch { config = {}; }
      }
      config = config && typeof config === 'object' ? config : {};
      const safeConfig = {};
      for (const key of ['accountName','accountNumber','phoneNumber','qrCodeUrl','address','network','instructions','logoUrl']) {
        if (config[key] !== undefined && config[key] !== null) safeConfig[key] = config[key];
      }
      return { id: row.id, code: row.code, type: row.type, name: row.name, currency: row.currency, config: safeConfig, enabled: true };
    });
    res.json({ success: true, providers });
  } catch (error) { next(error); }
});

module.exports = router;
