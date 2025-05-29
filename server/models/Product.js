const { sql, config } = require('../config/db.config');

// MSSQL ile ürün ekleme fonksiyonu
async function insertProduct(product) {
    try {
        console.log('Ürün ekleniyor:', product);
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('ProductName', sql.NVarChar, product.ProductName)
            .input('Description', sql.NVarChar, product.Description)
            .input('BasePrice', sql.Decimal(18,2), product.BasePrice)
            .input('Currency', sql.NVarChar, product.Currency)
            .input('Stock', sql.Int, product.Stock)
            .input('ShippingType', sql.NVarChar, product.ShippingType)
            .input('ShippingCost', sql.Decimal(18,2), product.ShippingCost)
            .input('ProductType', sql.NVarChar, product.ProductType)
            .input('Language', sql.NVarChar, product.Language)
            .input('IsDiscounted', sql.Bit, product.IsDiscounted)
            .input('ImageURL', sql.NVarChar, product.ImageURL)
            .query(`INSERT INTO dbo.Products
                (ProductName, Description, BasePrice, Currency, Stock, ShippingType, ShippingCost, ProductType, Language, IsDiscounted, ImageURL, Status)
                OUTPUT INSERTED.*
                VALUES (@ProductName, @Description, @BasePrice, @Currency, @Stock, @ShippingType, @ShippingCost, @ProductType, @Language, @IsDiscounted, @ImageURL, 1)`);
        
        console.log('Ürün ekleme sonucu:', result.recordset[0]);
        return result.recordset[0];
    } catch (err) {
        console.error('Ürün ekleme hatası:', err);
        throw err;
    }
}

