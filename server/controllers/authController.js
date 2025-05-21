const { sql } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin girişi kontrolü
const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Giriş denemesi:', { username }); // Şifreyi loglamıyoruz

        // Kullanıcıyı veritabanında ara
        const result = await sql.query`
            SELECT UserID, Username, Password, UserType 
            FROM birincilkullanici.Users 
            WHERE Username = ${username} AND UserType = 'admin'
        `;

        console.log('Veritabanı sonucu:', result.recordset);

        if (result.recordset.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Kullanıcı adı veya şifre hatalı' 
            });
        }

        const user = result.recordset[0];

        // Şifre kontrolü
        let isPasswordValid = false;
        
        // Eğer veritabanındaki şifre hash'lenmemişse, gelen şifreyi direkt karşılaştır
        if (!user.Password.startsWith('$2')) {
            isPasswordValid = (user.Password === password);
        } else {
            // Veritabanındaki şifre hash'lenmiş, bcrypt ile karşılaştır
            isPasswordValid = await bcrypt.compare(password, user.Password);
        }

        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Kullanıcı adı veya şifre hatalı' 
            });
        }

        // JWT token oluştur
        const token = jwt.sign(
            { userId: user.UserID, userType: user.UserType },
            process.env.JWT_SECRET || 'gizli-anahtar',
            { expiresIn: '24h' }
        );

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
        console.error('Giriş hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
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
            FROM birincilkullanici.Users 
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
            UPDATE birincilkullanici.Users 
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