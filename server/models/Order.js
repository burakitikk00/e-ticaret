const sql = require('mssql');
const { config } = require('../config/db.config');

// Yeni sipariş ekleme fonksiyonu
async function createOrder(orderData) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('UserID', sql.Int, orderData.UserID || null)
            .input('AdresID', sql.Int, orderData.AdresID)
            .input('OrderDate', sql.DateTime, orderData.OrderDate)
            .input('OrderStatus', sql.NVarChar(20), orderData.OrderStatus)
            .input('TotalAmount', sql.Decimal(18,2), orderData.TotalAmount)
            .input('PaymentStatus', sql.NVarChar(20), orderData.PaymentStatus)
            .input('CustomerNote', sql.NVarChar(255), orderData.CustomerNote)
            .input('Telefon', sql.NVarChar(20), orderData.Telefon)
            .input('Eposta', sql.NVarChar(100), orderData.Eposta)
            .query(`INSERT INTO Orders (UserID, AdresID, OrderDate, OrderStatus, TotalAmount, PaymentStatus, CustomerNote, Telefon, Eposta)
                    OUTPUT INSERTED.*
                    VALUES (@UserID, @AdresID, @OrderDate, @OrderStatus, @TotalAmount, @PaymentStatus, @CustomerNote, @Telefon, @Eposta)`);
        return result.recordset[0];
    } catch (err) {
        throw err;
    }
}

// Siparişleri getiren fonksiyon (isteğe bağlı)
async function getOrderById(orderId) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('OrderID', sql.Int, orderId)
            .query('SELECT * FROM Orders WHERE OrderID = @OrderID');
        return result.recordset[0];
    } catch (err) {
        throw err;
    }
}

// Belirli bir kullanıcıya ait tüm siparişleri getirir
async function getOrdersByUserId(userId) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            .query('SELECT * FROM Orders WHERE UserID = @UserID ORDER BY OrderDate DESC');
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

// Tüm siparişleri getirir (admin için)
async function getAllOrders() {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query('SELECT * FROM Orders ORDER BY OrderDate DESC');
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

// Siparişin durumunu güncelleyen fonksiyon
async function updateOrderStatus(orderId, status) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('OrderID', sql.Int, orderId)
            .input('OrderStatus', sql.NVarChar(20), status)
            .query('UPDATE Orders SET OrderStatus = @OrderStatus WHERE OrderID = @OrderID');
        return result.rowsAffected[0] > 0;
    } catch (err) {
        throw err;
    }
}

// Belirli bir tarih aralığındaki siparişleri getirir
async function getOrdersByDateRange(startDate, endDate) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('StartDate', sql.DateTime, startDate)
            .input('EndDate', sql.DateTime, endDate)
            .query('SELECT * FROM Orders WHERE OrderDate >= @StartDate AND OrderDate <= @EndDate ORDER BY OrderDate DESC');
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

module.exports = { createOrder, getOrderById, getOrdersByUserId, getAllOrders, updateOrderStatus, getOrdersByDateRange }; 