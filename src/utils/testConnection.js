import { connectDB } from '../config/db.config.js';

// Veritabanı bağlantısını test et
async function testDatabaseConnection() {
    let pool;
    try {
        console.log('Bağlantı testi başlatılıyor...');
        pool = await connectDB();
        
        // Test sorgusu çalıştır
        console.log('Test sorgusu çalıştırılıyor...');
        const result = await pool.request().query('SELECT @@version as version');
        console.log('SQL Server Versiyonu:', result.recordset[0].version);
        
        // Veritabanı listesini kontrol et
        console.log('Veritabanları listeleniyor...');
        const dbResult = await pool.request().query('SELECT name FROM sys.databases');
        console.log('Mevcut veritabanları:', dbResult.recordset.map(db => db.name));
        
    } catch (error) {
        console.error('Bağlantı testi sırasında hata oluştu:');
        console.error('Hata mesajı:', error.message);
        if (error.code) console.error('Hata kodu:', error.code);
        if (error.originalError) {
            console.error('Orijinal hata:', error.originalError);
        }
    } finally {
        if (pool) {
            try {
                await pool.close();
                console.log('Bağlantı kapatıldı.');
            } catch (err) {
                console.error('Bağlantı kapatılırken hata:', err);
            }
        }
    }
}

// Test fonksiyonunu çalıştır
console.log('Test başlatılıyor...');
testDatabaseConnection(); 