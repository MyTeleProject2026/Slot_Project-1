const pool = require('../config/database');

class Transaction {
  static async create(data) {
    const { userId, type, amount, beforeBalance, afterBalance, walletType, status = 'pending', reference, description, metadata } = data;
    const [result] = await pool.query(
      `INSERT INTO user_transactions 
       (user_id, type, amount, before_balance, after_balance, wallet_type, status, reference, description, metadata) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, type, amount, beforeBalance, afterBalance, walletType, status, reference, description, metadata ? JSON.stringify(metadata) : null]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT t.*, u.username as user_name, a.username as approved_by_name 
       FROM user_transactions t
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN users a ON t.approved_by = a.id
       WHERE t.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByUserId(userId, limit = 50, offset = 0) {
    const [rows] = await pool.query(
      'SELECT * FROM user_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );
    return rows;
  }

  static async findByStatus(status, limit = 100) {
    const [rows] = await pool.query(
      `SELECT t.*, u.username as user_name 
       FROM user_transactions t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.status = ? ORDER BY t.created_at ASC LIMIT ?`,
      [status, limit]
    );
    return rows;
  }

  static async updateStatus(id, status, approvedBy = null) {
    let query = `UPDATE user_transactions SET status = ?`;
    const values = [status];
    if (approvedBy) {
      query += `, approved_by = ?, approved_at = NOW()`;
      values.push(approvedBy);
    }
    query += ` WHERE id = ?`;
    values.push(id);
    const [result] = await pool.query(query, values);
    return result.affectedRows > 0;
  }

  static async getStats(userId) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as total_transactions,
              SUM(CASE WHEN type='deposit' AND status='completed' THEN amount ELSE 0 END) as total_deposits,
              SUM(CASE WHEN type='withdraw' AND status='completed' THEN amount ELSE 0 END) as total_withdrawals,
              SUM(CASE WHEN type='bonus' AND status='completed' THEN amount ELSE 0 END) as total_bonus,
              COUNT(CASE WHEN status='pending' THEN 1 END) as pending_transactions
       FROM user_transactions WHERE user_id = ?`,
      [userId]
    );
    return rows[0];
  }
}

module.exports = Transaction;
