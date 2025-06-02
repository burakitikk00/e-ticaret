const express = require('express');
const router = express.Router();
const ilcelerController = require('../controllers/ilcelerController');

// Seçilen şehre ait ilçeleri getir
router.get('/:sehirAd', ilcelerController.getIlcelerBySehirAd);

module.exports = router;
