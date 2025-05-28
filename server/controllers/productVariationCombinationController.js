const { sql, config } = require('../config/db.config');

exports.createCombinations = async (req, res) => {
  try {
    const { productId, combinations } = req.body;

    console.log('Gelen veri:', req.body); // Gelen veriyi logla

    if (!productId || !Array.isArray(combinations)) {
      console.log('Eksik veri:', productId, combinations);
      return res.status(400).json({ message: 'Eksik veri gönderildi.' });
    }

    const pool = await sql.connect(config);
    console.log('Veritabanı bağlantısı başarılı');

    for (const combo of combinations) {
      console.log('Kayıt edilecek kombinasyon:', combo);
      await pool.request()
        .input('ProductID', sql.Int, productId)
        .input('Option1ID', sql.Int, combo.option1ID)
        .input('Option2ID', sql.Int, combo.option2ID)
        .input('Price', sql.Float, combo.price)
        .input('Stock', sql.Int, combo.stock)
        .input('ImageURL', sql.NVarChar, combo.imageUrl)
        .query(`
          INSERT INTO ProductVariationCombinations
          (ProductID, Option1ID, Option2ID, Price, Stock, ImageURL)
          VALUES (@ProductID, @Option1ID, @Option2ID, @Price, @Stock, @ImageURL)
        `);
    }

    res.status(201).json({ success: true, message: 'Kombinasyonlar kaydedildi.' });
  } catch (err) {
    console.error('Kombinasyon kaydında hata:', err);
    res.status(500).json({ message: 'Kombinasyonlar kaydedilemedi.' });
  }
};