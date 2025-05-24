const { sql } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin girişi kontrolü
const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Giriş denemesi başladı:', { username });

        // Veritabanı bağlantısını kontrol et
        if (!sql) {
            console.error('Veritabanı bağlantısı bulunamadı');
            return res.status(500).json({ 
                success: false, 
                message: 'Veritabanı bağlantı hatası' 
            });
        }

        // Kullanıcıyı veritabanında ara
        console.log('SQL sorgusu çalıştırılıyor...');
        const result = await sql.query`
            SELECT UserID, Username, Password, UserType 
            FROM dbo.Users 
            WHERE Username = ${username} AND UserType = 'admin'
        `;

        console.log('Veritabanı sonucu:', result.recordset);

        if (result.recordset.length === 0) {
            console.log('Kullanıcı bulunamadı');
            return res.status(401).json({ 
                success: false, 
                message: 'Kullanıcı adı veya şifre hatalı' 
            });
        }

        const user = result.recordset[0];
        console.log('Kullanıcı bulundu:', { userId: user.UserID, userType: user.UserType });

        // Şifre kontrolü
        let isPasswordValid = false;
        
        try {
            // Eğer veritabanındaki şifre hash'lenmemişse, gelen şifreyi direkt karşılaştır
            if (!user.Password.startsWith('$2')) {
                isPasswordValid = (user.Password === password);
                console.log('Hash\'lenmemiş şifre kontrolü yapıldı');
            } else {
                // Veritabanındaki şifre hash'lenmiş, bcrypt ile karşılaştır
                isPasswordValid = await bcrypt.compare(password, user.Password);
                console.log('Hash\'lenmiş şifre kontrolü yapıldı');
            }
        } catch (passwordError) {
            console.error('Şifre kontrolü hatası:', passwordError);
            return res.status(500).json({ 
                success: false, 
                message: 'Şifre doğrulama hatası' 
            });
        }

        if (!isPasswordValid) {
            console.log('Şifre doğrulaması başarısız');
            return res.status(401).json({ 
                success: false, 
                message: 'Kullanıcı adı veya şifre hatalı' 
            });
        }

        // JWT token oluştur
        const jwtSecret = process.env.JWT_SECRET || 'gizli-anahtar';
        console.log('JWT token oluşturuluyor...');
        
        const token = jwt.sign(
            { userId: user.UserID, userType: user.UserType },
            jwtSecret,
            { expiresIn: '24h' }
        );

        console.log('Giriş başarılı, token oluşturuldu');

        // Başarılı yanıt
        res.json({
            success: true,
            token,
            user: {
                id: user.UserID,
                username: user.Username,
                userType: user.UserType
            }
        });

    } catch (error) {
        console.error('Giriş hatası detayları:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası: ' + error.message 
        });
    }
};

// Şifre değiştirme fonksiyonu
const changePassword = async (req, res) => {
    try {
        const { mevcutSifre, yeniSifre } = req.body;
        
        if (!mevcutSifre || !yeniSifre) {
            return res.status(400).json({
                success: false,
                message: 'Mevcut şifre ve yeni şifre gereklidir'
            });
        }

        const userId = req.user.userId; // JWT'den gelen kullanıcı ID'si
        console.log('Şifre değiştirme isteği:', { userId });

        // Kullanıcıyı veritabanında ara
        const result = await sql.query`
            SELECT UserID, Password 
            FROM dbo.Users 
            WHERE UserID = ${userId}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        const user = result.recordset[0];
        console.log('Kullanıcı bulundu:', { userId: user.UserID });

        // Mevcut şifreyi kontrol et
        let isPasswordValid = false;
        
        // Eğer şifre hash'lenmişse bcrypt ile karşılaştır
        if (user.Password.startsWith('$2')) {
            isPasswordValid = await bcrypt.compare(mevcutSifre, user.Password);
        } else {
            // Hash'lenmemiş şifre için direkt karşılaştır
            isPasswordValid = (user.Password === mevcutSifre);
        }

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Mevcut şifre hatalı'
            });
        }

        // Yeni şifreyi hashle
        const hashedPassword = await bcrypt.hash(yeniSifre, 10);
        console.log('Yeni şifre hash\'lendi');

        // Şifreyi güncelle
        await sql.query`
            UPDATE dbo.Users 
            SET Password = ${hashedPassword}
            WHERE UserID = ${userId}
        `;

        res.json({
            success: true,
            message: 'Şifre başarıyla değiştirildi'
        });

    } catch (error) {
        console.error('Şifre değiştirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};

module.exports = {
    adminLogin,
    changePassword
}; 