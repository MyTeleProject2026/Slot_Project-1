const pool = require('../config/database');

class ChatMessage {
  static async create(data) {
    const { userId, adminId, message, isFromUser, category = 'general' } = data;
    const [result] = await pool.query(
      `INSERT INTO chat_messages (user_id, admin_id, message, is_from_user, category) VALUES (?, ?, ?, ?, ?)`,
      [userId, adminId, message, isFromUser, category]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT cm.*, u.username as user_name, a.username as admin_name 
       FROM chat_messages cm
       LEFT JOIN users u ON cm.user_id = u.id
       LEFT JOIN users a ON cm.admin_id = a.id
       WHERE cm.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async getByUser(userId, limit = 50, offset = 0) {
    const [rows] = await pool.query(
      `SELECT cm.*, a.username as admin_name 
       FROM chat_messages cm
       LEFT JOIN users a ON cm.admin_id = a.id
       WHERE cm.user_id = ? ORDER BY cm.created_at DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return rows;
  }

  static async getByAdmin(adminId, limit = 50, offset = 0) {
    const [rows] = await pool.query(
      `SELECT cm.*, u.username as user_name 
       FROM chat_messages cm
       LEFT JOIN users u ON cm.user_id = u.id
       WHERE cm.admin_id = ? ORDER BY cm.created_at DESC LIMIT ? OFFSET ?`,
      [adminId, limit, offset]
    );
    return rows;
  }

  static async getUnread(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM chat_messages WHERE user_id = ? AND is_read = 0 AND is_from_user = 0',
      [userId]
    );
    return rows;
  }

  static async getPending() {
    const [rows] = await pool.query(
      `SELECT cm.*, u.username as user_name 
       FROM chat_messages cm
       LEFT JOIN users u ON cm.user_id = u.id
       WHERE cm.status = 'pending' AND cm.is_from_user = 1 ORDER BY cm.created_at ASC`
    );
    return rows;
  }

  static async markAsRead(id) {
    const [result] = await pool.query('UPDATE chat_messages SET is_read = 1, read_at = NOW() WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async updateStatus(id, status) {
    const [result] = await pool.query('UPDATE chat_messages SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  }

  static async getConversation(userId, adminId, limit = 50) {
    const [rows] = await pool.query(
      `SELECT * FROM chat_messages WHERE (user_id = ? AND admin_id = ?) OR (user_id = ? AND admin_id = ?)
       ORDER BY created_at ASC LIMIT ?`,
      [userId, adminId, adminId, userId, limit]
    );
    return rows;
  }

  static async getUsersWithChat() {
    const [rows] = await pool.query(
      `SELECT DISTINCT u.id, u.username, u.email, u.full_name,
              (SELECT COUNT(*) FROM chat_messages WHERE user_id = u.id AND is_read = 0 AND is_from_user = 0) as unread_count,
              (SELECT MAX(created_at) FROM chat_messages WHERE user_id = u.id) as last_message
       FROM users u INNER JOIN chat_messages cm ON u.id = cm.user_id
       WHERE u.role = 'user' ORDER BY last_message DESC`
    );
    return rows;
  }
}

module.exports = ChatMessage;
