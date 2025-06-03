const sql = require('mssql');
require('dotenv').config();

// Veritabanı bağlantı konfigürasyonu
const config = {
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
            server: config.server,
            database: config.database,
            user: config.user
        });

        const pool = await sql.connect(config);
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
    config,
    connectDB,
    sql
};