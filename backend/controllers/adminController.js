// ============================================================
// USER BALANCE ADJUSTMENT
// ============================================================

exports.adjustUserBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type = 'adjustment' } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    // Find wallet
    const wallet = await Wallet.findByUserId(id);
    if (!wallet) return res.status(404).json({ success: false, error: 'Wallet not found' });
    
    // Adjust balance based on type
    await Wallet.updateBalance(id, 'main', amount);
    
    // Log transaction
    await Transaction.create({
      userId: id,
      type: type,
      amount: amount,
      beforeBalance: parseFloat(wallet.main_balance),
      afterBalance: parseFloat(wallet.main_balance) + amount,
      walletType: 'main',
      status: 'completed',
      description: `${type} adjustment by admin`,
      metadata: { adminId: req.userId }
    });
    
    res.json({ success: true, message: 'Balance adjusted successfully' });
  } catch (error) {
    console.error('Adjust user balance error:', error);
    res.status(500).json({ success: false, error: 'Failed to adjust balance' });
  }
};

// ============================================================
// GAME MANAGEMENT
// ============================================================

exports.getGames = async (req, res) => {
  try {
    const Game = require('../models/Game');
    const games = await Game.getAll();
    res.json({ success: true, games });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ success: false, error: 'Failed to get games' });
  }
};

exports.getGameById = async (req, res) => {
  try {
    const Game = require('../models/Game');
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, error: 'Game not found' });
    res.json({ success: true, game });
  } catch (error) {
    console.error('Get game by id error:', error);
    res.status(500).json({ success: false, error: 'Failed to get game' });
  }
};

exports.createGame = async (req, res) => {
  try {
    const Game = require('../models/Game');
    const id = await Game.create(req.body);
    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ success: false, error: 'Failed to create game' });
  }
};

exports.updateGame = async (req, res) => {
  try {
    const Game = require('../models/Game');
    const { id } = req.params;
    const updated = await Game.update(id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Game not found' });
    res.json({ success: true, message: 'Game updated' });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ success: false, error: 'Failed to update game' });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    const Game = require('../models/Game');
    const { id } = req.params;
    const deleted = await Game.delete(id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Game not found' });
    res.json({ success: true, message: 'Game deleted' });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete game' });
  }
};

// ============================================================
// BANNER MANAGEMENT
// ============================================================

exports.getBanners = async (req, res) => {
  try {
    const pool = require('../config/database');
    const [rows] = await pool.query('SELECT * FROM banners ORDER BY sort_order ASC');
    res.json({ success: true, banners: rows });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({ success: false, error: 'Failed to get banners' });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const pool = require('../config/database');
    const { title, image_url, link_url, sort_order, is_active } = req.body;
    const [result] = await pool.query(
      'INSERT INTO banners (title, image_url, link_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?)',
      [title, image_url, link_url, sort_order || 0, is_active || 1]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({ success: false, error: 'Failed to create banner' });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const pool = require('../config/database');
    const { id } = req.params;
    const { title, image_url, link_url, sort_order, is_active } = req.body;
    const [result] = await pool.query(
      'UPDATE banners SET title = ?, image_url = ?, link_url = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [title, image_url, link_url, sort_order, is_active, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Banner not found' });
    res.json({ success: true, message: 'Banner updated' });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({ success: false, error: 'Failed to update banner' });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const pool = require('../config/database');
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM banners WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Banner not found' });
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete banner' });
  }
};

// ============================================================
// PROMOTION MANAGEMENT
// ============================================================

exports.getPromotions = async (req, res) => {
  try {
    const Promotion = require('../models/Promotion');
    const promotions = await Promotion.getAll();
    res.json({ success: true, promotions });
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({ success: false, error: 'Failed to get promotions' });
  }
};

exports.createPromotion = async (req, res) => {
  try {
    const Promotion = require('../models/Promotion');
    const id = await Promotion.create(req.body);
    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({ success: false, error: 'Failed to create promotion' });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const Promotion = require('../models/Promotion');
    const { id } = req.params;
    const updated = await Promotion.update(id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Promotion not found' });
    res.json({ success: true, message: 'Promotion updated' });
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({ success: false, error: 'Failed to update promotion' });
  }
};

exports.deletePromotion = async (req, res) => {
  try {
    const Promotion = require('../models/Promotion');
    const { id } = req.params;
    const deleted = await Promotion.delete(id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Promotion not found' });
    res.json({ success: true, message: 'Promotion deleted' });
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete promotion' });
  }
};

// ============================================================
// LANGUAGE MANAGEMENT
// ============================================================

exports.getLanguages = async (req, res) => {
  try {
    // Get languages from settings or return default list
    const pool = require('../config/database');
    const [rows] = await pool.query('SELECT * FROM languages ORDER BY name');
    res.json({ success: true, languages: rows });
  } catch (error) {
    // Fallback: return default languages
    res.json({ success: true, languages: [
      { code: 'en', name: 'English', is_default: true, is_active: true },
      { code: 'mm', name: 'Myanmar', is_default: false, is_active: true },
      { code: 'th', name: 'Thai', is_default: false, is_active: false },
    ]});
  }
};

exports.updateLanguage = async (req, res) => {
  try {
    const { code } = req.params;
    const { translations } = req.body;
    const pool = require('../config/database');
    await pool.query('UPDATE languages SET translations = ? WHERE code = ?', [JSON.stringify(translations), code]);
    res.json({ success: true, message: 'Language updated' });
  } catch (error) {
    console.error('Update language error:', error);
    res.status(500).json({ success: false, error: 'Failed to update language' });
  }
};

// ============================================================
// SETTINGS MANAGEMENT
// ============================================================

exports.getSettings = async (req, res) => {
  try {
    const { category } = req.params;
    const pool = require('../config/database');
    const [rows] = await pool.query('SELECT * FROM settings WHERE category = ?', [category]);
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Get settings error:', error);
    // Return empty settings object
    res.json({ success: true, settings: {} });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { category } = req.params;
    const settings = req.body;
    const pool = require('../config/database');
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    for (const [key, value] of Object.entries(settings)) {
      await connection.query(
        'INSERT INTO settings (setting_key, setting_value, category) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, value, category, value]
      );
    }
    await connection.commit();
    connection.release();
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
};

// ============================================================
// SUPPORT CHAT
// ============================================================

exports.getSupportMessages = async (req, res) => {
  try {
    const ChatMessage = require('../models/ChatMessage');
    const messages = await ChatMessage.getAll();
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get support messages error:', error);
    res.json({ success: true, messages: [] });
  }
};

exports.sendSupportReply = async (req, res) => {
  try {
    const { userId, message } = req.body;
    const ChatMessage = require('../models/ChatMessage');
    const id = await ChatMessage.create({ userId, adminId: req.userId, message, isFromUser: false });
    const msg = await ChatMessage.findById(id);
    res.json({ success: true, message: msg });
  } catch (error) {
    console.error('Send support reply error:', error);
    res.status(500).json({ success: false, error: 'Failed to send reply' });
  }
};

exports.resolveSupportTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ChatMessage = require('../models/ChatMessage');
    await ChatMessage.updateStatus(id, 'resolved');
    res.json({ success: true, message: 'Ticket resolved' });
  } catch (error) {
    console.error('Resolve support ticket error:', error);
    res.status(500).json({ success: false, error: 'Failed to resolve ticket' });
  }
};
