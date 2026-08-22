const pool = require('../config/database');

class AdminActivityLog {
  static async create(data) {
    const { adminId, action, targetType, targetId, description, metadata } = data;
    const [result] = await pool.query(
      `INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, description, metadata) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [adminId, action, targetType, targetId, description, metadata ? JSON.stringify(metadata) : null]
    );
    return result.insertId;
  }

  static async findByAdminId(adminId, limit = 100) {
    const [rows] = await pool.query(
      `SELECT al.*, u.username as admin_name 
       FROM admin_activity_log al LEFT JOIN users u ON al.admin_id = u.id
       WHERE al.admin_id = ? ORDER BY al.created_at DESC LIMIT ?`,
      [adminId, limit]
    );
    return rows;
  }

  static async findByAction(action, limit = 100) {
    const [rows] = await pool.query(
      `SELECT al.*, u.username as admin_name 
       FROM admin_activity_log al LEFT JOIN users u ON al.admin_id = u.id
       WHERE al.action = ? ORDER BY al.created_at DESC LIMIT ?`,
      [action, limit]
    );
    return rows;
  }

  static async findByTarget(targetType, targetId) {
    const [rows] = await pool.query(
      `SELECT al.*, u.username as admin_name 
       FROM admin_activity_log al LEFT JOIN users u ON al.admin_id = u.id
       WHERE al.target_type = ? AND al.target_id = ? ORDER BY al.created_at DESC`,
      [targetType, targetId]
    );
    return rows;
  }

  static async getStats() {
    const [rows] = await pool.query(
      `SELECT action, COUNT(*) as count, DATE(created_at) as date 
       FROM admin_activity_log GROUP BY action, DATE(created_at) ORDER BY date DESC, count DESC`
    );
    return rows;
  }
}

module.exports = AdminActivityLog;
