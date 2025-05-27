const express = require('express');
const router = express.Router();
const { createProductCategory, getProductCategories } = require('../controllers/productCategoryController');

// Ürün-kategori ilişkisi oluştur
router.post('/', createProductCategory);

// Ürünün kategorilerini getir
router.get('/:productId', getProductCategories);

module.exports = router; 