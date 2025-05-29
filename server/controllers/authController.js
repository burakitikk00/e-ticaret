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

// Normal kullanıcı kaydı
const register = async (req, res) => {
    try {
        const { email, password, username } = req.body;
        console.log('Kayıt denemesi başladı:', { email, username });

        // Veritabanı bağlantısını kontrol et
        if (!sql) {
            console.error('Veritabanı bağlantısı bulunamadı');
            return res.status(500).json({ 
                success: false, 
                message: 'Veritabanı bağlantı hatası' 
            });
        }

        // Email'in daha önce kullanılıp kullanılmadığını kontrol et
        const existingEmail = await sql.query`
            SELECT UserID FROM dbo.Users 
            WHERE Email = ${email}
        `;

        if (existingEmail.recordset.length > 0) {
            console.log('Bu email zaten kayıtlı:', email);
            return res.status(400).json({
                success: false,
                message: 'Bu email adresi zaten kayıtlı'
            });
        }

        // Kullanıcı adının daha önce kullanılıp kullanılmadığını kontrol et
        const existingUsername = await sql.query`
            SELECT UserID FROM dbo.Users 
            WHERE Username = ${username}
        `;

        if (existingUsername.recordset.length > 0) {
            console.log('Bu kullanıcı adı zaten kullanımda:', username);
            return res.status(400).json({
                success: false,
                message: 'Bu kullanıcı adı zaten kullanımda. Lütfen başka bir kullanıcı adı seçin.'
            });
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Şifre hash\'lendi');

        // Kullanıcıyı veritabanına kaydet ve UserID'yi al
        console.log('SQL sorgusu çalıştırılıyor...');
        
        // Önce kullanıcıyı ekle
        const insertResult = await sql.query`
            INSERT INTO dbo.Users (Email, Password, Username, UserType)
            VALUES (${email}, ${hashedPassword}, ${username}, 'user');
        `;

        console.log('INSERT sonucu:', {
            rowsAffected: insertResult.rowsAffected,
            output: insertResult.output
        });

        // Sonra eklenen kullanıcının ID'sini al
        const userResult = await sql.query`
            SELECT UserID, Email, Username, UserType
            FROM dbo.Users
            WHERE Email = ${email}
        `;

        console.log('SELECT sonucu:', {
            recordset: userResult.recordset,
            rowsAffected: userResult.rowsAffected
        });

        if (!userResult.recordset || userResult.recordset.length === 0) {
            console.error('Kullanıcı kaydedildi ancak bilgileri alınamadı');
            return res.status(500).json({
                success: false,
                message: 'Kullanıcı kaydedildi ancak bilgileri alınamadı'
            });
        }

        const user = userResult.recordset[0];
        console.log('Kaydedilen kullanıcı bilgileri:', user);

        // Başarılı yanıt
        const response = {
            success: true,
            message: 'Kayıt başarılı',
            userId: user.UserID,
            user: {
                email: user.Email,
                username: user.Username,
                userType: user.UserType
            }
        };
        
        console.log('Gönderilecek yanıt:', response);
        res.status(201).json(response);

    } catch (error) {
        console.error('Kayıt hatası detayları:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            state: error.state
        });

        // SQL hata kodlarını kontrol et
        if (error.code === 'EREQUEST') {
            console.error('SQL hatası:', error.originalError);
            
            // Benzersiz kısıtlama hatası için özel mesaj
            if (error.message.includes('UNIQUE KEY constraint')) {
                if (error.message.includes('Username')) {
                    return res.status(400).json({
                        success: false,
                        message: 'Bu kullanıcı adı zaten kullanımda. Lütfen başka bir kullanıcı adı seçin.'
                    });
                }
            }
            
            return res.status(500).json({
                success: false,
                message: 'Veritabanı işlemi sırasında bir hata oluştu'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Kayıt işlemi sırasında bir hata oluştu: ' + error.message
        });
    }
};

// Normal kullanıcı girişi
const login = async (req, res) => {
    try {
        const { email, username, password, loginType } = req.body;
        console.log('Giriş denemesi başladı:', { loginType, email, username });

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
        let result;
        
        if (loginType === 'email') {
            result = await sql.query`
                SELECT UserID, Email, Password, Username, UserType 
                FROM dbo.Users 
                WHERE Email = ${email}
            `;
        } else {
            result = await sql.query`
                SELECT UserID, Email, Password, Username, UserType 
                FROM dbo.Users 
                WHERE Username = ${username}
            `;
        }

        console.log('Veritabanı sonucu:', {
            recordCount: result.recordset.length,
            userFound: result.recordset.length > 0
        });

        if (result.recordset.length === 0) {
            console.log('Kullanıcı bulunamadı');
            return res.status(401).json({ 
                success: false, 
                message: loginType === 'email' ? 'Email veya şifre hatalı' : 'Kullanıcı adı veya şifre hatalı'
            });
        }

        const user = result.recordset[0];
        console.log('Kullanıcı bulundu:', { 
            userId: user.UserID, 
            userType: user.UserType,
            hasPassword: !!user.Password,
            passwordLength: user.Password?.length
        });

        // Şifre kontrolü
        let isPasswordValid = false;
        
        try {
            // Veritabanındaki şifre hash'lenmiş mi kontrol et
            if (user.Password.startsWith('$2')) {
                console.log('Hash\'lenmiş şifre kontrolü yapılıyor...');
                isPasswordValid = await bcrypt.compare(password, user.Password);
                console.log('Şifre karşılaştırma sonucu:', isPasswordValid);
            } else {
                console.log('Hash\'lenmemiş şifre kontrolü yapılıyor...');
                isPasswordValid = (user.Password === password);
                console.log('Şifre karşılaştırma sonucu:', isPasswordValid);
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
                message: loginType === 'email' ? 'Email veya şifre hatalı' : 'Kullanıcı adı veya şifre hatalı'
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
        const response = {
            success: true,
            token,
            user: {
                id: user.UserID,
                email: user.Email,
                username: user.Username,
                userType: user.UserType
            }
        };

        console.log('Gönderilecek yanıt:', {
            success: response.success,
            hasToken: !!response.token,
            userId: response.user.id,
            userType: response.user.userType
        });

        res.json(response);

    } catch (error) {
        console.error('Giriş hatası detayları:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        res.status(500).json({ 
            success: false, 
            message: 'Giriş yapılırken bir hata oluştu: ' + error.message 
        });
    }
};

module.exports = {
    adminLogin,
    changePassword,
    register,
    login
}; 