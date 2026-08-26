const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

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

router.get('/', async (req, res, next) => {
  try { await initTable(); const [rows] = await pool.query('SELECT * FROM payment_providers ORDER BY id DESC'); res.json({ success: true, providers: rows.map(r => ({ ...r, config: typeof r.config === 'string' ? JSON.parse(r.config || '{}') : (r.config || {}) })) }); } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    await initTable();
    const { code, type, name, currency = 'MMK', config = {}, enabled = true } = req.body;
    if (!code || !type || !name) return res.status(400).json({ success:false, error:'code, type and name are required' });
    const [result] = await pool.query('INSERT INTO payment_providers (code,type,name,currency,config,enabled) VALUES (?,?,?,?,?,?)', [code, type, name, currency, JSON.stringify(config), enabled ? 1 : 0]);
    res.status(201).json({ success:true, id: result.insertId });
  } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try {
    await initTable(); const { code, type, name, currency='MMK', config={}, enabled=true } = req.body;
    const [result] = await pool.query('UPDATE payment_providers SET code=?, type=?, name=?, currency=?, config=?, enabled=? WHERE id=?', [code,type,name,currency,JSON.stringify(config),enabled?1:0,req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success:false, error:'Payment provider not found' });
    res.json({ success:true });
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => { try { await initTable(); const [r] = await pool.query('DELETE FROM payment_providers WHERE id=?',[req.params.id]); if (!r.affectedRows) return res.status(404).json({success:false,error:'Payment provider not found'}); res.json({success:true}); } catch(e){next(e);} });

module.exports = router;
