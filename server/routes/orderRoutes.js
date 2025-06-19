const express = require('express');
const router = express.Router();
const { createOrderWithItems, getOrdersByUser } = require('../controllers/orderController');

// Sipariş oluşturma endpointi
// POST /api/orders
router.post('/', createOrderWithItems);

// Kullanıcıya ait siparişleri getirir
router.get('/my', getOrdersByUser);

module.exports = router; 