const pool = require('../config/database');

class SlotopolPlayer {
  static async initTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS slotopol_players (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        club_id INT UNSIGNED NOT NULL DEFAULT 1,
        slotopol_uid BIGINT UNSIGNED NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_slotopol_player_user_club (user_id, club_id),
        UNIQUE KEY uq_slotopol_player_uid_club (slotopol_uid, club_id),
        INDEX idx_slotopol_player_email (email)
      )
    `);
  }

  static async find(userId, clubId) {
    const [rows] = await pool.query(
      'SELECT * FROM slotopol_players WHERE user_id = ? AND club_id = ? LIMIT 1',
      [userId, clubId]
    );
    return rows[0] || null;
  }

  static async findByEmail(email, clubId) {
    const [rows] = await pool.query(
      'SELECT * FROM slotopol_players WHERE email = ? AND club_id = ? LIMIT 1',
      [email, clubId]
    );
    return rows[0] || null;
  }

  static async create({ userId, clubId, slotopolUid, email }) {
    await pool.query(
      `INSERT INTO slotopol_players (user_id, club_id, slotopol_uid, email)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE slotopol_uid = VALUES(slotopol_uid), email = VALUES(email), updated_at = NOW()`,
      [userId, clubId, slotopolUid, email]
    );
    return this.find(userId, clubId);
  }
}

module.exports = SlotopolPlayer;
