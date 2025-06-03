const sql = require('mssql');
const { config } = require('../config/db');

async function createAdreslerTable() {
    try {
        // Veritabanına bağlan
        const pool = await sql.connect(config);
        
        // Tablo oluşturma sorgusu
        const createTableQuery = `
            -- Eğer tablo varsa önce silelim
            IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Adresler')
                DROP TABLE Adresler;

            -- Adresler tablosunu oluşturalım
            CREATE TABLE Adresler (
                id INT IDENTITY(1,1) PRIMARY KEY,
                userID INT NOT NULL,
                baslik NVARCHAR(20),
                ad NVARCHAR(20),
                soyad NVARCHAR(20),
                adres NVARCHAR(100),
                apartman NVARCHAR(20),
                postaKodu NVARCHAR(10),
                ulke NVARCHAR(20),
                il NVARCHAR(20),
                ilce NVARCHAR(20),
                telefon NVARCHAR(20)
            );
        `;

        // Sorguyu çalıştır
        await pool.request().query(createTableQuery);
        console.log('Adresler tablosu başarıyla oluşturuldu!');

        // Bağlantıyı kapat
        await pool.close();
    } catch (err) {
        console.error('Tablo oluşturulurken hata:', err);
    }
}

// Scripti çalıştır
createAdreslerTable(); 