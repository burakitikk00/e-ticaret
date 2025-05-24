const sql = require('mssql');
require('dotenv').config();

// Veritabanı bağlantı konfigürasyonu
const dbConfig = {
    server: 'DESKTOP-8IUA2EP',
    database: 'DBLinaButik',
    user: 'LinaButik',
    password: 'adminlina',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

// Veritabanı bağlantı fonksiyonu
const connectDB = async () => {
    try {
        console.log('Veritabanı bağlantısı deneniyor...');
        console.log('Bağlantı bilgileri:', {
            server: dbConfig.server,
            database: dbConfig.database,
            user: dbConfig.user
        });

        const pool = await sql.connect(dbConfig);
        console.log('Veritabanına başarıyla bağlanıldı!');
        return pool;
    } catch (err) {
        console.error('Veritabanı bağlantı hatası:', err);
        if (err.originalError) {
            console.error('Orijinal hata:', err.originalError);
        }
        throw err;
    }
};

module.exports = {
    connectDB,
    sql
};