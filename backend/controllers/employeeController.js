const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Game = require('../models/Game');
const pool = require('../config/database');

// ============================================================
// EMPLOYEE USER MANAGEMENT
// ============================================================

exports.getUsers = async (req, res) => {
  try {
    const users = await User.getAll(req.query);
    res.json({ success: true, users });
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
    res.json({ success: true, user, wallet, transactions });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user details' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    await User.update(id, { status });
    res.json({ success: true, message: `User status updated to ${status}` });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update user status' });
  }
};

// ============================================================
// EMPLOYEE TRANSACTION MANAGEMENT
// ============================================================

exports.getTransactions = async (req, res) => {
  try {
    const { limit = 50, offset = 0, type, status, search } = req.query;
    const conditions = [];
    const values = [];
    if (type) { conditions.push('t.type = ?'); values.push(type); }
    if (status) { conditions.push('t.status = ?'); values.push(status); }
    if (search) { conditions.push('(u.username LIKE ? OR t.reference LIKE ?)'); values.push(`%${search}%`, `%${search}%`); }
    let sql = `SELECT t.*, u.username AS user_name
               FROM user_transactions t
               LEFT JOIN users u ON u.id=t.user_id`;
    if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
    sql += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    values.push(Math.min(Number(limit)||50,200), Math.max(Number(offset)||0,0));
    const [rows] = await pool.query(sql, values);
    res.json({ success: true, transactions: rows });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const [[users]] = await pool.query(`SELECT COUNT(*) AS total FROM users WHERE role='user'`);
    const [[pending]] = await pool.query(`SELECT COUNT(*) AS total FROM user_transactions WHERE status='pending'`);
    const [[deposits]] = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM user_transactions WHERE type='deposit' AND status='completed'`);
    const [[withdrawals]] = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM user_transactions WHERE type='withdraw' AND status='completed'`);
    res.json({success:true,stats:{users:Number(users.total),pending:Number(pending.total),deposits:Number(deposits.total),withdrawals:Number(withdrawals.total)}});
  } catch(error) {
    console.error('Employee dashboard error:',error);
    res.status(500).json({success:false,error:'Failed to load dashboard'});
  }
};

exports.approveTransaction = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    await connection.beginTransaction();
    const [rows] = await connection.query(
      'SELECT * FROM user_transactions WHERE id = ? FOR UPDATE', [id]
    );
    const tx = rows[0];
    if (!tx || tx.status !== 'pending') {
      await connection.rollback();
      return res.status(409).json({ success:false, error:'Transaction is no longer pending' });
    }
    const [walletRows] = await connection.query(
      'SELECT * FROM wallets WHERE user_id = ? FOR UPDATE', [tx.user_id]
    );
    if (!walletRows[0]) throw new Error('Wallet not found');

    if (tx.type === 'withdraw' && Number(walletRows[0].main_balance) < Number(tx.amount)) {
      await connection.rollback();
      return res.status(409).json({success:false,error:'Insufficient balance for withdrawal'});
    }

    if (tx.type === 'deposit') {
      await connection.query('UPDATE wallets SET main_balance = main_balance + ? WHERE user_id = ?', [tx.amount, tx.user_id]);
    } else if (tx.type === 'withdraw') {
      await connection.query('UPDATE wallets SET main_balance = main_balance - ? WHERE user_id = ? AND main_balance >= ?', [tx.amount, tx.user_id, tx.amount]);
    }

    await connection.query(
      `UPDATE user_transactions
       SET status='completed', approved_by=?, approved_at=NOW(),
           before_balance=?, after_balance=?
       WHERE id=? AND status='pending'`,
      [req.userId, walletRows[0].main_balance, tx.type==='deposit'
        ? Number(walletRows[0].main_balance)+Number(tx.amount)
        : Number(walletRows[0].main_balance)-Number(tx.amount), id]
    );
    await connection.commit();
    res.json({success:true,message:'Transaction approved'});
  } catch(error) {
    try { await connection.rollback(); } catch {}
    console.error('Approve transaction error:',error);
    res.status(500).json({success:false,error:'Failed to approve transaction'});
  } finally {
    connection.release();
  }
};

exports.rejectTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE user_transactions SET status='rejected', approved_by=?, approved_at=NOW()
       WHERE id=? AND status='pending'`,
      [req.userId,id]
    );
    if (!result.affectedRows) return res.status(409).json({success:false,error:'Transaction is no longer pending'});
    res.json({ success:true, message:'Transaction rejected' });
  } catch(error) {
    console.error('Reject transaction error:',error);
    res.status(500).json({success:false,error:'Failed to reject transaction'});
  }
};

// ============================================================
// GAME CONTROL
// ============================================================

exports.adjustGameRTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { rtpAdjustment } = req.body;
    await Game.updateRTP(id, rtpAdjustment, req.userId);
    res.json({ success: true, message: 'Game RTP adjusted' });
  } catch (error) {
    console.error('Adjust game RTP error:', error);
    res.status(500).json({ success: false, error: 'Failed to adjust RTP' });
  }
};
