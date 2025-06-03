const express = require('express');
const router = express.Router();
const controller = require('../controllers/urunVaryasyonBilgiController');

// Varyasyon bilgisi kaydetme endpointi
router.post('/urunvaryasyonkaydet', controller.kaydet);

module.exports = router; 