//  Tüm ürünleri listeleme fonksiyonu
async function getAllProducts() {
    try {
        const pool = await sql.connect(config);
        // Sadece aktif ürünler (Status=1) getirilecek
        const result = await pool.request().query('SELECT * FROM dbo.Products WHERE Status = 1 ');
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

// Kategori adı ile birlikte tüm ürünleri döndüren fonksiyon
async function getAllProductsWithCategory() {
    try {
        const pool = await sql.connect(config);
        // Sadece aktif ürünler (Status=1) getirilecek
        const result = await pool.request().query(`
            SELECT 
                p.*,
                c.CategoriesName,
                STRING_AGG(po.OpsiyonName, ', ') as Opsiyonlar,
                STRING_AGG(po.OpsiyonPrice, ', ') as OpsiyonFiyatlari
            FROM dbo.Products p
            LEFT JOIN dbo.ProductCategories pc ON p.ProductID = pc.ProductID
            LEFT JOIN dbo.Categories c ON pc.CategoriesID = c.CategoriesID
            LEFT JOIN dbo.ProductOpsiyon po ON p.ProductID = po.ProductID
            WHERE p.Status = 1
            GROUP BY 
                p.ProductID, p.ProductName, p.Description, p.BasePrice, 
                p.Currency, p.Stock, p.ShippingType, p.ShippingCost, 
                p.ProductType, p.Language, p.IsDiscounted, p.ImageURL,
                p.CreatedAt, p.UpdatedAt, p.Status,
                c.CategoriesName
        `);
        return result.recordset;
    } catch (err) {
        console.error('getAllProductsWithCategory HATASI:', err);
        throw err;
    }
}

// Kategori adına göre ürünleri filtreleyen fonksiyon
async function getProductsByCategory(categoryName) {
    try {
        const pool = await sql.connect(config);
        // Sadece aktif ürünler (Status=1) getirilecek
        const result = await pool.request()
            .input('CategoriesName', sql.NVarChar, categoryName)
            .query(`
                SELECT 
                    p.*,
                    c.CategoriesName,
                    STRING_AGG(po.OpsiyonName, ', ') as Opsiyonlar,
                    STRING_AGG(po.OpsiyonPrice, ', ') as OpsiyonFiyatlari
                FROM dbo.Products p
                LEFT JOIN dbo.ProductCategories pc ON p.ProductID = pc.ProductID
                LEFT JOIN dbo.Categories c ON pc.CategoriesID = c.CategoriesID
                LEFT JOIN dbo.ProductOpsiyon po ON p.ProductID = po.ProductID
                WHERE c.CategoriesName = @CategoriesName AND p.Status = 1
                GROUP BY 
                    p.ProductID, p.ProductName, p.Description, p.BasePrice, 
                    p.Currency, p.Stock, p.ShippingType, p.ShippingCost, 
                    p.ProductType, p.Language, p.IsDiscounted, p.ImageURL,
                    p.CreatedAt, p.UpdatedAt, p.Status,
                    c.CategoriesName
            `);
        return result.recordset;
    } catch (err) {
        console.error('getProductsByCategory HATASI:', err);
        throw err;
    }
}

// Ürünü silen fonksiyon (İlgili bağlı verileri de siler)
async function deleteProduct(productId) {
    let pool;
    try {
        pool = await sql.connect(config);
        const transaction = new sql.Transaction(pool);

        await transaction.begin(); // Transaction başlat

        // Ürünle ilişkili kategorileri sil
        await transaction.request()
            .input('ProductID', sql.Int, productId)
            .query('DELETE FROM dbo.ProductCategories WHERE ProductID = @ProductID');
        console.log(`Ürün ID ${productId} için ProductCategories kayıtları silindi.`);

        // Ürünle ilişkili opsiyonları sil
        await transaction.request()
             .input('ProductID', sql.Int, productId)
             .query('DELETE FROM dbo.ProductOpsiyon WHERE ProductID = @ProductID');
        console.log(`Ürün ID ${productId} için ProductOpsiyon kayıtları silindi.`);

        // Ürünle ilişkili varyasyon kombinasyonlarını sil
        await transaction.request()
             .input('ProductID', sql.Int, productId)
             .query('DELETE FROM dbo.ProductVariationCombinations WHERE ProductID = @ProductID');
        console.log(`Ürün ID ${productId} için ProductVariationCombinations kayıtları silindi.`);

        // VariationOptions ProductID'ye direkt bağlı olmadığı için buradan silme işlemi yapmıyoruz.
        // VariationOptions tablosundaki kayıtlar, bağlı olduğu üst seviyedeki varyasyonlar silindiğinde (on cascade delete ile veya manuel olarak) silinmelidir.
        // Bu senaryoda Variations tablosu ProductID'ye bağlıysa, Variations silindiğinde VariationOptions otomatik silinebilir (FOREIGN KEY CASCADE DELETE ayarı varsa)
        // Veya Variations tablosunu sildiğimizde VariationOptions'ı da ayrıca silmemiz gerekebilir.

        // Ana ürünü sil
        await transaction.request()
            .input('ProductID', sql.Int, productId)
            .query('DELETE FROM dbo.Products WHERE ProductID = @ProductID');
        console.log(`Ürün ID ${productId} Products tablosundan silindi.`);

        await transaction.commit(); // Transaction başarılı, değişiklikleri kaydet
        console.log(`Ürün ID ${productId} ve ilgili tüm kayıtları başarıyla silindi.`);
        return true;

    } catch (err) {
        console.error('Ürün silme işlemi sırasında genel hata:', err);
        // Hata oluştu, transaction'ı geri al
        if (pool && pool.connected) {
             // Eğer transaction başladıysa ve henüz commit edilmediyse geri al
             const transaction = new sql.Transaction(pool); // Yeniden transaction objesi oluşturmak daha güvenli olabilir.
             transaction.rollback(rollbackErr => {
                if (rollbackErr) {
                   console.error('Transaction rollback sırasında hata oluştu:', rollbackErr);
                }
                console.error('Transaction geri alındı.');
             });
        }
        throw err; // Hatayı tekrar fırlat
    }
    // finally blokunda pool kapatmak transaction rollback durumunda sorun yaratabilir,
    // bu nedenle burada kapatmıyoruz. Uygulamanın genelinde bağlantı yönetimi farklı olabilir.
}

// Ürün durumunu güncelleyen fonksiyon (Aktif/Pasif - Status alanı)
async function updateProductStatus(productId, status) {
    try {
        console.log(`Ürün durumunu güncelleme isteği alındı - Ürün ID: ${productId}, Yeni Status: ${status}`);
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('ProductID', sql.Int, productId)
            .input('Status', sql.Bit, status) // Status alanını güncelleyeceğiz (1 aktif, 0 pasif)
            .query('UPDATE dbo.Products SET Status = @Status WHERE ProductID = @ProductID');

        console.log(`Ürün ID ${productId} durumu güncellendi. Sorgu sonucu:`, result);
        return true;
    } catch (err) {
        console.error(`Ürün ID ${productId} için durum güncelleme hatası:`, err);
        throw err;
    }
}

// ID ile ürün detayını getiren fonksiyon
async function getProductById(productId) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('ProductID', sql.Int, productId)
            .query('SELECT * FROM dbo.Products WHERE ProductID = @ProductID');
        return result.recordset[0];
    } catch (err) {
        throw err;
    }
}

module.exports = {
    insertProduct,
    getAllProducts,
    getAllProductsWithCategory,
    getProductsByCategory,
    deleteProduct,
    updateProductStatus,
    getProductById,
};