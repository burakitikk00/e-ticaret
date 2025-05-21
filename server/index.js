const express = require('express');
const cors = require('cors');
const { connectDB, sql } = require('./config/db');
const { adminLogin, changePassword } = require('./controllers/authController');
const authMiddleware = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint'i
app.get('/api/test', async (req, res) => {
    try {
        // Tüm kullanıcıları getir
        const result = await sql.query`SELECT * FROM birincilkullanici.Users`;
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

// Server başlatma
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server ${PORT} portunda çalışıyor`);
        });
    } catch (error) {
        console.error('Server başlatma hatası:', error);
    }
};

startServer(); 