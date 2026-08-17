const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Public settings (no auth required)
router.get('/public', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT setting_key, setting_value FROM settings WHERE is_public = 1"
    );
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to get settings' });
  }
});

module.exports = router;
