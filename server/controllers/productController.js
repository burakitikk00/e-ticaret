const { insertProduct } = require('../models/Product'); // MSSQL için yardımcı fonksiyonu import et
const { toProductOpsiyon } = require('../models/ProductOpsiyon'); // Opsiyon ekleme fonksiyonunu import et

// Ürün ekleme fonksiyonu (MSSQL)
exports.createProduct = async (req, res) => {
  try {
    // İstekten gelen verileri al
    const {
      ProductName,
      Description,
      BasePrice,
      Currency,
      Stock,
      ShippingType,
      ShippingCost,
      ProductType,
      Language,
      IsDiscounted,
      ImageURL,
      opsiyonlar // Frontend'den gelen opsiyonlar
    } = req.body;

    // MSSQL ile ürün ekle
    const newProduct = await insertProduct({
      ProductName,
      Description,
      BasePrice,
      Currency,
      Stock,
      ShippingType,
      ShippingCost,
      ProductType,
      Language,
      IsDiscounted,
      ImageURL
    });

    // Eğer opsiyonlar varsa ve en az birinin adı doluysa kaydet
    if (Array.isArray(opsiyonlar)) {
      for (const opsiyon of opsiyonlar) {
        if (opsiyon.ad && opsiyon.ad.trim() !== '') {
          await toProductOpsiyon(newProduct.ProductID, opsiyon.ad, opsiyon.fiyat || null);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Ürün başarıyla eklendi',
      ProductID: newProduct.ProductID
    });
  } catch (error) {
    console.error('Ürün ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün eklenirken hata oluştu: ' + error.message
    });
  }
};
