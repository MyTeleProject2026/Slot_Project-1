const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

exports.getBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findByUserId(req.userId);
    if (!wallet) return res.status(404).json({ success: false, error: 'Wallet not found' });
    res.json({ success: true, balance: {
      main: parseFloat(wallet.main_balance),
      bonus: parseFloat(wallet.bonus_balance),
      commission: parseFloat(wallet.commission_balance),
      locked: parseFloat(wallet.locked_balance),
      total: parseFloat(wallet.main_balance) + parseFloat(wallet.bonus_balance) + parseFloat(wallet.commission_balance)
    } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch balance' });
  }
};

exports.requestDeposit = async (req, res) => {
  try {
    const { amount, paymentMethod, bankAccountId } = req.body;
    const wallet = await Wallet.findByUserId(req.userId);
    if (!wallet) return res.status(404).json({ success: false, error: 'Wallet not found' });
    const before = parseFloat(wallet.main_balance);
    const txId = await Transaction.create({
      userId: req.userId,
      type: 'deposit',
      amount,
      beforeBalance: before,
      afterBalance: before,
      walletType: 'main',
      status: 'pending',
      description: `Deposit via ${paymentMethod}`,
      metadata: { paymentMethod, bankAccountId }
    });
    res.json({ success: true, transactionId: txId, message: 'Deposit request submitted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Deposit request failed' });
  }
};

exports.requestWithdraw = async (req, res) => {
  try {
    const { amount, bankAccountId } = req.body;
    const wallet = await Wallet.findByUserId(req.userId);
    if (!wallet) return res.status(404).json({ success: false, error: 'Wallet not found' });
    const current = parseFloat(wallet.main_balance);
    if (current < amount) return res.status(400).json({ success: false, error: 'Insufficient balance' });
    if (amount < 500) return res.status(400).json({ success: false, error: 'Minimum withdraw 500 THB' });
    const txId = await Transaction.create({
      userId: req.userId,
      type: 'withdraw',
      amount,
      beforeBalance: current,
      afterBalance: current,
      walletType: 'main',
      status: 'pending',
      description: `Withdraw to bank ${bankAccountId}`,
      metadata: { bankAccountId }
    });
    res.json({ success: true, transactionId: txId, message: 'Withdraw request submitted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Withdraw request failed' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const transactions = await Transaction.findByUserId(req.userId, parseInt(limit), parseInt(offset));
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
};

exports.getBankAccounts = async (req, res) => {
  try {
    const pool = require('../config/database');
    const [rows] = await pool.query('SELECT * FROM bank_accounts WHERE user_id = ? ORDER BY is_default DESC', [req.userId]);
    res.json({ success: true, bankAccounts: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch bank accounts' });
  }
};

exports.addBankAccount = async (req, res) => {
  try {
    const { bankName, accountName, accountNumber, bankCode, isDefault } = req.body;
    const pool = require('../config/database');
    const [existing] = await pool.query('SELECT id FROM bank_accounts WHERE user_id = ? AND account_number = ?', [req.userId, accountNumber]);
    if (existing.length) return res.status(400).json({ success: false, error: 'Account already exists' });
    if (isDefault) {
      await pool.query('UPDATE bank_accounts SET is_default = 0 WHERE user_id = ?', [req.userId]);
    }
    const [result] = await pool.query(
      'INSERT INTO bank_accounts (user_id, bank_name, account_name, account_number, bank_code, is_default) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, bankName, accountName, accountNumber, bankCode, isDefault || false]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add bank account' });
  }
};

exports.updateBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { bankName, accountName, accountNumber, bankCode, isDefault } = req.body;
    const pool = require('../config/database');
    const [account] = await pool.query('SELECT * FROM bank_accounts WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!account.length) return res.status(404).json({ success: false, error: 'Account not found' });
    if (isDefault) {
      await pool.query('UPDATE bank_accounts SET is_default = 0 WHERE user_id = ? AND id != ?', [req.userId, id]);
    }
    await pool.query(
      'UPDATE bank_accounts SET bank_name = ?, account_name = ?, account_number = ?, bank_code = ?, is_default = ? WHERE id = ? AND user_id = ?',
      [bankName, accountName, accountNumber, bankCode, isDefault || false, id, req.userId]
    );
    res.json({ success: true, message: 'Updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Update failed' });
  }
};

exports.deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = require('../config/database');
    const [result] = await pool.query('DELETE FROM bank_accounts WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Account not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Delete failed' });
  }
};
