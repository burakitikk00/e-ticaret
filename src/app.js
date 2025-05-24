const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db.config');
const varyasyonRoutes = require('./routes/varyasyonRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Veritabanı bağlantısı
connectDB()
  .then(pool => {
    app.locals.pool = pool;
    console.log('MS SQL Server bağlantısı başarılı');
  })
  .catch(err => {
    console.error('MS SQL Server bağlantı hatası:', err);
  });

// Routes
app.use('/api/varyasyonlar', varyasyonRoutes);

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Bir hata oluştu!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 