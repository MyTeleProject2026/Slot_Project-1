const Promotion = require('../models/Promotion');
const pool = require('../config/database');

const unsupported = (name) => async (req, res) => {
  res.status(501).json({ success: false, error: `${name} API is not available in the current database schema` });
};

exports.getPromotions = async (req, res) => {
  try {
    const rows = await Promotion.getAll(req.query.countryCode || null, req.query.currency || null);
    res.json({ success: true, promotions: rows });
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch promotions' });
  }
};

exports.createPromotion = async (req, res) => {
  try {
    const id = await Promotion.create(req.body);
    res.status(201).json({ success: true, id, message: 'Promotion created' });
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({ success: false, error: 'Failed to create promotion' });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const updated = await Promotion.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Promotion not found or unchanged' });
    res.json({ success: true, message: 'Promotion updated' });
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({ success: false, error: 'Failed to update promotion' });
  }
};

exports.deletePromotion = async (req, res) => {
  try {
    const deleted = await Promotion.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Promotion not found' });
    res.json({ success: true, message: 'Promotion deleted' });
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete promotion' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [[users]] = await pool.query('SELECT COUNT(*) AS count FROM users');
    const [[transactions]] = await pool.query('SELECT COUNT(*) AS count FROM user_transactions');
    const [[pending]] = await pool.query("SELECT COUNT(*) AS count FROM user_transactions WHERE status = 'pending'");
    res.json({ success: true, stats: { users: Number(users?.count || 0), transactions: Number(transactions?.count || 0), pendingTransactions: Number(pending?.count || 0) } });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard statistics' });
  }
};

exports.getBanners = unsupported('Banner management');
exports.createBanner = unsupported('Banner management');
exports.updateBanner = unsupported('Banner management');
exports.deleteBanner = unsupported('Banner management');
exports.getLanguages = unsupported('Language management');
exports.updateLanguage = unsupported('Language management');
exports.getSettings = unsupported('System settings');
exports.updateSettings = unsupported('System settings');
exports.getSupportMessages = unsupported('Support messages');
exports.sendSupportReply = unsupported('Support replies');
exports.resolveSupportTicket = unsupported('Support tickets');
