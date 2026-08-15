const User = require('../models/User');
const AdminBalance = require('../models/AdminBalance');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

exports.getSuperAdmins = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT u.*, ab.balance FROM users u LEFT JOIN admin_balances ab ON u.id = ab.admin_id WHERE u.role = "super_admin"');
    res.json({ success: true, superAdmins: rows });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.createSuperAdmin = async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;
    const existing = await User.findByUsername(username);
    if (existing) return res.status(400).json({ success: false, error: 'Username taken' });
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) return res.status(400).json({ success: false, error: 'Email registered' });
    const hashed = await bcrypt.hash(password, 10);
    const userId = await User.create({ username, email, password: hashed, fullName, phone, role: 'super_admin' });
    await AdminBalance.create(userId, 'super_admin');
    res.status(201).json({ success: true, userId });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.updateSuperAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, status } = req.body;
    await User.update(id, { fullName, phone, status });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.deleteSuperAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM admin_balances WHERE admin_id = ?', [id]);
    await User.delete(id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT u.*, ab.balance FROM users u LEFT JOIN admin_balances ab ON u.id = ab.admin_id WHERE u.role IN ("super_admin","admin","employee") ORDER BY FIELD(u.role, "super_admin","admin","employee")'
    );
    res.json({ success: true, admins: rows });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.updateAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await User.update(id, { status });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.addBalanceToSuperAdmin = async (req, res) => {
  try {
    const { superAdminId, amount } = req.body;
    if (amount <= 0) return res.status(400).json({ success: false, error: 'Amount > 0' });
    const sa = await User.findById(superAdminId);
    if (!sa || sa.role !== 'super_admin') return res.status(404).json({ success: false, error: 'Super admin not found' });
    const mainBal = await AdminBalance.findByAdminId(req.userId);
    if (!mainBal || parseFloat(mainBal.balance) < amount) return res.status(400).json({ success: false, error: 'Insufficient main admin balance' });
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      await connection.query('UPDATE admin_balances SET balance = balance - ? WHERE admin_id = ?', [amount, req.userId]);
      await connection.query('UPDATE admin_balances SET balance = balance + ? WHERE admin_id = ?', [amount, superAdminId]);
      await connection.commit();
      res.json({ success: true });
    } catch (err) { await connection.rollback(); throw err; } finally { connection.release(); }
  } catch (error) { res.status(500).json({ success: false, error: error.message || 'Failed' }); }
};

exports.addBalanceToAdmin = async (req, res) => {
  try {
    const { adminId, amount } = req.body;
    if (amount <= 0) return res.status(400).json({ success: false, error: 'Amount > 0' });
    const admin = await User.findById(adminId);
    if (!admin || !['admin','employee'].includes(admin.role)) return res.status(404).json({ success: false, error: 'Admin not found' });
    const mainBal = await AdminBalance.findByAdminId(req.userId);
    if (!mainBal || parseFloat(mainBal.balance) < amount) return res.status(400).json({ success: false, error: 'Insufficient main admin balance' });
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

exports.getBalanceOverview = async (req, res) => {
  try {
    const [adminBalances] = await pool.query('SELECT u.id, u.username, u.role, ab.balance FROM users u LEFT JOIN admin_balances ab ON u.id = ab.admin_id WHERE u.role IN ("main_admin","super_admin","admin","employee")');
    const [userBalances] = await pool.query('SELECT SUM(main_balance) as total_main, SUM(bonus_balance) as total_bonus, SUM(commission_balance) as total_commission FROM wallets');
    const [txStats] = await pool.query('SELECT SUM(CASE WHEN type="deposit" AND status="completed" THEN amount ELSE 0 END) as total_deposits, SUM(CASE WHEN type="withdraw" AND status="completed" THEN amount ELSE 0 END) as total_withdrawals FROM user_transactions');
    res.json({ success: true, overview: { adminBalances, userBalances: { main: parseFloat(userBalances[0]?.total_main||0), bonus: parseFloat(userBalances[0]?.total_bonus||0), commission: parseFloat(userBalances[0]?.total_commission||0) }, transactionVolume: { totalDeposits: parseFloat(txStats[0]?.total_deposits||0), totalWithdrawals: parseFloat(txStats[0]?.total_withdrawals||0) } } });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const [logs] = await pool.query('SELECT al.*, u.username as admin_name FROM admin_activity_log al LEFT JOIN users u ON al.admin_id = u.id ORDER BY al.created_at DESC LIMIT ? OFFSET ?', [parseInt(limit), parseInt(offset)]);
    res.json({ success: true, logs });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.getAdminAudit = async (req, res) => {
  try {
    const [admins] = await pool.query('SELECT u.id, u.username, u.role, COUNT(DISTINCT al.id) as total_actions FROM users u LEFT JOIN admin_activity_log al ON u.id = al.admin_id WHERE u.role IN ("super_admin","admin","employee") GROUP BY u.id');
    res.json({ success: true, admins });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.getTransactionAudit = async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    let filter = period === 'today' ? 'DATE(created_at) = CURDATE()' : period === 'week' ? 'created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)' : 'created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)';
    const [tx] = await pool.query(`SELECT DATE(created_at) as date, COUNT(*) as total, SUM(CASE WHEN type="deposit" AND status="completed" THEN amount ELSE 0 END) as deposit_amount FROM user_transactions WHERE ${filter} GROUP BY DATE(created_at) ORDER BY date DESC`);
    res.json({ success: true, transactions: tx });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.getFullStats = async (req, res) => {
  try {
    const [userStats] = await pool.query('SELECT COUNT(*) as total_users, SUM(CASE WHEN status="active" THEN 1 ELSE 0 END) as active_users FROM users');
    const [financialStats] = await pool.query('SELECT SUM(main_balance) as total_balance, SUM(bonus_balance) as total_bonus, SUM(commission_balance) as total_commission FROM wallets');
    const [gameStats] = await pool.query('SELECT COUNT(*) as total_games, SUM(total_plays) as total_plays FROM games');
    const [adminBalanceStats] = await pool.query('SELECT SUM(balance) as total_balance FROM admin_balances');
    res.json({ success: true, stats: { users: userStats[0], finances: financialStats[0], games: gameStats[0], adminBalance: adminBalanceStats[0] } });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};
