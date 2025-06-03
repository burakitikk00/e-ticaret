const express = require("express");
const router = express.Router();
const adreslerController = require("../controllers/adreslerController");
const authMiddleware = require("../middleware/auth");

// Tüm adres route'ları için auth middleware'ini kullan
router.use(authMiddleware);

// POST /api/adresler -> Adres ekle
router.post("/", adreslerController.createAdres);

// GET /api/adresler -> Kullanıcının adreslerini getir
router.get("/", adreslerController.getAdresler);

// PUT /api/adresler/:id -> Adres güncelle
router.put('/:id', adreslerController.updateAdres);

// DELETE /api/adresler/:id -> Adres sil
router.delete('/:id', adreslerController.deleteAdres);

module.exports = router;
