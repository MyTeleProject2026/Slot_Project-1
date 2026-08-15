const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Game = require('../models/Game');
const pool = require('../config/database');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.getAll(req.query);
    res.json({ success: true, users });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const wallet = await Wallet.findByUserId(req.params.id);
    const transactions = await Transaction.findByUserId(req.params.id, 20);
    res.json({ success: true, user, wallet, transactions });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    await User.update(id, { status });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.getTransactions = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const [rows] = await pool.query('SELECT * FROM user_transactions ORDER BY created_at DESC LIMIT ? OFFSET ?', [parseInt(limit), parseInt(offset)]);
    res.json({ success: true, transactions: rows });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.approveTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const tx = await Transaction.findById(id);
    if (!tx || tx.status !== 'pending') return res.status(400).json({ success: false, error: 'Invalid' });
    await Transaction.updateStatus(id, 'completed', req.userId);
    if (tx.type === 'deposit') {
      await Wallet.updateBalance(tx.user_id, 'main', tx.amount);
    } else if (tx.type === 'withdraw') {
      await Wallet.updateBalance(tx.user_id, 'main', -tx.amount);
    }
    res.json({ success: true, message: 'Approved' });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.rejectTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await Transaction.updateStatus(id, 'rejected', req.userId);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};

exports.adjustGameRTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { rtpAdjustment } = req.body;
    await Game.updateRTP(id, rtpAdjustment, req.userId);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
};
