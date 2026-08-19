// models/GameMetadata.js
// Uses the existing MySQL pool – no mongoose dependency
const pool = require('../config/database');

class GameMetadata {
  // Find all metadata (optionally with filters)
  static async find(filter = {}) {
    let query = 'SELECT * FROM game_metadata';
    const conditions = [];
    const values = [];
    if (filter.gameId) {
      conditions.push('gameId = ?');
      values.push(filter.gameId);
    }
    if (filter.isActive !== undefined) {
      conditions.push('isActive = ?');
      values.push(filter.isActive ? 1 : 0);
    }
    if (filter.provider) {
      conditions.push('provider = ?');
      values.push(filter.provider);
    }
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY `order` ASC';
    const [rows] = await pool.query(query, values);
    return rows;
  }

  // Find a single metadata entry by gameId
  static async findOne(filter) {
    if (!filter || !filter.gameId) return null;
    const [rows] = await pool.query('SELECT * FROM game_metadata WHERE gameId = ?', [filter.gameId]);
    return rows[0] || null;
  }

  // Upsert: update if exists, otherwise insert
  static async findOneAndUpdate(filter, update, options = {}) {
    const { gameId } = filter;
    if (!gameId) throw new Error('gameId is required');

    // Check if exists
    const existing = await this.findOne({ gameId });
    if (existing) {
      // Update
      const fields = Object.keys(update).filter(k => update[k] !== undefined);
      if (fields.length === 0) return existing;
      const setClause = fields.map(f => `\`${f}\` = ?`).join(', ');
      const values = fields.map(f => update[f]);
      values.push(gameId);
      await pool.query(`UPDATE game_metadata SET ${setClause}, updated_at = NOW() WHERE gameId = ?`, values);
      return this.findOne({ gameId });
    } else {
      // Insert
      const fields = ['gameId', ...Object.keys(update).filter(k => update[k] !== undefined)];
      const placeholders = fields.map(() => '?').join(', ');
      const values = fields.map(f => (f === 'gameId' ? gameId : update[f]));
      await pool.query(`INSERT INTO game_metadata (${fields.map(f => `\`${f}\``).join(', ')}) VALUES (${placeholders})`, values);
      return this.findOne({ gameId });
    }
  }

  // Alias for findOneAndUpdate (if your controller uses upsert option)
  static async updateOne(filter, update, options = {}) {
    return this.findOneAndUpdate(filter, update, options);
  }

  // Create table if not exists (run on startup)
  static async initTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS game_metadata (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gameId VARCHAR(255) NOT NULL UNIQUE,
        isActive BOOLEAN DEFAULT TRUE,
        minBet DECIMAL(15,2) DEFAULT 0.1,
        maxBet DECIMAL(15,2) DEFAULT 100,
        rtpOverride DECIMAL(10,2) DEFAULT NULL,
        difficulty ENUM('easy','medium','hard','very_hard') DEFAULT 'medium',
        \`order\` INT DEFAULT 0,
        tags JSON,
        provider VARCHAR(100) DEFAULT '',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_gameId (gameId),
        INDEX idx_provider (provider)
      )
    `;
    await pool.query(createTableSQL);
    console.log('✅ game_metadata table ready');
  }
}

module.exports = GameMetadata;
