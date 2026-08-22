const pool = require('../config/database');

class BankAccount {
  static async create(data) {
    const { userId, bankName, accountName, accountNumber, bankCode, isDefault } = data;
    const [result] = await pool.query(
      `INSERT INTO bank_accounts (user_id, bank_name, account_name, account_number, bank_code, is_default) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, bankName, accountName, accountNumber, bankCode, isDefault || 0]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM bank_accounts WHERE user_id = ? ORDER BY is_default DESC',
      [userId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM bank_accounts WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['bank_name', 'account_name', 'account_number', 'bank_code', 'is_default'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }
    if (fields.length === 0) return false;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE bank_accounts SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM bank_accounts WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async setDefault(userId, id) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      await connection.query('UPDATE bank_accounts SET is_default = 0 WHERE user_id = ?', [userId]);
      await connection.query('UPDATE bank_accounts SET is_default = 1 WHERE id = ? AND user_id = ?', [id, userId]);
      await connection.commit();
      connection.release();
      return true;
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  }
}

module.exports = BankAccount;
