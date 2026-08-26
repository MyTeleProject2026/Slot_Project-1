const pool = require('../config/database');

class Promotion {
  static async create(data) {
    const { title, titleTh, titleMy, description, descriptionTh, descriptionMy, type, imageUrl, bannerUrl, terms, termsTh, termsMy, bonusType, bonusValue, maxBonus, minDeposit, rollover, startDate, endDate, claimLimit, isFeatured, countryCode = 'MM', currency = 'MMK', language = 'my' } = data;
    const [result] = await pool.query(
      `INSERT INTO promotions
       (title, title_th, title_my, description, description_th, description_my, type, image_url, banner_url, terms, terms_th, terms_my, bonus_type, bonus_value, max_bonus, min_deposit, rollover, start_date, end_date, claim_limit, is_featured, country_code, currency, language)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, titleTh || data.title_th || null, titleMy || data.title_my || null, description, descriptionTh || data.description_th || null, descriptionMy || data.description_my || null, type, imageUrl || data.image_url || null, bannerUrl || data.banner_url || null, terms || null, termsTh || data.terms_th || null, termsMy || data.terms_my || null, bonusType || data.bonus_type || 'percentage', bonusValue ?? data.bonus_value ?? 0, maxBonus ?? data.max_bonus ?? 0, minDeposit ?? data.min_deposit ?? 0, rollover ?? 0, startDate || data.start_date, endDate || data.end_date, claimLimit ?? data.claim_limit ?? 0, isFeatured ?? data.is_featured ?? 0, String(countryCode).toUpperCase(), String(currency).toUpperCase(), language || 'my']
    );
    return result.insertId;
  }

  static async findById(id) { const [rows] = await pool.query('SELECT * FROM promotions WHERE id = ?', [id]); return rows[0]; }

  static async getActive(countryCode = 'MM', currency = 'MMK') {
    const now = new Date();
    const [rows] = await pool.query(
      `SELECT * FROM promotions WHERE is_active = 1 AND start_date <= ? AND end_date >= ? AND country_code = ? AND currency = ? ORDER BY is_featured DESC, sort_order ASC, created_at DESC`,
      [now, now, String(countryCode).toUpperCase(), String(currency).toUpperCase()]
    );
    return rows;
  }

  static async getFeatured(limit = 5, countryCode = 'MM', currency = 'MMK') {
    const now = new Date();
    const [rows] = await pool.query(
      `SELECT * FROM promotions WHERE is_active = 1 AND is_featured = 1 AND start_date <= ? AND end_date >= ? AND country_code = ? AND currency = ? ORDER BY sort_order ASC LIMIT ?`,
      [now, now, String(countryCode).toUpperCase(), String(currency).toUpperCase(), Number(limit)]
    );
    return rows;
  }

  static async getByType(type, countryCode = 'MM', currency = 'MMK') {
    const now = new Date();
    const [rows] = await pool.query(`SELECT * FROM promotions WHERE is_active = 1 AND type = ? AND start_date <= ? AND end_date >= ? AND country_code = ? AND currency = ? ORDER BY sort_order ASC`, [type, now, now, String(countryCode).toUpperCase(), String(currency).toUpperCase()]);
    return rows;
  }

  static async getAll(countryCode = null, currency = null) {
    let sql = 'SELECT * FROM promotions'; const values = []; const where = [];
    if (countryCode) { where.push('country_code = ?'); values.push(String(countryCode).toUpperCase()); }
    if (currency) { where.push('currency = ?'); values.push(String(currency).toUpperCase()); }
    if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
    sql += ' ORDER BY sort_order ASC, created_at DESC';
    const [rows] = await pool.query(sql, values); return rows;
  }

  static async update(id, data) {
    const fields = []; const values = [];
    const allowed = ['title','title_th','title_my','description','description_th','description_my','type','image_url','banner_url','terms','terms_th','terms_my','bonus_type','bonus_value','max_bonus','min_deposit','rollover','start_date','end_date','claim_limit','is_featured','is_active','country_code','currency','language'];
    for (const key of allowed) if (data[key] !== undefined) { fields.push(`${key} = ?`); values.push(data[key]); }
    if (!fields.length) return false; values.push(id);
    const [result] = await pool.query(`UPDATE promotions SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, values); return result.affectedRows > 0;
  }
  static async incrementClaimed(id) { const [result] = await pool.query('UPDATE promotions SET claimed_count = claimed_count + 1 WHERE id = ?', [id]); return result.affectedRows > 0; }
  static async delete(id) { const [result] = await pool.query('DELETE FROM promotions WHERE id = ?', [id]); return result.affectedRows > 0; }
}
module.exports = Promotion;
