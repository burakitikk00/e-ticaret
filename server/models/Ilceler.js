const { sql, config } = require('../config/db');

// Seçilen şehre ait ilçeleri getirir
async function getIlcelerBySehirAd(sehirAd) {
  try {
    let pool = await sql.connect(config);
    // Önce şehir adından şehir id'sini bul
    let sehirResult = await pool.request()
      .input('SehirAd', sql.NVarChar, sehirAd)
      .query('SELECT id FROM Sehirler WHERE SehirAd = @SehirAd');
    if (!sehirResult.recordset.length) {
      // Şehir bulunamazsa boş array döndür
      return [];
    }
    const sehirId = sehirResult.recordset[0].id;
    // Şehir id'sine göre ilçeleri getir
    let ilceResult = await pool.request()
      .input('SehirId', sql.Int, sehirId)
      .query('SELECT * FROM Ilceler WHERE SehirAd = @SehirId');
    return ilceResult.recordset;
  } catch (err) {
    throw err;
  }
}

module.exports = { getIlcelerBySehirAd };
