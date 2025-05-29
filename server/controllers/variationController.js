const sql = require('mssql');
const { config } = require('../config/db.config');

// Tüm varyasyonları getir (OptionID ve OptionName ile birlikte)
exports.getAllVariations = async (req, res) => {
    try {
        const pool = await sql.connect(config);
        // Varyasyonları ve seçenekleri tek sorguda çek
        const result = await pool.request()
            .query(`
                SELECT 
                    v.VariationID,
                    v.VariationName as ad,
                    STRING_AGG(vo.OptionName, ', ') as secenekler
                FROM dbo.Variations v
                LEFT JOIN dbo.VariationOptions vo ON v.VariationID = vo.VariationID
                GROUP BY v.VariationID, v.VariationName
            `);

        // Seçenekleri diziye çevir
        const variations = result.recordset.map(v => ({
            ...v,
            secenekler: v.secenekler ? v.secenekler.split(', ') : []
        }));

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
    
    console.log('Gelen veri:', { 
        variationId, 
        ad, 
        secenekler,
        variationIdType: typeof variationId,
        adType: typeof ad,
        seceneklerType: Array.isArray(secenekler) ? 'array' : typeof secenekler
    });

    if (!variationId || !ad) {
        console.log('Validasyon hatası:', { variationId, ad });
        return res.status(400).json({ 
            message: 'Geçersiz veri',
            details: 'VariationID ve ad alanları zorunludur'
        });
    }
    
    try {
        const pool = await sql.connect(config);
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            // Önce varyasyonun var olup olmadığını kontrol et
            const checkVariation = await transaction.request()
                .input('variationId', sql.Int, variationId)
                .query('SELECT VariationID FROM dbo.Variations WHERE VariationID = @variationId');

            console.log('Varyasyon kontrolü:', checkVariation.recordset);

            if (checkVariation.recordset.length === 0) {
                throw new Error(`VariationID: ${variationId} bulunamadı`);
            }

            // Önce bu varyasyona ait ürün varyasyon kombinasyonlarını sil
            const deleteCombinationsResult = await transaction.request()
                .input('variationId', sql.Int, variationId)
                .query(`
                    DELETE FROM dbo.ProductVariationCombinations 
                    WHERE Option1ID IN (SELECT OptionID FROM dbo.VariationOptions WHERE VariationID = @variationId)
                    OR Option2ID IN (SELECT OptionID FROM dbo.VariationOptions WHERE VariationID = @variationId);
                    SELECT @@ROWCOUNT as deletedCombinations;
                `);

            console.log('Ürün varyasyon kombinasyonları silme sonucu:', {
                deletedCombinations: deleteCombinationsResult.recordset[0].deletedCombinations,
                variationId
            });

            // Varyasyonu güncelle
            const updateResult = await transaction.request()
                .input('variationId', sql.Int, variationId)
                .input('variationName', sql.NVarChar, ad)
                .query(`
                    UPDATE dbo.Variations 
                    SET VariationName = @variationName 
                    WHERE VariationID = @variationId;
                    SELECT @@ROWCOUNT as affectedRows;
                `);

            console.log('Varyasyon güncelleme sonucu:', {
                affectedRows: updateResult.recordset[0].affectedRows,
                variationId,
                newName: ad
            });

            // Mevcut seçenekleri sil
            const deleteResult = await transaction.request()
                .input('variationId', sql.Int, variationId)
                .query(`
                    DELETE FROM dbo.VariationOptions 
                    WHERE VariationID = @variationId;
                    SELECT @@ROWCOUNT as deletedRows;
                `);

            console.log('Seçenek silme sonucu:', {
                deletedRows: deleteResult.recordset[0].deletedRows,
                variationId
            });

            // Yeni seçenekleri ekle
            if (secenekler && secenekler.length > 0) {
                console.log('Eklenecek seçenekler:', secenekler);
                
                for (const secenek of secenekler) {
                    if (secenek && secenek.trim()) {
                        try {
                            const insertResult = await transaction.request()
                                .input('variationId', sql.Int, variationId)
                                .input('optionName', sql.NVarChar, secenek.trim())
                                .query(`
                                    INSERT INTO dbo.VariationOptions (VariationID, OptionName) 
                                    VALUES (@variationId, @optionName);
                                    SELECT SCOPE_IDENTITY() as newOptionId;
                                `);
                            
                            console.log('Seçenek eklendi:', {
                                variationId,
                                optionName: secenek.trim(),
                                newOptionId: insertResult.recordset[0].newOptionId
                            });
                        } catch (insertError) {
                            console.error('Seçenek eklenirken hata:', {
                                error: insertError,
                                variationId,
                                optionName: secenek.trim()
                            });
                            throw insertError;
                        }
                    }
                }
            }

            await transaction.commit();
            console.log('Transaction başarıyla tamamlandı');

            // Güncellenen varyasyonu getir
            const updatedVariation = await pool.request()
                .input('variationId', sql.Int, variationId)
                .query(`
                    SELECT 
                        v.VariationID,
                        v.VariationName as ad,
                        STRING_AGG(vo.OptionName, ', ') as secenekler
                    FROM dbo.Variations v
                    LEFT JOIN dbo.VariationOptions vo ON v.VariationID = vo.VariationID
                    WHERE v.VariationID = @variationId
                    GROUP BY v.VariationID, v.VariationName
                `);

            console.log('Güncellenmiş varyasyon:', updatedVariation.recordset[0]);

            if (!updatedVariation.recordset[0]) {
                throw new Error('Güncellenen varyasyon bulunamadı');
            }

            const variation = {
                ...updatedVariation.recordset[0],
                secenekler: updatedVariation.recordset[0].secenekler ? updatedVariation.recordset[0].secenekler.split(', ') : []
            };

            res.json(variation);
        } catch (err) {
            console.error('Transaction hatası:', {
                error: err,
                message: err.message,
                stack: err.stack,
                variationId,
                ad,
                secenekler
            });
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error('Varyasyon güncellenirken hata:', {
            error: err,
            message: err.message,
            stack: err.stack,
            variationId,
            ad,
            secenekler
        });
        res.status(500).json({ 
            message: 'Varyasyon güncellenirken bir hata oluştu',
            error: err.message,
            details: err.stack,
            variationId,
            ad
        });
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
            // Önce bu varyasyona ait ürün varyasyon kombinasyonlarını sil
            const deleteCombinationsResult = await transaction.request()
                .input('variationId', sql.Int, variationId)
                .query(`
                    DELETE FROM dbo.ProductVariationCombinations 
                    WHERE Option1ID IN (SELECT OptionID FROM dbo.VariationOptions WHERE VariationID = @variationId)
                    OR Option2ID IN (SELECT OptionID FROM dbo.VariationOptions WHERE VariationID = @variationId);
                    SELECT @@ROWCOUNT as deletedCombinations;
                `);

            console.log('Ürün varyasyon kombinasyonları silme sonucu:', {
                deletedCombinations: deleteCombinationsResult.recordset[0].deletedCombinations,
                variationId
            });

            // Sonra seçenekleri sil
            const deleteOptionsResult = await transaction.request()
                .input('variationId', sql.Int, variationId)
                .query(`
                    DELETE FROM dbo.VariationOptions 
                    WHERE VariationID = @variationId;
                    SELECT @@ROWCOUNT as deletedOptions;
                `);

            console.log('Seçenek silme sonucu:', {
                deletedOptions: deleteOptionsResult.recordset[0].deletedOptions,
                variationId
            });

            // En son varyasyonu sil
            const deleteVariationResult = await transaction.request()
                .input('variationId', sql.Int, variationId)
                .query(`
                    DELETE FROM dbo.Variations 
                    WHERE VariationID = @variationId;
                    SELECT @@ROWCOUNT as deletedVariation;
                `);

            console.log('Varyasyon silme sonucu:', {
                deletedVariation: deleteVariationResult.recordset[0].deletedVariation,
                variationId
            });

            await transaction.commit();
            res.json({ 
                message: 'Varyasyon ve ilgili tüm kayıtlar başarıyla silindi',
                deletedCombinations: deleteCombinationsResult.recordset[0].deletedCombinations,
                deletedOptions: deleteOptionsResult.recordset[0].deletedOptions,
                deletedVariation: deleteVariationResult.recordset[0].deletedVariation
            });
        } catch (err) {
            console.error('Transaction hatası:', err);
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error('Varyasyon silinirken hata:', err);
        res.status(500).json({ 
            message: 'Varyasyon silinirken bir hata oluştu',
            error: err.message,
            details: err.stack
        });
    }
};
