const express = require('express');
const router = express.Router();
const controller = require('../controllers/productVariationCombinationController');

router.post('/combinations', controller.createCombinations);

module.exports = router; 