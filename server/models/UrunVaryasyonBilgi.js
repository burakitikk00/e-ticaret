const sql = require('mssql');
const { config } = require('../config/db.config'); // config objesini destructure ederek alıyoruz

// urunvaryasyonbilgi tablosuna kayıt ekleyen fonksiyon
async function insertUrunVaryasyonBilgi(data) {
  try {
    console.log('Veritabanı bağlantı bilgileri:', {
      server: config.server,
      database: config.database,
      user: config.user
    });

    const pool = await sql.connect(config);
    console.log('Veritabanı bağlantısı başarılı');

    // Tek satır ekleme (sadece gerekli alanlar)
    const result = await pool.request()
      .input('ProductID', sql.Int, data.ProductID)
      .input('Varyasyon1', sql.NVarChar(20), data.Varyasyon1)
      .input('varyasyon2', sql.NVarChar(20), data.Varyasyon2)
      .input('Options1', sql.NVarChar(500), data.Option1)
      .input('Options2', sql.NVarChar(500), data.Option2)
      .query(`INSERT INTO urunvaryasyonbilgi (ProductID, Varyasyon1, varyasyon2, Options1, Options2)
              OUTPUT INSERTED.*
              VALUES (@ProductID, @Varyasyon1, @varyasyon2, @Options1, @Options2)`);
    
    console.log('Kayıt başarılı:', result.recordset[0]);
    return result.recordset[0];
  } catch (err) {
    console.error('urunvaryasyonbilgi ekleme hatası:', err);
    if (err.originalError) {
      console.error('Orijinal hata:', err.originalError);
    }
    throw err;
  }
}

module.exports = { insertUrunVaryasyonBilgi }; 