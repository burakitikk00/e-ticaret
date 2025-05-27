const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Yeni ürün ekle
router.post('/', productController.createProduct);


module.exports = router;
