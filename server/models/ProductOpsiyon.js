// MSSQL için ProductOpsiyon model dosyası
// Bu model doğrudan sorgu ile kullanılacak, Sequelize yok

// Gerekli bağlantı ve sql modülünü al
const { connectDB, sql } = require('../config/db');

// Opsiyon ekleme fonksiyonu
toProductOpsiyon = async (productId, opsiyonName, opsiyonPrice) => {
    const pool = await connectDB();
    // MSSQL sorgusu ile ekleme
    const result = await pool.request()
        .input('ProductID', sql.Int, productId)
        .input('OpsiyonName', sql.NVarChar, opsiyonName)
        .input('OpsiyonPrice', sql.Decimal(18,2), opsiyonPrice)
        .query(`INSERT INTO dbo.ProductOpsiyon (ProductID, OpsiyonName, OpsiyonPrice) VALUES (@ProductID, @OpsiyonName, @OpsiyonPrice)`);
    return result;
};

module.exports = {
    toProductOpsiyon
}; 