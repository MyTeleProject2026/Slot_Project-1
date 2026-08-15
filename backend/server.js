const pool = require('./config/database');

class User {
  static async create(data) {
    const { username, email, password, fullName, phone, role = 'user', referredBy } = data;
    const [result] = await pool.query(
      `INSERT INTO users (username, email, password, full_name, phone, role, referred_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, email, password, fullName, phone, role, referredBy || null]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, username, email, full_name, phone, role, status, referral_code, created_at, last_login 
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findByReferralCode(code) {
    const [rows] = await pool.query('SELECT * FROM users WHERE referral_code = ?', [code]);
    return rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['full_name', 'phone', 'status', 'password', 'role'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }
    if (fields.length === 0) return false;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async updateLastLogin(id, ip) {
    const [result] = await pool.query(
      'UPDATE users SET last_login = NOW(), login_ip = ? WHERE id = ?',
      [ip, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getAll(filters = {}) {
    let query = 'SELECT id, username, email, full_name, phone, role, status, created_at FROM users';
    const conditions = [];
    const values = [];
    if (filters.role) { conditions.push('role = ?'); values.push(filters.role); }
    if (filters.status) { conditions.push('status = ?'); values.push(filters.status); }
    if (filters.search) {
      conditions.push('(username LIKE ? OR email LIKE ? OR full_name LIKE ?)');
      values.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    values.push(filters.limit || 50, filters.offset || 0);
    const [rows] = await pool.query(query, values);
    return rows;
  }

  static async generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code, exists = true;
    while (exists) {
      code = 'REF';
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
      const existing = await this.findByReferralCode(code);
      exists = !!existing;
    }
    return code;
  }
}

module.exports = User;
