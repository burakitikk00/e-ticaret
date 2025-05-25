const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Dosya işlemleri için fs modülünü ekle

// Yüklenen dosyaların nereye kaydedileceğini ve dosya adını belirle
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 'uploads' klasörüne kaydedilecek
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Dosya adını orijinal ad + tarih damgası + uzantı olarak belirle
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Görsel yükleme middleware'i
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Max dosya boyutu 1MB
    fileFilter: (req, file, cb) => {
        // Sadece görsellere izin ver
        checkFileType(file, cb);
    }
}).single('image'); // 'image' frontend'den gelecek dosyanın input name'i olacak

// Dosya tipini kontrol etme fonksiyonu
function checkFileType(file, cb) {
    // İzin verilen uzantılar
    const filetypes = /jpeg|jpg|png|gif/;
    // Uzantıyı kontrol et
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Mime tipini kontrol et
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Hata: Sadece görsel yükleyebilirsiniz!');
    }
}

// Görsel yükleme endpoint'i için controller fonksiyonu
exports.uploadImage = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.error('Görsel yükleme hatası:', err);
            res.status(400).json({ message: err });
        } else {
            if (req.file == undefined) {
                res.status(400).json({ message: 'Hata: Görsel Seçilmedi!' });
            } else {
                // Yüklenen görselin URL'sini döndür
                // Gerçek URL backend'in çalıştığı adrese göre değişir
                // Örneğin: http://localhost:5000/uploads/resim-1678888888888.png
                res.json({
                    message: 'Görsel başarıyla yüklendi',
                    imageUrl: `/uploads/${req.file.filename}`, // Frontend'de kullanılacak yol
                    filename: req.file.filename // Silme işlemi için dosya adını da döndür
                });
            }
        }
    });
};

// Görsel silme endpoint'i için controller fonksiyonu
exports.deleteImage = (req, res) => {
    const filename = req.params.filename; // URL'den dosya adını al
    const filePath = path.join(__dirname, '../uploads', filename); // Tam dosya yolunu oluştur

    console.log(`Görsel siliniyor: ${filePath}`);

    // Dosyanın varlığını kontrol et ve sil
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Görsel silinirken hata:', err);
            // Dosya bulunamazsa 404 döndür, diğer hatalarda 500
            if (err.code === 'ENOENT') {
                res.status(404).json({ message: 'Görsel bulunamadı' });
            } else {
                res.status(500).json({ message: 'Görsel silinirken sunucu hatası', error: err.message });
            }
        } else {
            console.log(`Görsel başarıyla silindi: ${filePath}`);
            res.json({ message: 'Görsel başarıyla silindi' });
        }
    });
};
