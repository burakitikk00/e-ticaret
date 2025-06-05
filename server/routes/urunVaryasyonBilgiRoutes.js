const express = require('express');
const router = express.Router();
const controller = require('../controllers/urunVaryasyonBilgiController');

// Varyasyon bilgisi kaydetme endpointi
router.post('/urunvaryasyonkaydet', controller.kaydet);

// Varyasyon bilgisi getirme endpointi
router.get('/urunvaryasyonbilgi/:productId', controller.getByProductId);

module.exports = router; 