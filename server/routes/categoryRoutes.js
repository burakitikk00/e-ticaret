const express = require('express');
const router = express.Router();
const { getAllCategories } = require('../controllers/categoryController');

// Tüm kategorileri getir
router.get('/', getAllCategories);

module.exports = router; 