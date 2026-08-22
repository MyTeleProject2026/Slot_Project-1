const pool = require('../config/database');

class Game {
  static async create(data) {
    const { providerId, providerName, gameCode, name, category, rtp, maxMultiplier, imageUrl, thumbnailUrl, isHot, isNew, playUrl, demoUrl } = data;
    const [result] = await pool.query(
      `INSERT INTO games 
       (provider_id, provider_name, game_code, name, category, rtp, max_multiplier, image_url, thumbnail_url, is_hot, is_new, play_url, demo_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [providerId, providerName, gameCode, name, category, rtp, maxMultiplier, imageUrl, thumbnailUrl, isHot || 0, isNew || 0, playUrl, demoUrl]
    );
    if (providerId) {
      await pool.query('UPDATE game_providers SET game_count = game_count + 1 WHERE id = ?', [providerId]);
    }
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT g.*, gp.name as provider_name, gp.logo_url as provider_logo 
       FROM games g LEFT JOIN game_providers gp ON g.provider_id = gp.id WHERE g.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByName(name) {
    const [rows] = await pool.query('SELECT * FROM games WHERE name = ?', [name]);
    return rows[0];
  }

  static async findByProvider(providerId) {
    const [rows] = await pool.query(
      'SELECT * FROM games WHERE provider_id = ? AND status = "active" ORDER BY sort_order ASC',
      [providerId]
    );
    return rows;
  }

  static async findByCategory(category) {
    const [rows] = await pool.query(
      'SELECT * FROM games WHERE category = ? AND status = "active" ORDER BY sort_order ASC',
      [category]
    );
    return rows;
  }

  static async search(query) {
    const [rows] = await pool.query(
      `SELECT g.*, gp.name as provider_name 
       FROM games g LEFT JOIN game_providers gp ON g.provider_id = gp.id
       WHERE g.status = 'active' AND (g.name LIKE ? OR g.provider_name LIKE ? OR g.tags LIKE ?)
       ORDER BY g.is_hot DESC, g.sort_order ASC LIMIT 50`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    return rows;
  }

  static async getHotGames(limit = 20) {
    const [rows] = await pool.query(
      `SELECT g.*, gp.name as provider_name, gp.logo_url as provider_logo 
       FROM games g LEFT JOIN game_providers gp ON g.provider_id = gp.id
       WHERE g.is_hot = 1 AND g.status = 'active' ORDER BY g.sort_order ASC LIMIT ?`,
      [limit]
    );
    return rows;
  }

  static async getNewGames(limit = 20) {
    const [rows] = await pool.query(
      `SELECT g.*, gp.name as provider_name, gp.logo_url as provider_logo 
       FROM games g LEFT JOIN game_providers gp ON g.provider_id = gp.id
       WHERE g.is_new = 1 AND g.status = 'active' ORDER BY g.created_at DESC LIMIT ?`,
      [limit]
    );
    return rows;
  }

  static async updateRTP(gameId, rtpAdjustment, adminId) {
    const [result] = await pool.query(
      `INSERT INTO game_controls (game_id, rtp_adjustment, adjusted_by, adjusted_at) 
       VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE rtp_adjustment = VALUES(rtp_adjustment), adjusted_by = VALUES(adjusted_by), adjusted_at = NOW()`,
      [gameId, rtpAdjustment, adminId]
    );
    return result.affectedRows > 0;
  }

  static async incrementPlays(gameId) {
    const [result] = await pool.query('UPDATE games SET total_plays = total_plays + 1 WHERE id = ?', [gameId]);
    return result.affectedRows > 0;
  }

  static async incrementWins(gameId) {
    const [result] = await pool.query('UPDATE games SET total_wins = total_wins + 1 WHERE id = ?', [gameId]);
    return result.affectedRows > 0;
  }

  // ✅ ADDED: Get all games
  static async getAll() {
    const [rows] = await pool.query(
      'SELECT * FROM games ORDER BY sort_order ASC'
    );
    return rows;
  }

  // ✅ ADDED: Update a game
  static async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = [
      'provider_id', 'provider_name', 'game_code', 'name', 'category',
      'sub_category', 'image_url', 'thumbnail_url', 'background_url',
      'rtp', 'max_multiplier', 'min_bet', 'max_bet', 'volatility',
      'is_hot', 'is_new', 'is_popular', 'play_url', 'demo_url',
      'mobile_play_url', 'tags', 'features', 'theme', 'sort_order', 'status'
    ];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }
    if (fields.length === 0) return false;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE games SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // ✅ ADDED: Delete a game
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM games WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Game;
