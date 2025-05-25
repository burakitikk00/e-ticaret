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
        
        console.log('Varyasyonlar:', variations); // Debug için log ekle
        res.json(variations);
    } catch (error) {
        console.error('Varyasyonlar getirilirken hata:', error);
        res.status(500).json({ 
            message: 'Sunucu hatası',
            error: error.message,
            stack: error.stack
        });
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
                .query(`                    SELECT v.VariationID, v.VariationName as ad,
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

// Ürün varyasyon kombinasyonlarını getir
exports.getProductVariationCombinations = async (req, res) => {
    try {
        const { productId } = req.params;
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('productId', sql.Int, productId)
            .query(`
                SELECT pvc.*, 
                       v1.VariationName as variation1Name,
                       v2.VariationName as variation2Name,
                       vo1.OptionName as option1Name,
                       vo2.OptionName as option2Name
                FROM dbo.ProductVariationCombinations pvc
                LEFT JOIN dbo.Variations v1 ON pvc.Variation1ID = v1.VariationID
                LEFT JOIN dbo.Variations v2 ON pvc.Variation2ID = v2.VariationID
                LEFT JOIN dbo.VariationOptions vo1 ON pvc.Option1ID = vo1.OptionID
                LEFT JOIN dbo.VariationOptions vo2 ON pvc.Option2ID = vo2.OptionID
                WHERE pvc.ProductID = @productId
            `);
        
        res.json(result.recordset);
    } catch (error) {
        console.error('Varyasyon kombinasyonları getirilirken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

// Ürün varyasyon kombinasyonu güncelle
exports.updateProductVariationCombination = async (req, res) => {
    try {
        const { combinationId } = req.params;
        const { imageUrl, price, stock } = req.body;
        
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('combinationId', sql.Int, combinationId)
            .input('imageUrl', sql.NVarChar, imageUrl)
            .input('price', sql.Decimal(10, 2), price)
            .input('stock', sql.Int, stock)
            .query(`
                UPDATE dbo.ProductVariationCombinations 
                SET ImageUrl = @imageUrl,
                    Price = @price,
                    Stock = @stock
                WHERE CombinationID = @combinationId
                
                SELECT * FROM dbo.ProductVariationCombinations 
                WHERE CombinationID = @combinationId
            `);
        
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Varyasyon kombinasyonu güncellenirken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

// Ürün varyasyon kombinasyonu ekle
exports.addProductVariationCombination = async (req, res) => {
    try {
        const { productId, variation1Id, variation2Id, option1Id, option2Id, imageUrl, price, stock } = req.body;
        
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('productId', sql.Int, productId)
            .input('variation1Id', sql.Int, variation1Id)
            .input('variation2Id', sql.Int, variation2Id)
            .input('option1Id', sql.Int, option1Id)
            .input('option2Id', sql.Int, option2Id)
            .input('imageUrl', sql.NVarChar, imageUrl)
            .input('price', sql.Decimal(10, 2), price)
            .input('stock', sql.Int, stock)
            .query(`
                INSERT INTO dbo.ProductVariationCombinations 
                (ProductID, Variation1ID, Variation2ID, Option1ID, Option2ID, ImageUrl, Price, Stock)
                OUTPUT INSERTED.*
                VALUES (@productId, @variation1Id, @variation2Id, @option1Id, @option2Id, @imageUrl, @price, @stock)
            `);
        
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Varyasyon kombinasyonu eklenirken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};
