const express = require('express');
const router = express.Router();
const Setting = require('../models/Settings');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

// Public settings (no auth required)
router.get('/public', async (req, res) => {
  try {
    const settings = await Setting.getPublic();
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to get settings' });
  }
});

// ✅ NEW: Get current country (public)
router.get('/country', async (req, res) => {
  try {
    const country = await Setting.getCountry();
    if (country) {
      res.json({ success: true, country });
    } else {
      // Return default
      res.json({
        success: true,
        country: { code: 'TH', name: 'Thailand', currency: 'THB', currencySymbol: '฿', locale: 'th-TH' }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ NEW: Update country (super admin only)
router.put('/country', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN), async (req, res) => {
  try {
    const { code, name, currency, currencySymbol, locale, timezone } = req.body;
    if (!code || !name || !currency) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const country = { code, name, currency, currencySymbol, locale, timezone };
    await Setting.setCountry(country);
    res.json({ success: true, country });
  } catch (error) {
    console.error('Update country error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
