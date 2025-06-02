const { sql, config } = require('../config/db');

// Tüm şehirleri getirir
async function getAllSehirler() {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query('SELECT * FROM Sehirler');
    return result.recordset;
  } catch (err) {
    throw err;
  }
}

module.exports = { getAllSehirler };
