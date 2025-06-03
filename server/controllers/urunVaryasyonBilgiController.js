const { insertUrunVaryasyonBilgi } = require('../models/UrunVaryasyonBilgi');

// POST /api/urunvaryasyonkaydet
exports.kaydet = async (req, res) => {
  try {
    console.log('Gelen request body:', req.body); // Gelen veriyi logla
    
    const dataArr = Array.isArray(req.body) ? req.body : [req.body];
    console.log('İşlenecek veri dizisi:', dataArr); // İşlenecek veriyi logla
    
    const results = [];
    for (const data of dataArr) {
      console.log('İşlenen veri:', data); // Her bir veriyi logla
      
      // Zorunlu alan kontrolü
      if (!data.ProductID) {
        console.error('ProductID eksik:', data); // Hata durumunu logla
        return res.status(400).json({ 
          success: false, 
          message: 'ProductID zorunludur.',
          receivedData: data // Hangi veri geldiğini göster
        });
      }

      // Veri tiplerini kontrol et
      if (typeof data.ProductID !== 'number') {
        console.error('ProductID sayı değil:', data.ProductID); // Tip hatasını logla
        return res.status(400).json({ 
          success: false, 
          message: 'ProductID sayı olmalıdır.',
          receivedData: data
        });
      }

      // Kayıt ekle
      try {
        const kayit = await insertUrunVaryasyonBilgi(data);
        console.log('Kayıt başarılı:', kayit); // Başarılı kaydı logla
        results.push(kayit);
      } catch (dbError) {
        console.error('Veritabanı kayıt hatası:', dbError); // DB hatasını logla
        throw dbError;
      }
    }

    res.status(201).json({ 
      success: true, 
      message: 'Kayıt(lar) başarıyla eklendi.', 
      data: results 
    });
  } catch (err) {
    console.error('urunvaryasyonbilgi kayıt hatası detayı:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      state: err.state
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Kayıt eklenirken hata oluştu.',
      error: err.message 
    });
  }
}; 