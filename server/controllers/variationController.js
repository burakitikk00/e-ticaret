const sql = require('mssql');
const config = require('../config/db.config');

// Tüm varyasyonları getir
exports.getAllVariations = async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query(`
                SELECT v.VariationID, v.VariationName as ad,
                       STRING_AGG(vo.OptionName, ', ') as secenekler
                FROM dbo.Variations v
                LEFT JOIN dbo.VariationOptions vo ON v.VariationID = vo.VariationID
                GROUP BY v.VariationID, v.VariationName
            `);
        
        // secenekler string'ini array'e çevir
        const variations = result.recordset.map(v => ({
            ...v,
            secenekler: v.secenekler ? v.secenekler.split(', ') : []
        }));
        
        res.json(variations);
    } catch (error) {
        console.error('Varyasyonlar getirilirken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

// Belirli bir varyasyonun seçeneklerini getir
exports.getVariationOptions = async (req, res) => {
    try {
        const variationId = req.params.variationId;
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('variationId', sql.Int, variationId)
            .query('SELECT * FROM VariationOptions WHERE VariationID = @variationId');
        
        res.json(result.recordset);
    } catch (error) {
        console.error('Varyasyon seçenekleri getirilirken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

// Yeni varyasyon ekle
exports.addVariation = async (req, res) => {
    try {
        const { variationName } = req.body;
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('variationName', sql.NVarChar, variationName)
            .query('INSERT INTO Variations (VariationName) OUTPUT INSERTED.* VALUES (@variationName)');
        
        res.json({
            ...result.recordset[0],
            ad: result.recordset[0].VariationName,
            secenekler: []
        });
    } catch (error) {
        console.error('Varyasyon eklenirken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

// Varyasyon seçeneği ekle
exports.addVariationOption = async (req, res) => {
    try {
        const { variationId, optionName } = req.body;
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('variationId', sql.Int, variationId)
            .input('optionName', sql.NVarChar, optionName)
            .query('INSERT INTO VariationOptions (VariationID, OptionName) OUTPUT INSERTED.* VALUES (@variationId, @optionName)');
        
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Varyasyon seçeneği eklenirken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

// Varyasyon güncelle
exports.updateVariation = async (req, res) => {
    const { variationId } = req.params;
    const { ad, secenekler } = req.body;
    
    try {
        const pool = await sql.connect(config);
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            // Varyasyonu güncelle
            await transaction.request()
                .input('variationId', sql.Int, variationId)
                .input('variationName', sql.NVarChar, ad)
                .query('UPDATE dbo.Variations SET VariationName = @variationName WHERE VariationID = @variationId');

            // Mevcut seçenekleri sil
            await transaction.request()
                .input('variationId', sql.Int, variationId)
                .query('DELETE FROM dbo.VariationOptions WHERE VariationID = @variationId');

            // Yeni seçenekleri ekle
            if (secenekler && secenekler.length > 0) {
                for (const secenek of secenekler) {
                    await transaction.request()
                        .input('variationId', sql.Int, variationId)
                        .input('optionName', sql.NVarChar, secenek)
                        .query('INSERT INTO dbo.VariationOptions (VariationID, OptionName) VALUES (@variationId, @optionName)');
                }
            }

            await transaction.commit();

            // Güncellenen varyasyonu getir
            const updatedVariation = await pool.request()
                .input('variationId', sql.Int, variationId)
                .query(`
                    SELECT v.VariationID, v.VariationName as ad,
                           STRING_AGG(vo.OptionName, ', ') as secenekler
                    FROM dbo.Variations v
                    LEFT JOIN dbo.VariationOptions vo ON v.VariationID = vo.VariationID
                    WHERE v.VariationID = @variationId
                    GROUP BY v.VariationID, v.VariationName
                `);

            const variation = {
                ...updatedVariation.recordset[0],
                secenekler: updatedVariation.recordset[0].secenekler ? updatedVariation.recordset[0].secenekler.split(', ') : []
            };

            res.json(variation);
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error('Varyasyon güncellenirken hata:', err);
        res.status(500).json({ message: err.message });
    }
};

// Varyasyon sil
exports.deleteVariation = async (req, res) => {
    const { variationId } = req.params;
    
    try {
        const pool = await sql.connect(config);
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            // Önce seçenekleri sil
            await transaction.request()
                .input('variationId', sql.Int, variationId)
                .query('DELETE FROM dbo.VariationOptions WHERE VariationID = @variationId');

            // Sonra varyasyonu sil
            await transaction.request()
                .input('variationId', sql.Int, variationId)
                .query('DELETE FROM dbo.Variations WHERE VariationID = @variationId');

            await transaction.commit();
            res.json({ message: 'Varyasyon başarıyla silindi' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error('Varyasyon silinirken hata:', err);
        res.status(500).json({ message: err.message });
    }
};