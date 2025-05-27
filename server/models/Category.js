const { sql, config } = require('../config/db');

// Tüm kategorileri getiren fonksiyon
exports.getAllCategories = async () => {
    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT * FROM dbo.Categories
        `;
        return result.recordset;
    } catch (error) {
        console.error('Kategori getirme hatası:', error);
        throw error;
    } finally {
        sql.close();
    }
}; 