const pool = require('../config/database');

class Wallet {
  static async create(userId) {
    const [result] = await pool.query('INSERT INTO wallets (user_id) VALUES (?)', [userId]);
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query('SELECT * FROM wallets WHERE user_id = ?', [userId]);
    return rows[0];
  }

  static async updateBalance(userId, walletType, amount) {
    const [result] = await pool.query(
      `UPDATE wallets SET ${walletType}_balance = ${walletType}_balance + ? WHERE user_id = ?`,
      [amount, userId]
    );
    return result.affectedRows > 0;
  }

  // Atomically debit the main wallet. This prevents concurrent game requests
  // from both observing the same balance and overspending the player wallet.
  static async debitMainBalance(userId, amount) {
    const debitAmount = Number(amount);
    if (!Number.isFinite(debitAmount) || debitAmount <= 0) return false;
    const [result] = await pool.query(
      'UPDATE wallets SET main_balance = main_balance - ? WHERE user_id = ? AND main_balance >= ?',
      [debitAmount, userId, debitAmount]
    );
    return result.affectedRows > 0;
  }

  static async getBalance(userId) {
    const [rows] = await pool.query(
      `SELECT main_balance, bonus_balance, commission_balance, locked_balance,
              (main_balance + bonus_balance + commission_balance) as total_balance
       FROM wallets WHERE user_id = ?`,
      [userId]
    );
    return rows[0];
  }

  static async transfer(userId, fromWallet, toWallet, amount) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      const [wallet] = await connection.query(
        `SELECT ${fromWallet}_balance FROM wallets WHERE user_id = ?`,
        [userId]
      );
      if (!wallet[0] || wallet[0][`${fromWallet}_balance`] < amount) throw new Error('Insufficient balance');
      await connection.query(
        `UPDATE wallets SET ${fromWallet}_balance = ${fromWallet}_balance - ? WHERE user_id = ?`,
        [amount, userId]
      );
      await connection.query(
        `UPDATE wallets SET ${toWallet}_balance = ${toWallet}_balance + ? WHERE user_id = ?`,
        [amount, userId]
      );
      await connection.commit();
      connection.release();
      return true;
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  }

  static async freezeBalance(userId, amount) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      const [wallet] = await connection.query('SELECT main_balance FROM wallets WHERE user_id = ?', [userId]);
      if (!wallet[0] || wallet[0].main_balance < amount) throw new Error('Insufficient balance');
      await connection.query(
        `UPDATE wallets SET main_balance = main_balance - ?, locked_balance = locked_balance + ? WHERE user_id = ?`,
        [amount, amount, userId]
      );
      await connection.commit();
      connection.release();
      return true;
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  }

  static async unlockBalance(userId, amount) {
    const [result] = await pool.query(
      `UPDATE wallets SET main_balance = main_balance + ?, locked_balance = locked_balance - ?
       WHERE user_id = ? AND locked_balance >= ?`,
      [amount, amount, userId, amount]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Wallet;