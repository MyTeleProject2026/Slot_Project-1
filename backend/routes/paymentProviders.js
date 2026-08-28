const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

const ALLOWED_TYPES = new Set(['bank', 'e_wallet', 'crypto']);
const ALLOWED_CURRENCIES = new Set(['MMK', 'USDT']);

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN));

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

function normalizeProvider(input = {}) {
  const code = String(input.code || '').trim().toUpperCase();
  const type = String(input.type || '').trim().toLowerCase();
  const name = String(input.name || '').trim();
  const currency = String(input.currency || 'MMK').trim().toUpperCase();
  const config = input.config && typeof input.config === 'object' && !Array.isArray(input.config)
    ? input.config
    : null;

  if (!code || !type || !name) {
    const error = new Error('code, type and name are required');
    error.status = 400;
    throw error;
  }
  if (!/^[A-Z0-9_-]{2,64}$/.test(code)) {
    const error = new Error('code must contain only letters, numbers, underscores or hyphens');
    error.status = 400;
    throw error;
  }
  if (!ALLOWED_TYPES.has(type)) {
    const error = new Error('type must be one of: bank, e_wallet, crypto');
    error.status = 400;
    throw error;
  }
  if (!ALLOWED_CURRENCIES.has(currency)) {
    const error = new Error('currency must be one of: MMK, USDT');
    error.status = 400;
    throw error;
  }
  if (!config) {
    const error = new Error('config must be an object');
    error.status = 400;
    throw error;
  }

  return {
    code,
    type,
    name,
    currency,
    config,
    enabled: input.enabled !== false && input.enabled !== 0 && input.enabled !== 'false',
  };
}

function parseProvider(row) {
  let config = row.config;
  if (typeof config === 'string') {
    try { config = JSON.parse(config || '{}'); } catch { config = {}; }
  }
  return { ...row, config: config && typeof config === 'object' ? config : {} };
}

router.get('/', async (req, res, next) => {
  try {
    await initTable();
    const [rows] = await pool.query('SELECT * FROM payment_providers ORDER BY id DESC');
    res.json({ success: true, providers: rows.map(parseProvider) });
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    await initTable();
    const provider = normalizeProvider(req.body);
    const [result] = await pool.query(
      'INSERT INTO payment_providers (code,type,name,currency,config,enabled) VALUES (?,?,?,?,?,?)',
      [provider.code, provider.type, provider.name, provider.currency, JSON.stringify(provider.config), provider.enabled ? 1 : 0]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, error: 'Payment provider code already exists' });
    if (e.status) return res.status(e.status).json({ success: false, error: e.message });
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    await initTable();
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid payment provider id' });
    }
    const provider = normalizeProvider(req.body);
    const [result] = await pool.query(
      'UPDATE payment_providers SET code=?, type=?, name=?, currency=?, config=?, enabled=? WHERE id=?',
      [provider.code, provider.type, provider.name, provider.currency, JSON.stringify(provider.config), provider.enabled ? 1 : 0, id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, error: 'Payment provider not found' });
    res.json({ success: true });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, error: 'Payment provider code already exists' });
    if (e.status) return res.status(e.status).json({ success: false, error: e.message });
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await initTable();
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid payment provider id' });
    }
    const [result] = await pool.query('DELETE FROM payment_providers WHERE id=?', [id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, error: 'Payment provider not found' });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
