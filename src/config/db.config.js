// MSSQL veritabanı bağlantı yapılandırması
const sql = require('mssql');

const dbConfig = {
    server: 'DESKTOP-8IUA2EP', // Sunucu adınız
    database: 'DBLinaButik',    // Veritabanı adınız
    user: 'LinaButik',  // SQL Server'da oluşturduğunuz kullanıcı adı
    password: 'adminlina', // Oluşturduğunuz şifre
    options: {
        encrypt: true, // Encryption mandatory ise true
        trustServerCertificate: true // Sertifika zorunluysa true
    }
};

async function connectDB() {
    try {
        console.log('Bağlantı deneniyor...', dbConfig);
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
}

module.exports = { connectDB, sql, dbConfig };