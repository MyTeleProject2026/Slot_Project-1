const pool = require('../config/database');

class Setting {
  static async getByCategory(category) {
    const [rows] = await pool.query(
      'SELECT * FROM settings WHERE category = ?',
      [category]
    );
    return rows;
  }

  static async updateOrInsert(category, settings) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      for (const [key, value] of Object.entries(settings)) {
        await connection.query(
          `INSERT INTO settings (setting_key, setting_value, category) 
           VALUES (?, ?, ?) 
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
}

module.exports = Setting;
