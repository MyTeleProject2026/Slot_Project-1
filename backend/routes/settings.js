const express = require('express');
const router = express.Router();
const Setting = require('../models/Settings');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

const DEFAULT_MYANMAR_COUNTRY = {
  code: 'MM',
  name: 'Myanmar',
  currency: 'MMK',
  currencySymbol: 'K',
  locale: 'my-MM',
  timezone: 'Asia/Yangon'
};

router.get('/public', async (req, res) => {
  try {
    const settings = await Setting.getPublic();
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to get settings' });
  }
});

router.get('/country', async (req, res) => {
  try {
    const country = await Setting.getCountry();
    res.json({ success: true, country: country || DEFAULT_MYANMAR_COUNTRY });
  } catch (error) {
    console.error('Get country error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/country', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN), async (req, res) => {
  try {
    const { code, name, currency, currencySymbol, locale, timezone } = req.body;
    if (!code || !name || !currency) {
      return res.status(400).json({ success: false, error: 'Missing required fields: code, name, currency' });
    }
    const country = { code, name, currency, currencySymbol, locale, timezone };
    await Setting.setCountry(country);
    res.json({ success: true, country });
  } catch (error) {
    console.error('Update country error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/general', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN), async (req, res) => {
  try {
    const { siteName, siteLogo, favicon, footerText } = req.body;
    const settings = { siteName, siteLogo, favicon, footerText };
    await Setting.updateOrInsert('general', settings);
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Update general settings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/theme', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN), async (req, res) => {
  try {
    const { primaryColor, secondaryColor, darkMode } = req.body;
    const settings = { primaryColor, secondaryColor, darkMode };
    await Setting.updateOrInsert('theme', settings);
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/payment', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN), async (req, res) => {
  try {
    const { minDeposit, maxDeposit, minWithdraw, maxWithdraw, paymentMethods } = req.body;
    const settings = { minDeposit, maxDeposit, minWithdraw, maxWithdraw, paymentMethods: JSON.stringify(paymentMethods || []) };
    await Setting.updateOrInsert('payment', settings);
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
