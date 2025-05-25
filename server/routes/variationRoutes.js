const express = require('express');
const router = express.Router();
const variationController = require('../controllers/variationController');

// Tüm varyasyonları getir
router.get('/', variationController.getAllVariations);

// Belirli bir varyasyonun seçeneklerini getir
router.get('/:variationId/options', variationController.getVariationOptions);

// Yeni varyasyon ekle
router.post('/', variationController.addVariation);

// Varyasyon seçeneği ekle
router.post('/:variationId/options', variationController.addVariationOption);

// Varyasyon güncelle
router.put('/:variationId', variationController.updateVariation);

// Varyasyon sil
router.delete('/:variationId', variationController.deleteVariation);

// Ürün varyasyon kombinasyonlarını getir
router.get('/product/:productId/combinations', variationController.getProductVariationCombinations);

// Ürün varyasyon kombinasyonu güncelle
router.put('/combinations/:combinationId', variationController.updateProductVariationCombination);

// Ürün varyasyon kombinasyonu ekle
router.post('/combinations', variationController.addProductVariationCombination);

module.exports = router; 