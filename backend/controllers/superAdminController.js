const User = require('../models/User');
const AdminBalance = require('../models/AdminBalance');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const isFinitePositive = (value) => Number.isFinite(Number(value)) && Number(value) > 0;

// ============================================================
// ADMIN MANAGEMENT
// ============================================================

exports.getAdmins = async (req, res) => {
  try {
    const [admins] = await pool.query(
      `SELECT u.id, u.username, u.email, u.full_name, u.phone, u.role, u.status,
              u.employee_id, u.created_at, u.updated_at,
              ab.balance, ab.frozen_balance
       FROM users u
       LEFT JOIN admin_balances ab ON u.id = ab.admin_id
       WHERE u.role IN ('admin', 'employee')
       ORDER BY u.created_at DESC`
    );
    res.json({ success: true, admins });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch admins' });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { username, email, password, fullName, phone, role, employeeId } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'Username, email and password are required' });
    }
    if (!['admin', 'employee'].includes(role || 'admin')) {
      return res.status(400).json({ success: false, error: 'Only admin or employee roles can be created here' });
    }

    const existing = await User.findByUsername(username);
    if (existing) return res.status(400).json({ success: false, error: 'Username taken' });
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) return res.status(400).json({ success: false, error: 'Email registered' });

    const hashed = await bcrypt.hash(password, 12);
    const assignedRole = role || 'admin';
    const userId = await User.create({
      username, email, password: hashed, fullName, phone,
      role: assignedRole, employeeId
    });
    await AdminBalance.create(userId, assignedRole);
    res.status(201).json({ success: true, userId });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ success: false, error: 'Failed to create admin' });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, status, role } = req.body;
    const target = await User.findById(id);
    if (!target || !['admin', 'employee'].includes(target.role)) {
      return res.status(404).json({ success: false, error: 'Administrator not found' });
    }
    if (String(req.userId) === String(id)) {
      if (status && status !== target.status) {
        return res.status(400).json({ success: false, error: 'You cannot change your own account status' });
      }
      if (role && role !== target.role) {
        return res.status(400).json({ success: false, error: 'You cannot change your own role' });
      }
    }
    if (role && !['admin', 'employee'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid administrator role' });
    }
    await User.update(id, { fullName, phone, status, role });
    res.json({ success: true, message: 'Admin updated' });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ success: false, error: 'Failed to update admin' });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (String(req.userId) === String(id)) {
      return res.status(400).json({ success: false, error: 'You cannot delete your own administrator account' });
    }
    const target = await User.findById(id);
    if (!target || !['admin', 'employee'].includes(target.role)) {
      return res.status(404).json({ success: false, error: 'Administrator not found' });
    }
    await pool.query('DELETE FROM admin_balances WHERE admin_id = ?', [id]);
    await User.delete(id);
    res.json({ success: true, message: 'Admin deleted' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete admin' });
  }
};

// ============================================================
// ADMIN / MASTER BALANCE
// ============================================================

exports.getAdminBalance = async (req, res) => {
  try {
    const balance = await AdminBalance.findByAdminId(req.userId);
    if (!balance) return res.status(404).json({ success: false, error: 'Balance not found' });
    res.json({
      success: true,
      balance: {
        available: parseFloat(balance.balance),
        frozen: parseFloat(balance.frozen_balance)
      }
    });
  } catch (error) {
    console.error('Get admin balance error:', error);
    res.status(500).json({ success: false, error: 'Failed to get balance' });
  }
};

