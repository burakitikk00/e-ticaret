const Adres = require("../models/Adres");

// Adres ekleme fonksiyonu
exports.createAdres = async (req, res) => {
    try {
        // Kullanıcı ID'sini JWT'den alıyoruz (auth middleware'den gelir)
        const userID = req.user.userId; // DÜZELTİLDİ: userId olarak alıyoruz
        
        // Adres verilerini hazırla
        const adresData = {
            ...req.body,
            userID // userID'yi ekle
        };

        // Adresi kaydet
        const yeniAdres = await Adres.create(adresData);
        
        res.json({ 
            success: true, 
            message: "Adres başarıyla kaydedildi",
            address: yeniAdres 
        });
    } catch (err) {
        console.error("Adres eklenirken hata:", err);
        res.status(500).json({ 
            success: false, 
            error: "Adres kaydedilemedi",
            details: err.message 
        });
    }
};

// Kullanıcının adreslerini getirme fonksiyonu
exports.getAdresler = async (req, res) => {
    try {
        // Kullanıcı ID'sini JWT'den alıyoruz (auth middleware'den gelir)
        const userID = req.user.userId; // DÜZELTİLDİ: userId olarak alıyoruz
        const adresler = await Adres.getByUserId(userID);
        
        res.json({ 
            success: true, 
            addresses: adresler 
        });
    } catch (err) {
        console.error("Adresler getirilirken hata:", err);
        res.status(500).json({ 
            success: false, 
            error: "Adresler getirilemedi",
            details: err.message 
        });
    }
};

// Adres güncelleme fonksiyonu
exports.updateAdres = async (req, res) => {
    try {
        const userID = req.user.userId; // JWT'den kullanıcı ID
        const adresId = req.params.id;
        const adresData = req.body;
        // Sadece kendi adresini güncelleyebilsin
        const updated = await Adres.update(adresId, userID, adresData);
        if (updated) {
            res.json({ success: true, message: "Adres başarıyla güncellendi" });
        } else {
            res.status(404).json({ success: false, error: "Adres bulunamadı veya yetkisiz işlem" });
        }
    } catch (err) {
        console.error("Adres güncellenirken hata:", err);
        res.status(500).json({ success: false, error: "Adres güncellenemedi", details: err.message });
    }
};

// Adres silme fonksiyonu
exports.deleteAdres = async (req, res) => {
    try {
        const userID = req.user.userId;
        const adresId = req.params.id;
        const deleted = await Adres.delete(adresId, userID);
        if (deleted) {
            res.json({ success: true, message: "Adres başarıyla silindi" });
        } else {
            res.status(404).json({ success: false, error: "Adres bulunamadı veya yetkisiz işlem" });
        }
    } catch (err) {
        console.error("Adres silinirken hata:", err);
        res.status(500).json({ success: false, error: "Adres silinemedi", details: err.message });
    }
};
