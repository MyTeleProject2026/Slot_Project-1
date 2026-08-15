const pool = require('../config/database');

class AdminBalance {
  static async create(adminId, role) {
    const [result] = await pool.query(
      'INSERT INTO admin_balances (admin_id, role) VALUES (?, ?)',
      [adminId, role]
    );
    return result.insertId;
  }

  static async findByAdminId(adminId) {
    const [rows] = await pool.query('SELECT * FROM admin_balances WHERE admin_id = ?', [adminId]);
    return rows[0];
  }

  static async updateBalance(adminId, amount) {
    const [result] = await pool.query(
      `UPDATE admin_balances SET balance = balance + ?, updated_at = NOW() WHERE admin_id = ?`,
      [amount, adminId]
    );
    return result.affectedRows > 0;
  }

  static async transferToAdmin(fromAdminId, toAdminId, amount) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      const [sender] = await connection.query('SELECT balance FROM admin_balances WHERE admin_id = ?', [fromAdminId]);
      if (!sender[0] || sender[0].balance < amount) throw new Error('Insufficient admin balance');
      await connection.query('UPDATE admin_balances SET balance = balance - ? WHERE admin_id = ?', [amount, fromAdminId]);
      await connection.query('UPDATE admin_balances SET balance = balance + ? WHERE admin_id = ?', [amount, toAdminId]);
      await connection.commit();
      connection.release();
      return true;
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  }

  static async freezeBalance(adminId, amount) {
    const [result] = await pool.query(
      `UPDATE admin_balances SET balance = balance - ?, frozen_balance = frozen_balance + ? 
       WHERE admin_id = ? AND balance >= ?`,
      [amount, amount, adminId, amount]
    );
    return result.affectedRows > 0;
  }

  static async getAdminStats(role) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as total_admins, SUM(balance) as total_balance, SUM(frozen_balance) as total_frozen 
       FROM admin_balances WHERE role = ?`,
      [role]
    );
    return rows[0];
  }
}

module.exports = AdminBalance;
