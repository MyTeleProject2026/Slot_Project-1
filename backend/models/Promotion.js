const pool = require('../config/database');

class Promotion {
  static async create(data) {
    const { title, titleTh, description, descriptionTh, type, imageUrl, bannerUrl, terms, termsTh, bonusType, bonusValue, maxBonus, minDeposit, rollover, startDate, endDate, claimLimit, isFeatured } = data;
    const [result] = await pool.query(
      `INSERT INTO promotions 
       (title, title_th, description, description_th, type, image_url, banner_url, terms, terms_th, bonus_type, bonus_value, max_bonus, min_deposit, rollover, start_date, end_date, claim_limit, is_featured) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, titleTh, description, descriptionTh, type, imageUrl, bannerUrl, terms, termsTh, bonusType, bonusValue, maxBonus, minDeposit, rollover, startDate, endDate, claimLimit, isFeatured || 0]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM promotions WHERE id = ?', [id]);
    return rows[0];
  }

  static async getActive() {
    const now = new Date().toISOString();
    const [rows] = await pool.query(
      `SELECT * FROM promotions WHERE is_active = 1 AND start_date <= ? AND end_date >= ? 
       ORDER BY is_featured DESC, sort_order ASC, created_at DESC`,
      [now, now]
    );
    return rows;
  }

  static async getFeatured(limit = 5) {
    const now = new Date().toISOString();
    const [rows] = await pool.query(
      `SELECT * FROM promotions WHERE is_active = 1 AND is_featured = 1 AND start_date <= ? AND end_date >= ? 
       ORDER BY sort_order ASC LIMIT ?`,
      [now, now, limit]
    );
    return rows;
  }

  static async getByType(type) {
    const now = new Date().toISOString();
    const [rows] = await pool.query(
      `SELECT * FROM promotions WHERE is_active = 1 AND type = ? AND start_date <= ? AND end_date >= ? 
       ORDER BY sort_order ASC`,
      [type, now, now]
    );
    return rows;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = ['title', 'title_th', 'description', 'description_th', 'type', 'image_url', 'banner_url', 'terms', 'terms_th', 'bonus_type', 'bonus_value', 'max_bonus', 'min_deposit', 'rollover', 'start_date', 'end_date', 'claim_limit', 'is_featured', 'is_active'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }
    if (fields.length === 0) return false;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE promotions SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async incrementClaimed(id) {
    const [result] = await pool.query('UPDATE promotions SET claimed_count = claimed_count + 1 WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM promotions WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Promotion;
