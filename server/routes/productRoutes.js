const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Yeni ürün ekle
router.post('/', productController.createProduct);

// Tüm ürünleri getir
router.get('/', productController.getAllProducts);

// Ürünü sil
router.delete('/:id', productController.deleteProduct);

// Ürün durumunu güncelle (Aktif/Pasif)
router.patch('/:id/status', productController.updateProductStatus);

// ID ile ürün detayını getir
router.get('/:id', productController.getProductById);

module.exports = router;
