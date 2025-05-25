    // server/routes/uploadRoutes.js
    const express = require('express');
    const router = express.Router();
    const uploadController = require('../controllers/uploadController');
    const variationController = require('../controllers/variationController');

    // Görsel yükleme endpoint'i
    router.post('/image', uploadController.uploadImage);
    // Görsel silme rotasını ekleyin
    router.delete('/image/:filename', uploadController.deleteImage);

    module.exports = router;