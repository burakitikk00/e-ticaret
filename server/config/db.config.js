const sql = require('mssql');

const config = {
    user: 'LinaButik', // SQL Server kullanıcı adı
    password: 'adminlina', // SQL Server şifresi
    server: 'DESKTOP-8IUA2EP', // SQL Server adresi
    database: 'DBLinaButik', // Veritabanı adı
    options: {
        encrypt: false, // Windows için false
        trustServerCertificate: true, // SSL sertifikası doğrulamasını atla
        enableArithAbort: true
    },
    port: 1433 // SQL Server varsayılan portu
};

// Veritabanı bağlantısını test et
async function testConnection() {
    try {
        await sql.connect(config);
        console.log('Veritabanı bağlantısı başarılı');
        return true;
    } catch (err) {
        console.error('Veritabanı bağlantı hatası:', err);
        return false;
    }
}

module.exports = {
    config,
    sql,
    testConnection
}; 