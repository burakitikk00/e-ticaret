const sql = require('mssql');
const { config } = require('../config/db');

// Adres modeli için SQL sorguları
const Adres = {
    // Yeni adres ekleme
    async create(adresData) {
        try {
            const pool = await sql.connect(config);
            const request = pool.request();
            
            const result = await request
                .input('userID', sql.Int, adresData.userID)
                .input('il', sql.NVarChar(20), adresData.il)
                .input('ilce', sql.NVarChar(20), adresData.ilce)
                .input('ad', sql.NVarChar(20), adresData.ad)
                .input('soyad', sql.NVarChar(20), adresData.soyad)
                .input('adres', sql.NVarChar(100), adresData.adres)
                .input('apartman', sql.NVarChar(20), adresData.apartman)
                .input('postaKodu', sql.NVarChar(10), adresData.postaKodu)
                .input('telefon', sql.NVarChar(20), adresData.telefon)
                .input('baslik', sql.NVarChar(20), adresData.baslik)
                .query(`
                    INSERT INTO Adresler (userID, il, ilce, ad, soyad, adres, apartman, postaKodu, telefon, baslik)
                    VALUES (@userID, @il, @ilce, @ad, @soyad, @adres, @apartman, @postaKodu, @telefon, @baslik);
                    SELECT SCOPE_IDENTITY() AS id;
                `);
            
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    },

    // Kullanıcının adreslerini getir
    async getByUserId(userId) {
        try {
            const pool = await sql.connect(config);
            const request = pool.request();
            
            const result = await request
                .input('userID', sql.Int, userId)
                .query('SELECT * FROM Adresler WHERE userID = @userID');
            
            return result.recordset;
        } catch (err) {
            throw err;
        }
    },

    // Adres güncelleme
    async update(adresId, userId, adresData) {
        try {
            const pool = await sql.connect(config);
            const request = pool.request();
            // Sadece kendi adresini güncelleyebilsin
            const result = await request
                .input('id', sql.Int, adresId)
                .input('userID', sql.Int, userId)
                .input('il', sql.NVarChar(20), adresData.il)
                .input('ilce', sql.NVarChar(20), adresData.ilce)
                .input('ad', sql.NVarChar(20), adresData.ad)
                .input('soyad', sql.NVarChar(20), adresData.soyad)
                .input('adres', sql.NVarChar(100), adresData.adres)
                .input('apartman', sql.NVarChar(20), adresData.apartman)
                .input('postaKodu', sql.NVarChar(10), adresData.postaKodu)
                .input('telefon', sql.NVarChar(20), adresData.telefon)
                .input('baslik', sql.NVarChar(20), adresData.baslik)
                .query(`
                    UPDATE Adresler SET
                        il = @il,
                        ilce = @ilce,
                        ad = @ad,
                        soyad = @soyad,
                        adres = @adres,
                        apartman = @apartman,
                        postaKodu = @postaKodu,
                        telefon = @telefon,
                        baslik = @baslik
                    WHERE id = @id AND userID = @userID
                `);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            throw err;
        }
    },

    // Adres silme
    async delete(adresId, userId) {
        try {
            const pool = await sql.connect(config);
            const request = pool.request();
            const result = await request
                .input('id', sql.Int, adresId)
                .input('userID', sql.Int, userId)
                .query('DELETE FROM Adresler WHERE id = @id AND userID = @userID');
            return result.rowsAffected[0] > 0;
        } catch (err) {
            throw err;
        }
    }
};

module.exports = Adres;