const pool = require('../config/database');

class AdminBalance {
  static async ensureTable(connection = pool) {
    await connection.query(`CREATE TABLE IF NOT EXISTS admin_balances (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      admin_id BIGINT UNSIGNED NOT NULL UNIQUE,
      role VARCHAR(32) NOT NULL,
      balance DECIMAL(24,2) NOT NULL DEFAULT 0,
      frozen_balance DECIMAL(24,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_admin_balances_role (role)
    )`);

    // Super-admin/employee accounts configured through environment variables are
    // virtual administrative identities, not player rows in `users`. Older
    // deployments created an FK from admin_balances.admin_id -> users.id, which
    // makes the virtual IDs (99991, etc.) impossible to initialize. Remove only
    // that legacy FK when it exists; the application still validates admin roles
    // before allowing balance operations.
    const [constraints] = await connection.query(
      `SELECT CONSTRAINT_NAME
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'admin_balances'
         AND COLUMN_NAME = 'admin_id'
         AND REFERENCED_TABLE_NAME = 'users'`
    );
    for (const row of constraints) {
      const name = String(row.CONSTRAINT_NAME).replace(/`/g, '');
      await connection.query(`ALTER TABLE admin_balances DROP FOREIGN KEY \`${name}\``);
    }
  }

  static async create(adminId, role, connection = pool) {
    await this.ensureTable(connection);
    await connection.query(
      'INSERT INTO admin_balances (admin_id, role) VALUES (?, ?) ON DUPLICATE KEY UPDATE role = VALUES(role)',
      [adminId, role]
    );
    return adminId;
  }

  static async ensure(adminId, role) {
    return this.create(adminId, role);
  }

  static async findByAdminId(adminId) {
    await this.ensureTable();
    const [rows] = await pool.query('SELECT * FROM admin_balances WHERE admin_id = ?', [adminId]);
    return rows[0];
  }

  static async updateBalance(adminId, amount) {
    await this.ensureTable();
    const [result] = await pool.query(
      `UPDATE admin_balances SET balance = balance + ?, updated_at = NOW() WHERE admin_id = ?`,
      [amount, adminId]
    );
    return result.affectedRows > 0;
  }

  static async transferToAdmin(fromAdminId, toAdminId, amount) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) throw new Error('Amount must be greater than zero');
    await this.ensureTable();
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      const [sender] = await connection.query('SELECT balance FROM admin_balances WHERE admin_id = ? FOR UPDATE', [fromAdminId]);
      const [receiver] = await connection.query('SELECT balance FROM admin_balances WHERE admin_id = ? FOR UPDATE', [toAdminId]);
      if (!sender[0]) throw new Error('Source admin balance not found');
      if (!receiver[0]) throw new Error('Destination admin balance not found');
      if (Number(sender[0].balance) < numericAmount) throw new Error('Insufficient admin balance');
      await connection.query('UPDATE admin_balances SET balance = balance - ?, updated_at = NOW() WHERE admin_id = ?', [numericAmount, fromAdminId]);
      await connection.query('UPDATE admin_balances SET balance = balance + ?, updated_at = NOW() WHERE admin_id = ?', [numericAmount, toAdminId]);
      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async freezeBalance(adminId, amount) {
    await this.ensureTable();
    const [result] = await pool.query(
      `UPDATE admin_balances SET balance = balance - ?, frozen_balance = frozen_balance + ?
       WHERE admin_id = ? AND balance >= ?`,
      [amount, amount, adminId, amount]
    );
    return result.affectedRows > 0;
  }

  static async getAdminStats(role) {
    await this.ensureTable();
    const [rows] = await pool.query(
      `SELECT COUNT(*) as total_admins, COALESCE(SUM(balance), 0) as total_balance, COALESCE(SUM(frozen_balance), 0) as total_frozen
       FROM admin_balances WHERE role = ?`,
      [role]
    );
    return rows[0];
  }
}

module.exports = AdminBalance;
