const express = require('express');
const router = express.Router();
const { createOrderWithItems, getOrdersByUser, getAllOrders, updateOrderStatus } = require('../controllers/orderController');

// Sipariş oluşturma endpointi
// POST /api/orders
router.post('/', createOrderWithItems);

// Kullanıcıya ait siparişleri getirir
router.get('/my', getOrdersByUser);

// Admin: Tüm siparişleri getirir
router.get('/all', getAllOrders);

// Sipariş durumunu güncelle
router.patch('/:orderId/status', updateOrderStatus);

// Tarih aralığına göre siparişleri getir
router.get('/by-date', require('../controllers/orderController').getOrdersByDateRange);

// En çok satan ürünler
router.get('/top-products', require('../controllers/orderController').getTopProducts);

module.exports = router; 