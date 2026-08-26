const crypto = require('crypto');
const pool = require('../config/database');
const User = require('../models/User');
const AdminBalance = require('../models/AdminBalance');

const safeEqual = (a, b) => {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

exports.receiveFunding = async (req, res) => {
  const expectedKey = process.env.SLOTOPOL_ADMIN_TRANSFER_KEY;
  if (!expectedKey || !safeEqual(req.get('X-Slotopol-Transfer-Key'), expectedKey)) {
    return res.status(401).json({ success: false, error: 'Invalid Slotopol transfer authorization' });
  }

  const { transferId, amount, currency = 'MMK', countryCode = 'MM', description = 'Slotopol-admin funding' } = req.body || {};
  const numericAmount = Number(amount);
  if (!transferId || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ success: false, error: 'transferId and a positive amount are required' });
  }
  if (String(currency).toUpperCase() !== 'MMK' || String(countryCode).toUpperCase() !== 'MM') {
    return res.status(400).json({ success: false, error: 'N999Bet funding is currently restricted to Myanmar MMK' });
  }

  const superAdminId = Number(process.env.N999BET_SUPER_ADMIN_ID);
  if (!Number.isInteger(superAdminId) || superAdminId <= 0) {
    return res.status(500).json({ success: false, error: 'N999BET_SUPER_ADMIN_ID is not configured' });
  }
  const superAdmin = await User.findById(superAdminId);
  if (!superAdmin || superAdmin.role !== 'super_admin') {
    return res.status(500).json({ success: false, error: 'Configured N999Bet Super Admin account was not found' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.query('SELECT id, status FROM slotopol_funding_ledger WHERE transfer_id = ? FOR UPDATE', [String(transferId)]);
    if (existing.length) {
      await connection.commit();
      return res.json({ success: true, idempotent: true, message: 'Funding transfer already received', transferId });
    }

    await connection.query(
      'INSERT INTO slotopol_funding_ledger (transfer_id, recipient_admin_id, amount, currency, country_code, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [String(transferId), superAdminId, numericAmount, 'MMK', 'MM', String(description).slice(0, 500), 'completed']
    );
    const [updated] = await connection.query(
      'UPDATE admin_balances SET balance = balance + ?, updated_at = NOW() WHERE admin_id = ? AND role = ?',
      [numericAmount, superAdminId, 'super_admin']
    );
    if (!updated.affectedRows) throw new Error('Super Admin balance record not found');

    await connection.commit();
    const balance = await AdminBalance.findByAdminId(superAdminId);
    return res.status(201).json({
      success: true,
      transferId: String(transferId),
      amount: numericAmount,
      currency: 'MMK',
      countryCode: 'MM',
      balance: balance ? parseFloat(balance.balance) : null,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Slotopol funding receive error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Funding transfer failed' });
  } finally {
    connection.release();
  }
};

exports.getFundingHistory = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM slotopol_funding_ledger WHERE recipient_admin_id = ? ORDER BY created_at DESC LIMIT 100',
      [req.userId]
    );
    res.json({ success: true, funding: rows });
  } catch (error) {
    console.error('Funding history error:', error);
    res.status(500).json({ success: false, error: 'Failed to load funding history' });
  }
};
