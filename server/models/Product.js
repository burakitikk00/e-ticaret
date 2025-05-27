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
                (ProductName, Description, BasePrice, Currency, Stock, ShippingType, ShippingCost, ProductType, Language, IsDiscounted, ImageURL)
                OUTPUT INSERTED.*
                VALUES (@ProductName, @Description, @BasePrice, @Currency, @Stock, @ShippingType, @ShippingCost, @ProductType, @Language, @IsDiscounted, @ImageURL)`);
        
        console.log('Ürün ekleme sonucu:', result.recordset[0]);
        return result.recordset[0];
    } catch (err) {
        console.error('Ürün ekleme hatası:', err);
        throw err;
    }
}







// (İsteğe bağlı) Tüm ürünleri listeleme fonksiyonu
async function getAllProducts() {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM dbo.Products');
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    insertProduct,
    getAllProducts
};