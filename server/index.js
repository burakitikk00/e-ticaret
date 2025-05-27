const express = require('express');
const cors = require('cors');
const path = require('path');
const { config, sql, testConnection } = require('./config/db.config');
const { adminLogin, changePassword } = require('./controllers/authController');
const authMiddleware = require('./middleware/auth');
const variationRoutes = require('./routes/variationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productCategoryRoutes = require('./routes/productCategoryRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
    console.error('Uygulama hatası:', err);
    res.status(500).json({
        success: false,
        message: 'Sunucu hatası: ' + err.message
    });
});

// Test endpoint'i
app.get('/api/test', async (req, res) => {
    try {
        // Tüm kullanıcıları getir
        const pool = await sql.connect(config);
        const result = await pool.request().query`SELECT * FROM dbo.Users`;
        console.log('Veritabanı sonucu:', result.recordset);
        
        res.json({
            success: true,
            message: 'Veritabanı bağlantısı başarılı',
            data: result.recordset
        });
    } catch (error) {
        console.error('Test hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Veritabanı hatası: ' + error.message
        });
    }
});

// Routes
app.post('/api/auth/admin-login', adminLogin);
app.post('/api/auth/change-password', authMiddleware, changePassword);

// Varyasyon rotaları
app.use('/api/variations', variationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/product-categories', productCategoryRoutes);

// Server başlatma
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        console.log('Veritabanına bağlanılıyor...');
        const isConnected = await testConnection();
        if (!isConnected) {
            throw new Error('Veritabanı bağlantısı başarısız');
        }
        
        app.listen(PORT, () => {
            console.log(`Server ${PORT} portunda çalışıyor`);
        });
    } catch (error) {
        console.error('Server başlatma hatası:', error);
        process.exit(1);
    }
};

// İşlenmeyen hataları yakala
process.on('unhandledRejection', (err) => {
    console.error('İşlenmeyen Promise reddi:', err);
    // process.exit(1); // Üretimde kullanılmalı, geliştirme sırasında yorum satırı yapılabilir
});

process.on('uncaughtException', (err) => {
    console.error('Yakalanmamış hata:', err);
    // process.exit(1); // Üretimde kullanılmalı, geliştirme sırasında yorum satırı yapılabilir
});

startServer(); 