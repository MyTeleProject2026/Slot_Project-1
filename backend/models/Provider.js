const pool = require('../config/database');

class Provider {
  static async create(data) {
    const { name, slug, logoUrl, description, website } = data;
    const [result] = await pool.query(
      `INSERT INTO game_providers (name, slug, logo_url, description, website) VALUES (?, ?, ?, ?, ?)`,
      [name, slug, logoUrl, description, website]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM game_providers WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByName(name) {
    const [rows] = await pool.query('SELECT * FROM game_providers WHERE name = ?', [name]);
    return rows[0];
  }

  static async getAll(activeOnly = true) {
    let query = 'SELECT * FROM game_providers';
    if (activeOnly) query += ' WHERE is_active = 1';
    query += ' ORDER BY sort_order ASC, name ASC';
    const [rows] = await pool.query(query);
    return rows;
  }

  static async getWithGameCount() {
    const [rows] = await pool.query(
      `SELECT gp.*, COUNT(g.id) as actual_game_count 
       FROM game_providers gp LEFT JOIN games g ON gp.id = g.provider_id AND g.status = 'active'
       WHERE gp.is_active = 1 GROUP BY gp.id ORDER BY gp.sort_order ASC`
    );
    return rows;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['name', 'logo_url', 'description', 'is_active', 'sort_order'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }
    if (fields.length === 0) return false;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE game_providers SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async updateGameCount(providerId) {
    const [result] = await pool.query(
      `UPDATE game_providers SET game_count = (SELECT COUNT(*) FROM games WHERE provider_id = ? AND status = 'active') WHERE id = ?`,
      [providerId, providerId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Provider;
