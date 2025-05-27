const sql = require('mssql');
const { config } = require('../config/db.config');

// Tüm kategorileri getir
exports.getAllCategories = async (req, res) => {
    try {
        console.log('Kategoriler getiriliyor...');
        console.log('Bağlantı bilgileri:', {
            server: config.server,
            database: config.database,
            user: config.user
        });

        const pool = await sql.connect(config);
        console.log('Veritabanına başarıyla bağlanıldı!');

        const result = await pool.request()
            .query('SELECT * FROM dbo.Categories');

        console.log('Kategoriler başarıyla getirildi:', result.recordset);
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Kategoriler getirilirken hata:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası',
            error: error.message
        });
    }
}; 