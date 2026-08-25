const pool = require('../config/database');

function normalizePhone(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `95${digits.slice(1)}`;
  return digits;
}

class SlotopolPlayer {
  static async initTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS slotopol_players (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        club_id INT UNSIGNED NOT NULL DEFAULT 1,
        slotopol_uid BIGINT UNSIGNED NOT NULL,
        phone VARCHAR(32) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_slotopol_player_user_club (user_id, club_id),
        UNIQUE KEY uq_slotopol_player_uid_club (slotopol_uid, club_id),
        UNIQUE KEY uq_slotopol_player_phone_club (phone, club_id)
      )
    `);
    await pool.query('ALTER TABLE slotopol_players ADD COLUMN IF NOT EXISTS phone VARCHAR(32) NULL');
    await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS uq_slotopol_player_phone_club ON slotopol_players(phone, club_id)');
  }

  static async find(userId, clubId) {
    const [rows] = await pool.query(
      'SELECT * FROM slotopol_players WHERE user_id = ? AND club_id = ? LIMIT 1',
      [userId, clubId]
    );
    return rows[0] || null;
  }

  static async findByPhone(phone, clubId) {
    const normalized = normalizePhone(phone);
    if (!normalized) return null;
    const [rows] = await pool.query(
      'SELECT * FROM slotopol_players WHERE phone = ? AND club_id = ? LIMIT 1',
      [normalized, clubId]
    );
    return rows[0] || null;
  }

  static async setPhone(userId, clubId, phone) {
    const normalized = normalizePhone(phone);
    if (!normalized) return this.find(userId, clubId);
    await pool.query(
      'UPDATE slotopol_players SET phone = ?, updated_at = NOW() WHERE user_id = ? AND club_id = ?',
      [normalized, userId, clubId]
    );
    return this.find(userId, clubId);
  }

  static async create({ userId, clubId, slotopolUid, phone }) {
    const normalized = normalizePhone(phone);
    if (!normalized) throw new Error('Player phone number is required for Slotopol identity');
    await pool.query(
      `INSERT INTO slotopol_players (user_id, club_id, slotopol_uid, phone)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE slotopol_uid = VALUES(slotopol_uid), phone = VALUES(phone), updated_at = NOW()`,
      [userId, clubId, slotopolUid, normalized]
    );
    return this.find(userId, clubId);
  }
}

module.exports = SlotopolPlayer;
