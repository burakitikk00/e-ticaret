const express = require('express');
const router = express.Router();
const { register, login, adminLogin, changePassword, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Normal kullanıcı kaydı
router.post('/register', register);

// Normal kullanıcı girişi
router.post('/login', login);

// Admin girişi
router.post('/admin/login', adminLogin);

// Şifre değiştirme
router.post('/change-password', changePassword);

// Kullanıcı kendi bilgilerini getirir
router.get('/me', authMiddleware, getMe);

module.exports = router; 