exports.addBalanceToAdmin = async (req, res) => {
  try {
    const { adminId, amount, description } = req.body;
    if (!isFinitePositive(amount)) {
      return res.status(400).json({ success: false, error: 'Amount must be a positive number' });
    }
    const admin = await User.findById(adminId);
    if (!admin || !['admin', 'employee'].includes(admin.role)) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }
    if (String(adminId) === String(req.userId)) {
      return res.status(400).json({ success: false, error: 'Use the master balance operation for your own account' });
    }

    const senderBal = await AdminBalance.findByAdminId(req.userId);
    if (!senderBal || parseFloat(senderBal.balance) < Number(amount)) {
      return res.status(400).json({ success: false, error: 'Insufficient super admin balance' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [debit] = await connection.query(
        'UPDATE admin_balances SET balance = balance - ? WHERE admin_id = ? AND balance >= ?',
        [Number(amount), req.userId, Number(amount)]
      );
      if (debit.affectedRows !== 1) {
        throw new Error('Insufficient super admin balance');
      }
      const [credit] = await connection.query(
        'UPDATE admin_balances SET balance = balance + ? WHERE admin_id = ?',
        [Number(amount), adminId]
      );
      if (credit.affectedRows !== 1) throw new Error('Destination admin balance not found');
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    res.json({ success: true, message: 'Balance added', amount: Number(amount), description: description || null });
  } catch (error) {
    console.error('Add balance to admin error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to add balance' });
  }
};

exports.transferBalance = async (req, res) => {
  try {
    const { fromAdminId, toAdminId, amount } = req.body;
    if (!isFinitePositive(amount)) return res.status(400).json({ success: false, error: 'Amount must be a positive number' });
    if (String(fromAdminId) === String(toAdminId)) return res.status(400).json({ success: false, error: 'Source and destination must be different' });
    if (String(fromAdminId) !== String(req.userId)) {
      return res.status(403).json({ success: false, error: 'You may only transfer from your own balance' });
    }
    await AdminBalance.transferToAdmin(fromAdminId, toAdminId, Number(amount));
    res.json({ success: true, message: 'Balance transferred' });
  } catch (error) {
    console.error('Transfer balance error:', error);
    res.status(500).json({ success: false, error: error.message || 'Transfer failed' });
  }
};

// ============================================================
// SYSTEM SETTINGS
// ============================================================

exports.getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM settings WHERE category IN ("system", "game", "payment") ORDER BY category, setting_key'
    );
    res.json({ success: true, settings: rows });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to get settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return res.status(400).json({ success: false, error: 'Settings object is required' });
    }
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const [key, value] of Object.entries(settings)) {
        await connection.query(
          'UPDATE settings SET setting_value = ? WHERE setting_key = ? AND category IN ("system", "game", "payment")',
          [typeof value === 'object' ? JSON.stringify(value) : String(value), key]
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
};

// Game settings are restricted to operational configuration. The owner console
// must not provide controls that alter individual-player outcomes or secretly
// rig win/loss rates.
exports.updateGameSettings = async (req, res) => {
  try {
    const { enabled, maintenanceMode, defaultBet, maxBet } = req.body;
    const allowed = { enabled, maintenanceMode, defaultBet, maxBet };
    const updates = Object.entries(allowed).filter(([, value]) => value !== undefined);
    if (!updates.length) {
      return res.status(400).json({ success: false, error: 'No supported game operational settings supplied' });
    }

    const keyMap = {
      enabled: 'games_enabled',
      maintenanceMode: 'games_maintenance_mode',
      defaultBet: 'default_bet',
      maxBet: 'max_bet'
    };
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const [field, value] of updates) {
        await connection.query(
          'UPDATE settings SET setting_value = ? WHERE setting_key = ? AND category = "game"',
          [typeof value === 'object' ? JSON.stringify(value) : String(value), keyMap[field]]
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    res.json({ success: true, message: 'Game operational settings updated' });
  } catch (error) {
    console.error('Update game settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to update game settings' });
  }
};

exports.updatePaymentSettings = async (req, res) => {
  try {
    const { minDeposit, maxDeposit, minWithdraw, maxWithdraw, paymentMethods } = req.body;
    if (minDeposit !== undefined && !isFinitePositive(minDeposit)) return res.status(400).json({ success: false, error: 'Invalid minimum deposit' });
    if (maxDeposit !== undefined && !isFinitePositive(maxDeposit)) return res.status(400).json({ success: false, error: 'Invalid maximum deposit' });
    if (minWithdraw !== undefined && !isFinitePositive(minWithdraw)) return res.status(400).json({ success: false, error: 'Invalid minimum withdrawal' });
    if (maxWithdraw !== undefined && !isFinitePositive(maxWithdraw)) return res.status(400).json({ success: false, error: 'Invalid maximum withdrawal' });
    if (minDeposit !== undefined && maxDeposit !== undefined && Number(minDeposit) > Number(maxDeposit)) return res.status(400).json({ success: false, error: 'Minimum deposit cannot exceed maximum deposit' });
    if (minWithdraw !== undefined && maxWithdraw !== undefined && Number(minWithdraw) > Number(maxWithdraw)) return res.status(400).json({ success: false, error: 'Minimum withdrawal cannot exceed maximum withdrawal' });
    if (paymentMethods !== undefined && (!Array.isArray(paymentMethods) || paymentMethods.some((m) => !m || typeof m !== 'object'))) {
      return res.status(400).json({ success: false, error: 'paymentMethods must be an array of objects' });
    }

    const values = {
      min_deposit: minDeposit,
      max_deposit: maxDeposit,
      min_withdraw: minWithdraw,
      max_withdraw: maxWithdraw,
      payment_methods: paymentMethods
    };
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const [key, value] of Object.entries(values)) {
        if (value === undefined) continue;
        await connection.query(
          'UPDATE settings SET setting_value = ? WHERE setting_key = ? AND category = "payment"',
          [key === 'payment_methods' ? JSON.stringify(value) : String(value), key]
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    res.json({ success: true, message: 'Payment settings updated' });
  } catch (error) {
    console.error('Update payment settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to update payment settings' });
  }
};
