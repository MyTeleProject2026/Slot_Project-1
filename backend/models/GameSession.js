const pool = require('../config/database');

class GameSession {
  static async create(data) {
    const { userId, slotopolGameId, clubId, gameAlias, providerName, gameName, betAmount, selectedLines, state } = data;
    const [result] = await pool.query(
      `INSERT INTO game_sessions 
       (user_id, slotopol_game_id, club_id, game_alias, provider_name, game_name, bet_amount, selected_lines, state) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, slotopolGameId, clubId || 1, gameAlias, providerName, gameName, betAmount, selectedLines, state ? JSON.stringify(state) : null]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT gs.*, u.username FROM game_sessions gs LEFT JOIN users u ON gs.user_id = u.id WHERE gs.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByUserId(userId, status = 'active') {
    const [rows] = await pool.query(
      'SELECT * FROM game_sessions WHERE user_id = ? AND status = ? ORDER BY created_at DESC',
      [userId, status]
    );
    return rows;
  }

  static async updateState(id, state) {
    const [result] = await pool.query(
      `UPDATE game_sessions SET state = ?, updated_at = NOW() WHERE id = ?`,
      [JSON.stringify(state), id]
    );
    return result.affectedRows > 0;
  }

  static async complete(id) {
    const [result] = await pool.query(
      `UPDATE game_sessions SET status = 'completed', ended_at = NOW() WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getActiveSessions(limit = 100) {
    const [rows] = await pool.query(
      `SELECT gs.*, u.username FROM game_sessions gs LEFT JOIN users u ON gs.user_id = u.id
       WHERE gs.status = 'active' ORDER BY gs.created_at DESC LIMIT ?`,
      [limit]
    );
    return rows;
  }

  static async getStats() {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as total_sessions,
              SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active_sessions,
              SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed_sessions,
              AVG(TIMESTAMPDIFF(MINUTE, created_at, ended_at)) as avg_duration
       FROM game_sessions`
    );
    return rows[0];
  }
}

module.exports = GameSession;
