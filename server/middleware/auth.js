const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Token'ı header'dan al
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Yetkilendirme token\'ı bulunamadı'
            });
        }

        // Token'ı ayıkla
        const token = authHeader.split(' ')[1];

        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli-anahtar');
        
        // Kullanıcı bilgilerini request'e ekle
        req.user = decoded;
        
        next();
    } catch (error) {
        console.error('Token doğrulama hatası:', error);
        return res.status(401).json({
            success: false,
            message: 'Geçersiz token'
        });
    }
};

module.exports = authMiddleware; 