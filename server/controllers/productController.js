const { insertProduct, deleteProduct, updateProductStatus, getProductById, getAllProductsWithCategory, getProductsByCategory } = require('../models/Product'); // Yeni fonksiyonları import ettim
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
// Tüm ürünleri getir (MSSQL)
exports.getAllProducts = async (req, res) => {
  try {
    const { kategori } = req.query; // URL'den kategori parametresini al
    
    // Eğer kategori parametresi varsa, o kategoriye göre filtrele
    const products = kategori 
      ? await getProductsByCategory(kategori)
      : await getAllProductsWithCategory();
    
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Ürünleri getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Ürünleri getirirken hata oluştu: ' + error.message });
  }
};

// Ürünü silme controller'ı
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteProduct(Number(id));
    res.status(200).json({ success: true, message: 'Ürün silindi' });
  } catch (error) {
    console.error('Ürün silme hatası:', error);
    res.status(500).json({ success: false, message: 'Ürün silinirken hata oluştu: ' + error.message });
  }
};

// Ürün durumunu güncelleme controller'ı (Aktif/Pasif - Status alanı)
exports.updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Body'den status değerini al (1 veya 0)
    console.log(`API üzerinden durum güncelleme isteği: Ürün ID: ${id}, Body Status: ${status}`); // Log ekledim

    // Status değeri bit tipinde olduğu için direkt kullanabiliriz
    await updateProductStatus(Number(id), status);

    res.status(200).json({ success: true, message: 'Ürün durumu güncellendi' });
  } catch (error) {
    console.error('API durum güncelleme hatası:', error); // Log ekledim
    res.status(500).json({ success: false, message: 'Durum güncellenirken hata oluştu: ' + error.message });
  }
};

// ID ile ürün detayını getirme controller'ı
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductById(Number(id));
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Ürün getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Ürün getirilirken hata oluştu: ' + error.message });
  }
};