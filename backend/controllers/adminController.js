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
    // Log action
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
    // Log
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
    // Check admin balance for withdrawals
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
// GAME CONTROL
// ============================================================

exports.adjustGameRTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { rtpAdjustment } = req.body;
    const game = await Game.findById(id);
    if (!game) return res.status(404).json({ success: false, error: 'Game not found' });
    await Game.updateRTP(id, rtpAdjustment, req.userId);
    // Log
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
    // Placeholder – implement actual logic if needed
    res.json({ success: true, message: 'Win rate adjustment (stub)' });
  } catch (error) {
    console.error('Adjust win rate error:', error);
    res.status(500).json({ success: false, error: 'Failed to adjust win rate' });
  }
};

// ============================================================
// DASHBOARD STATS
// ============================================================

exports.getDashboardStats = async (req, res) => {
  try {
    const [userCount] = await pool.query('SELECT COUNT(*) as total FROM users WHERE role = "user"');
    const [txStats] = await pool.query(`
      SELECT COUNT(*) as total_transactions,
             SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
             SUM(CASE WHEN type='deposit' AND status='completed' THEN amount ELSE 0 END) as total_deposits,
             SUM(CASE WHEN type='withdraw' AND status='completed' THEN amount ELSE 0 END) as total_withdrawals
      FROM user_transactions
    `);
    const [walletStats] = await pool.query(`
      SELECT SUM(main_balance) as total_main,
             SUM(bonus_balance) as total_bonus,
             SUM(commission_balance) as total_commission
      FROM wallets
    `);
    const [online] = await pool.query('SELECT COUNT(*) as online FROM users WHERE last_login > DATE_SUB(NOW(), INTERVAL 5 MINUTE)');
    const [recent] = await pool.query(`
      SELECT t.*, u.username FROM user_transactions t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC LIMIT 10
    `);
    res.json({
      success: true,
      stats: {
        totalUsers: userCount[0]?.total || 0,
        onlineUsers: online[0]?.online || 0,
        transactions: {
          total: txStats[0]?.total_transactions || 0,
          pending: txStats[0]?.pending || 0,
          totalDeposits: parseFloat(txStats[0]?.total_deposits || 0),
          totalWithdrawals: parseFloat(txStats[0]?.total_withdrawals || 0)
        },
        balances: {
          main: parseFloat(walletStats[0]?.total_main || 0),
          bonus: parseFloat(walletStats[0]?.total_bonus || 0),
          commission: parseFloat(walletStats[0]?.total_commission || 0)
        },
        recentTransactions: recent
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
};
