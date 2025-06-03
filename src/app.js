import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.config.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Veritabanı bağlantısı
connectDB()
  .then(pool => {
    app.locals.pool = pool;
    console.log('MS SQL Server bağlantısı başarılı');
  })
  .catch(err => {
    console.error('MS SQL Server bağlantı hatası:', err);
  });

// 404 handler
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ message: 'Endpoint bulunamadı' });
});

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
  console.error('Hata:', err.stack);
  res.status(500).json({ message: 'Bir hata oluştu!', error: err.message });
});

const adreslerRouter = require("../server/routes/adresler.js");
app.use("/api/adresler", adreslerRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 