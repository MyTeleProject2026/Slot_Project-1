const pool = require('../config/database');

class Setting {
  // Get settings by category
  static async getByCategory(category) {
    const [rows] = await pool.query(
      'SELECT * FROM settings WHERE category = ?',
      [category]
    );
    return rows;
  }

  // Update or insert settings
  static async updateOrInsert(category, settings) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      for (const [key, value] of Object.entries(settings)) {
        await connection.query(
          `INSERT INTO settings (setting_key, setting_value, category, is_public) 
           VALUES (?, ?, ?, 1) 
           ON DUPLICATE KEY UPDATE setting_value = ?`,
          [key, value, category, value]
        );
      }
      await connection.commit();
      connection.release();
      return true;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  // Get all public settings
  static async getPublic() {
    const [rows] = await pool.query(
      "SELECT setting_key, setting_value FROM settings WHERE is_public = 1"
    );
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    return settings;
  }

  // ✅ Get country setting
  static async getCountry() {
    const [rows] = await pool.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'country' AND category = 'site'"
    );
    if (rows.length > 0) {
      try {
        return JSON.parse(rows[0].setting_value);
      } catch (e) { return null; }
    }
    return null;
  }

  // ✅ Set country setting
  static async setCountry(countryData) {
    await pool.query(
      `INSERT INTO settings (setting_key, setting_value, category, is_public) 
       VALUES ('country', ?, 'site', 1) 
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [JSON.stringify(countryData), JSON.stringify(countryData)]
    );
  }

  // Get a single setting by key
  static async getByKey(key) {
    const [rows] = await pool.query(
      'SELECT setting_value FROM settings WHERE setting_key = ?',
      [key]
    );
    return rows.length > 0 ? rows[0].setting_value : null;
  }

  // Update a single setting
  static async updateByKey(key, value) {
    await pool.query(
      `INSERT INTO settings (setting_key, setting_value, category, is_public) 
       VALUES (?, ?, 'general', 1) 
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [key, value, value]
    );
  }
}

module.exports = Setting;
