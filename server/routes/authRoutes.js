const express = require('express');
const router = express.Router();
const { register, login, adminLogin, changePassword } = require('../controllers/authController');

// Normal kullanıcı kaydı
router.post('/register', register);

// Normal kullanıcı girişi
router.post('/login', login);

// Admin girişi
router.post('/admin/login', adminLogin);

// Şifre değiştirme
router.post('/change-password', changePassword);

module.exports = router; 