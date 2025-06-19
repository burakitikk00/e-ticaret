const sql = require('mssql');
const { config } = require('../config/db.config');

// Siparişe ürün ekleme fonksiyonu
async function addOrderItem(item) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('OrderID', sql.Int, item.OrderID)
            .input('ProductID', sql.Int, item.ProductID)
            .input('Quantity', sql.Int, item.Quantity)
            .input('UnitPrice', sql.Decimal(18,2), item.UnitPrice)
            .input('OpsiyonID', sql.Int, item.OpsiyonID || null)
            .input('VaryasyonID', sql.Int, item.VaryasyonID || null)
            .query(`INSERT INTO OrderItems (OrderID, ProductID, Quantity, UnitPrice, OpsiyonID, VaryasyonID)
                    OUTPUT INSERTED.*
                    VALUES (@OrderID, @ProductID, @Quantity, @UnitPrice, @OpsiyonID, @VaryasyonID)`);
        return result.recordset[0];
    } catch (err) {
        throw err;
    }
}

// Belirli bir siparişe ait ürünleri getirir (ürün adı ve görseliyle birlikte)
async function getOrderItemsByOrderId(orderId) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('OrderID', sql.Int, orderId)
            .query(`
                SELECT oi.*, p.ProductName, p.ImageURL
                FROM OrderItems oi
                LEFT JOIN Products p ON oi.ProductID = p.ProductID
                WHERE oi.OrderID = @OrderID
            `);
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

module.exports = { addOrderItem, getOrderItemsByOrderId }; 