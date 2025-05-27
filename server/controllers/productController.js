const { insertProduct } = require('../models/Product'); // MSSQL için yardımcı fonksiyonu import et

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
      ImageURL
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

    res.status(201).json({
      success: true,
      message: 'Ürün başarıyla eklendi',
      product: newProduct
    });
  } catch (error) {
    console.error('Ürün ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün eklenirken hata oluştu: ' + error.message
    });
  }
};
