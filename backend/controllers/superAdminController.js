const User = require('../models/User');
const AdminBalance = require('../models/AdminBalance');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

exports.getAdmins = async (req, res) => {
  try {
    const [admins] = await pool.query(
      `SELECT u.*, ab.balance, ab.frozen_balance FROM users u LEFT JOIN admin_balances ab ON u.id = ab.admin_id WHERE u.role IN ('admin','employee')`
    );
    res.json({ success: true, admins });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.createAdmin = async (req, res) => {
  try {
    const { username, email, password, fullName, phone, role, employeeId } = req.body;
    const existing = await User.findByUsername(username);
    if (existing) return res.status(400).json({ success: false, error: 'Username taken' });
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) return res.status(400).json({ success: false, error: 'Email registered' });
    const hashed = await bcrypt.hash(password, 10);
    const userId = await User.create({ username, email, password: hashed, fullName, phone, role: role || 'admin', employeeId });
    await AdminBalance.create(userId, role || 'admin');
    res.status(201).json({ success: true, userId });
  } catch (error) { res.status(500).json({ success: false, error: 'Create admin failed' }); }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, status, role } = req.body;
    await User.update(id, { fullName, phone, status, role });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: 'Update failed' }); }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM admin_balances WHERE admin_id = ?', [id]);
    await User.delete(id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: 'Delete failed' }); }
};

exports.getAdminBalance = async (req, res) => {
  try {
    const bal = await AdminBalance.findByAdminId(req.userId);
    if (!bal) return res.status(404).json({ success: false, error: 'Balance not found' });
    res.json({ success: true, balance: { available: parseFloat(bal.balance), frozen: parseFloat(bal.frozen_balance) } });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.addBalanceToAdmin = async (req, res) => {
  try {
    const { adminId, amount, description } = req.body;
    if (amount <= 0) return res.status(400).json({ success: false, error: 'Amount must be > 0' });
    const admin = await User.findById(adminId);
    if (!admin || !['admin','employee'].includes(admin.role)) return res.status(404).json({ success: false, error: 'Admin not found' });
    const senderBal = await AdminBalance.findByAdminId(req.userId);
    if (!senderBal || parseFloat(senderBal.balance) < amount) return res.status(400).json({ success: false, error: 'Insufficient super admin balance' });
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      await connection.query('UPDATE admin_balances SET balance = balance - ? WHERE admin_id = ?', [amount, req.userId]);
      await connection.query('UPDATE admin_balances SET balance = balance + ? WHERE admin_id = ?', [amount, adminId]);
      await connection.commit();
      res.json({ success: true });
    } catch (err) { await connection.rollback(); throw err; } finally { connection.release(); }
  } catch (error) { res.status(500).json({ success: false, error: error.message || 'Failed' }); }
};

exports.transferBalance = async (req, res) => {
  try {
    const { fromAdminId, toAdminId, amount } = req.body;
    await AdminBalance.transferToAdmin(fromAdminId, toAdminId, amount);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: error.message || 'Transfer failed' }); }
};

exports.getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings WHERE category IN ("system","game","payment")');
    res.json({ success: true, settings: rows });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    for (const [key, value] of Object.entries(settings)) {
      await connection.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [value, key]);
    }
    await connection.commit();
    connection.release();
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: 'Update failed' }); }
};

exports.updateGameSettings = async (req, res) => {
  try {
    const { defaultRTP, winRate, maxWin } = req.body;
    await pool.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [defaultRTP, 'default_rtp']);
    await pool.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [winRate, 'global_win_rate']);
    await pool.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [maxWin, 'max_win_limit']);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.updatePaymentSettings = async (req, res) => {
  try {
    const { minDeposit, maxDeposit, minWithdraw, maxWithdraw, paymentMethods } = req.body;
    await pool.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [minDeposit, 'min_deposit']);
    await pool.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [maxDeposit, 'max_deposit']);
    await pool.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [minWithdraw, 'min_withdraw']);
    await pool.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [maxWithdraw, 'max_withdraw']);
    await pool.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [JSON.stringify(paymentMethods), 'payment_methods']);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};
