const pool = require('../config/database');

class Setting {
  static async getByCategory(category) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM settings WHERE category = ?',
        [category]
      );
      return rows;
    } catch (error) {
      console.error('Get settings by category error:', error.message);
      return [];
    }
  }

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

  static async getPublic() {
    try {
      const [rows] = await pool.query(
        "SELECT setting_key, setting_value FROM settings WHERE is_public = 1"
      );
      const settings = {};
      rows.forEach(row => {
        settings[row.setting_key] = row.setting_value;
      });
      return settings;
    } catch (error) {
      console.error('Get public settings error:', error.message);
      return {};
    }
  }
}

module.exports = Setting;
