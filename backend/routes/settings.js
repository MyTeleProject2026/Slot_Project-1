const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

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

module.exports = router;
