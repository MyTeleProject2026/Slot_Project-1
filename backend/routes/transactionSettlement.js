const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const Wallet = require('../models/Wallet');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN));

function idOf(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

router.get('/pending', async (req, res) => {
  try {
    const type = String(req.query.type || '').trim().toLowerCase();
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
    const params = [];
    let sql = "SELECT t.*, u.username AS user_name FROM user_transactions t LEFT JOIN users u ON u.id=t.user_id WHERE t.status='pending' AND t.type IN ('deposit','withdraw')";
    if (type === 'deposit' || type === 'withdraw') { sql += ' AND t.type=?'; params.push(type); }
    sql += ' ORDER BY t.created_at ASC LIMIT ?';
    params.push(limit);
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, transactions: rows });
  } catch (error) {
    console.error('List pending transactions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pending transactions' });
  }
});

router.put('/:id/settle', async (req, res) => {
  const id = idOf(req.params.id);
  const status = String(req.body.status || '').trim().toLowerCase();
  if (!id || !['completed', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Valid transaction id and status (completed or rejected) are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query('SELECT * FROM user_transactions WHERE id=? FOR UPDATE', [id]);
    const tx = rows[0];
    if (!tx) { await connection.rollback(); return res.status(404).json({ success: false, error: 'Transaction not found' }); }
    if (tx.status !== 'pending') { await connection.rollback(); return res.status(409).json({ success: false, error: 'Transaction is already settled' }); }
    if (!['deposit', 'withdraw'].includes(tx.type)) { await connection.rollback(); return res.status(400).json({ success: false, error: 'Unsupported transaction type' }); }

    const amount = Number(tx.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid transaction amount');

    const [walletRows] = await connection.query('SELECT main_balance FROM wallets WHERE user_id=? FOR UPDATE', [tx.user_id]);
    if (!walletRows[0]) throw new Error('User wallet not found');

    const before = Number(walletRows[0].main_balance) || 0;
    let after = before;

    if (status === 'completed' && tx.type === 'deposit') {
      await Wallet.updateBalance(tx.user_id, 'main', amount, connection);
      after = before + amount;
    }
    if (status === 'completed' && tx.type === 'withdraw') {
      const debited = await Wallet.debitMainBalance(tx.user_id, amount, connection);
      if (!debited) { await connection.rollback(); return res.status(409).json({ success: false, error: 'Insufficient current balance to complete withdrawal' }); }
      after = before - amount;
    }

    const [result] = await connection.query(
      "UPDATE user_transactions SET status=?, approved_by=?, approved_at=NOW(), before_balance=?, after_balance=? WHERE id=? AND status='pending'",
      [status, req.userId, before, after, id]
    );
    if (!result.affectedRows) { await connection.rollback(); return res.status(409).json({ success: false, error: 'Transaction was updated by another request' }); }

    await connection.commit();
    res.json({ success: true, transaction: { id, type: tx.type, status, amount, beforeBalance: before, afterBalance: after } });
  } catch (error) {
    await connection.rollback();
    console.error('Settle transaction error:', error);
    res.status(500).json({ success: false, error: 'Transaction settlement failed' });
  } finally {
    connection.release();
  }
});

module.exports = router;
