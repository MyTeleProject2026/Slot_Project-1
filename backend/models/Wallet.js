const pool = require('../config/database');

class Wallet {
  static async create(userId, connection = pool) {
    const [result] = await connection.query('INSERT INTO wallets (user_id) VALUES (?)', [userId]);
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query('SELECT * FROM wallets WHERE user_id = ?', [userId]);
    return rows[0];
  }

  static async updateBalance(userId, walletType, amount, connection = pool) {
    const allowedTypes = new Set(['main', 'bonus', 'commission', 'locked']);
    if (!allowedTypes.has(walletType)) throw new Error('Invalid wallet type');
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) throw new Error('Invalid balance amount');
    const [result] = await connection.query(
      `UPDATE wallets SET ${walletType}_balance = ${walletType}_balance + ? WHERE user_id = ?`,
      [numericAmount, userId]
    );
    return result.affectedRows > 0;
  }

  static async debitMainBalance(userId, amount, connection = pool) {
    const debitAmount = Number(amount);
    if (!Number.isFinite(debitAmount) || debitAmount <= 0) return false;
    const [result] = await connection.query(
      'UPDATE wallets SET main_balance = main_balance - ? WHERE user_id = ? AND main_balance >= ?',
      [debitAmount, userId, debitAmount]
    );
    return result.affectedRows > 0;
  }

  static async getBalance(userId) {
    const [rows] = await pool.query(
      `SELECT main_balance, bonus_balance, commission_balance, locked_balance,
              (main_balance + bonus_balance + commission_balance) as total_balance
       FROM wallets WHERE user_id = ?`, [userId]
    );
    return rows[0];
  }

  static async transfer(userId, fromWallet, toWallet, amount) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      const allowed = new Set(['main', 'bonus', 'commission', 'locked']);
      if (!allowed.has(fromWallet) || !allowed.has(toWallet)) throw new Error('Invalid wallet type');
      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) throw new Error('Amount must be greater than zero');
      const [wallet] = await connection.query(`SELECT ${fromWallet}_balance FROM wallets WHERE user_id = ? FOR UPDATE`, [userId]);
      if (!wallet[0] || Number(wallet[0][`${fromWallet}_balance`]) < numericAmount) throw new Error('Insufficient balance');
      await connection.query(`UPDATE wallets SET ${fromWallet}_balance = ${fromWallet}_balance - ? WHERE user_id = ?`, [numericAmount, userId]);
      await connection.query(`UPDATE wallets SET ${toWallet}_balance = ${toWallet}_balance + ? WHERE user_id = ?`, [numericAmount, userId]);
      await connection.commit();
      return true;
    } catch (err) { await connection.rollback(); throw err; }
    finally { connection.release(); }
  }

  static async freezeBalance(userId, amount) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) throw new Error('Amount must be greater than zero');
      const [wallet] = await connection.query('SELECT main_balance FROM wallets WHERE user_id = ? FOR UPDATE', [userId]);
      if (!wallet[0] || Number(wallet[0].main_balance) < numericAmount) throw new Error('Insufficient balance');
      await connection.query(`UPDATE wallets SET main_balance = main_balance - ?, locked_balance = locked_balance + ? WHERE user_id = ?`, [numericAmount, numericAmount, userId]);
      await connection.commit();
      return true;
    } catch (err) { await connection.rollback(); throw err; }
    finally { connection.release(); }
  }

  static async unlockBalance(userId, amount) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return false;
    const [result] = await pool.query(
      `UPDATE wallets SET main_balance = main_balance + ?, locked_balance = locked_balance - ? WHERE user_id = ? AND locked_balance >= ?`,
      [numericAmount, numericAmount, userId, numericAmount]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Wallet;
