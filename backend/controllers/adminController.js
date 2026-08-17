const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const AdminBalance = require('../models/AdminBalance');
const Game = require('../models/Game');
const pool = require('../config/database');

// ============================================================
// USER MANAGEMENT
// ============================================================

exports.getUsers = async (req, res) => {
  try {
    const { search, status, role, limit = 50, offset = 0 } = req.query;
    const users = await User.getAll({ search, status, role, limit: parseInt(limit), offset: parseInt(offset) });
    const withBalance = await Promise.all(users.map(async u => {
      const w = await Wallet.findByUserId(u.id);
      return { ...u, balance: w ? parseFloat(w.main_balance) : 0 };
    }));
    res.json({ success: true, users: withBalance });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const wallet = await Wallet.findByUserId(req.params.id);
    const transactions = await Transaction.findByUserId(req.params.id, 20);
    res.json({ success: true, user, wallet, recentTransactions: transactions });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user details' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    await User.update(id, { status });
    const activityLog = require('../models/AdminActivityLog');
    await activityLog.create({
      adminId: req.userId,
      action: 'UPDATE_USER_STATUS',
      targetType: 'user',
      targetId: id,
      description: `Status changed to ${status}${reason ? `: ${reason}` : ''}`
    });
    res.json({ success: true, message: `User status updated to ${status}` });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update user status' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    await User.update(id, { status: 'blocked' });
    const activityLog = require('../models/AdminActivityLog');
    await activityLog.create({
      adminId: req.userId,
      action: 'DELETE_USER',
      targetType: 'user',
      targetId: id,
      description: `User deleted${reason ? `: ${reason}` : ''}`
    });
    res.json({ success: true, message: 'User blocked/deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
};

exports.adjustUserBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type = 'adjustment' } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const wallet = await Wallet.findByUserId(id);
    if (!wallet) return res.status(404).json({ success: false, error: 'Wallet not found' });
    await Wallet.updateBalance(id, 'main', amount);
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
// TRANSACTION MANAGEMENT
// ============================================================

exports.getTransactions = async (req, res) => {
  try {
    const { status, type, limit = 50, offset = 0 } = req.query;
    let transactions;
    if (status) {
      transactions = await Transaction.findByStatus(status, parseInt(limit));
    } else {
      const [rows] = await pool.query(
        `SELECT t.*, u.username as user_name FROM user_transactions t LEFT JOIN users u ON t.user_id = u.id
         ${type ? 'WHERE t.type = ?' : ''} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
        type ? [type, parseInt(limit), parseInt(offset)] : [parseInt(limit), parseInt(offset)]
      );
      transactions = rows;
    }
    res.json({ success: true, transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
};

exports.approveTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const tx = await Transaction.findById(id);
    if (!tx) return res.status(404).json({ success: false, error: 'Transaction not found' });
    if (tx.status !== 'pending') return res.status(400).json({ success: false, error: 'Transaction not pending' });
    if (tx.type === 'withdraw') {
      const adminBalance = await AdminBalance.findByAdminId(req.userId);
      if (!adminBalance || parseFloat(adminBalance.balance) < tx.amount) {
        return res.status(400).json({ success: false, error: 'Insufficient admin balance' });
      }
    }
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      if (tx.type === 'deposit') {
        await Wallet.updateBalance(tx.user_id, 'main', tx.amount);
        await AdminBalance.updateBalance(req.userId, -tx.amount);
        await AdminBalance.updateBalance(req.userId, tx.amount, 'total_deposits');
      } else if (tx.type === 'withdraw') {
        await Wallet.updateBalance(tx.user_id, 'main', -tx.amount);
        await AdminBalance.updateBalance(req.userId, tx.amount);
      }
      await Transaction.updateStatus(id, 'completed', req.userId);
      await connection.commit();
      res.json({ success: true, message: 'Transaction approved' });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Approve transaction error:', error);
    res.status(500).json({ success: false, error: error.message || 'Approval failed' });
  }
};

exports.rejectTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const tx = await Transaction.findById(id);
    if (!tx || tx.status !== 'pending') return res.status(400).json({ success: false, error: 'Invalid transaction' });
    await Transaction.updateStatus(id, 'rejected', req.userId);
    res.json({ success: true, message: 'Transaction rejected' });
  } catch (error) {
    console.error('Reject transaction error:', error);
    res.status(500).json({ success: false, error: 'Reject failed' });
  }
};

// ============================================================
// GAME MANAGEMENT
// ============================================================

exports.getGames = async (req, res) => {
  try {
    const games = await Game.getAll();
    res.json({ success: true, games });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ success: false, error: 'Failed to get games' });
  }
};

exports.getGameById = async (req, res) => {
  try {
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
    const id = await Game.create(req.body);
    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ success: false, error: 'Failed to create game' });
  }
};

exports.updateGame = async (req, res) => {
  try {
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
    const { id } = req.params;
    const deleted = await Game.delete(id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Game not found' });
    res.json({ success: true, message: 'Game deleted' });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete game' });
  }
};

exports.adjustGameRTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { rtpAdjustment } = req.body;
    const game = await Game.findById(id);
    if (!game) return res.status(404).json({ success: false, error: 'Game not found' });
    await Game.updateRTP(id, rtpAdjustment, req.userId);
    const activityLog = require('../models/AdminActivityLog');
    await activityLog.create({
      adminId: req.userId,
      action: 'ADJUST_GAME_RTP',
      targetType: 'game',
      targetId: id,
      description: `RTP adjusted to ${rtpAdjustment}%`
    });
    res.json({ success: true, message: 'Game RTP adjusted' });
  } catch (error) {
    console.error('Adjust game RTP error:', error);
    res.status(500).json({ success: false, error: 'Failed to adjust RTP' });
  }
};

exports.adjustWinRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { winRateAdjustment } = req.body;
    res.json({ success: true, message: 'Win rate adjustment (stub)' });
  } catch (error) {
    console.error('Adjust win rate error:', error);
    res.status(500).json({ success: false, error: 'Failed to adjust win rate' });
  }
};

// ============================================================
// BANNER MANAGEMENT
// ============================================================

exports.getBanners = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM banners ORDER BY sort_order ASC');
    res.json({ success: true, banners: rows });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({ success: false, error: 'Failed to get banners' });
  }
};

exports.createBanner = async (req, res) => {
  try {
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
    const [rows] = await pool.query('SELECT * FROM settings WHERE category = ?', [category]);
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.json({ success: true, settings: {} });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { category } = req.params;
    const settings = req.body;
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

// ============================================================
// DASHBOARD STATS
// ============================================================

exports.getDashboardStats = async (req, res) => {
  try {
    let stats = {
      totalUsers: 0,
      onlineUsers: 0,
      transactions: { total: 0, pending: 0, totalDeposits: 0, totalWithdrawals: 0 },
      balances: { main: 0, bonus: 0, commission: 0 },
      recentTransactions: []
    };

    try {
      const [rows] = await pool.query('SELECT COUNT(*) as total FROM users WHERE role = "user"');
      stats.totalUsers = rows[0]?.total || 0;
    } catch (err) { console.error('User count error:', err.message); }

    try {
      const [rows] = await pool.query(`
        SELECT COUNT(*) as total_transactions,
               SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
               SUM(CASE WHEN type='deposit' AND status='completed' THEN amount ELSE 0 END) as total_deposits,
               SUM(CASE WHEN type='withdraw' AND status='completed' THEN amount ELSE 0 END) as total_withdrawals
        FROM user_transactions
      `);
      const tx = rows[0] || {};
      stats.transactions = {
        total: tx.total_transactions || 0,
        pending: tx.pending || 0,
        totalDeposits: parseFloat(tx.total_deposits || 0),
        totalWithdrawals: parseFloat(tx.total_withdrawals || 0)
      };
    } catch (err) { console.error('Transaction stats error:', err.message); }

    try {
      const [rows] = await pool.query(`
        SELECT SUM(main_balance) as total_main,
               SUM(bonus_balance) as total_bonus,
               SUM(commission_balance) as total_commission
        FROM wallets
      `);
      const w = rows[0] || {};
      stats.balances = {
        main: parseFloat(w.total_main || 0),
        bonus: parseFloat(w.total_bonus || 0),
        commission: parseFloat(w.total_commission || 0)
      };
    } catch (err) { console.error('Wallet stats error:', err.message); }

    try {
      const [rows] = await pool.query('SELECT COUNT(*) as online FROM users WHERE last_login > DATE_SUB(NOW(), INTERVAL 5 MINUTE)');
      stats.onlineUsers = rows[0]?.online || 0;
    } catch (err) { console.error('Online users error:', err.message); }

    try {
      const [rows] = await pool.query(`
        SELECT t.*, u.username FROM user_transactions t
        LEFT JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC LIMIT 10
      `);
      stats.recentTransactions = rows;
    } catch (err) { console.error('Recent transactions error:', err.message); }

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Fatal error in getDashboardStats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard stats',
      stats: {
        totalUsers: 0,
        onlineUsers: 0,
        transactions: { total: 0, pending: 0, totalDeposits: 0, totalWithdrawals: 0 },
        balances: { main: 0, bonus: 0, commission: 0 },
        recentTransactions: []
      }
    });
  }
};
