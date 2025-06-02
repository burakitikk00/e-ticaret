const express = require('express');
const router = express.Router();
const sehirlerController = require('../controllers/SehirlerController');

// Tüm şehirleri getir
router.get('/', sehirlerController.getAllSehirler);

module.exports = router;
