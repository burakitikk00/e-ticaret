const sql = require('mssql');
const config = require('../config/db');

// Ürün-kategori ilişkisini kaydet
const createProductCategory = async (req, res) => {
  try {
    const { ProductID, CategoriesID } = req.body;
    console.log('Gelen veri:', { ProductID, CategoriesID }); // Gelen veriyi logla

    // Gerekli alanların kontrolü
    if (!ProductID || !CategoriesID) {
      console.log('Eksik veri:', { ProductID, CategoriesID }); // Eksik veriyi logla
      return res.status(400).json({
        success: false,
        message: 'ProductID ve CategoriesID alanları zorunludur'
      });
    }

    // Veritabanı bağlantısı
    const pool = await sql.connect(config);
    console.log('Veritabanı bağlantısı başarılı');

    // Önce ürün ve kategorinin var olup olmadığını kontrol et
    const productCheck = await pool.request()
      .input('ProductID', sql.Int, ProductID)
      .query('SELECT COUNT(*) as count FROM dbo.Products WHERE ProductID = @ProductID');

    const categoryCheck = await pool.request()
      .input('CategoriesID', sql.Int, CategoriesID)
      .query('SELECT COUNT(*) as count FROM dbo.Categories WHERE CategoriesID = @CategoriesID');

    console.log('Kontrol sonuçları:', {
      productExists: productCheck.recordset[0].count > 0,
      categoryExists: categoryCheck.recordset[0].count > 0
    });

    if (productCheck.recordset[0].count === 0) {
      return res.status(400).json({
        success: false,
        message: `ProductID ${ProductID} bulunamadı`
      });
    }

    if (categoryCheck.recordset[0].count === 0) {
      return res.status(400).json({
        success: false,
        message: `CategoriesID ${CategoriesID} bulunamadı`
      });
    }

    // Aynı ilişkinin var olup olmadığını kontrol et
    const existingCheck = await pool.request()
      .input('ProductID', sql.Int, ProductID)
      .input('CategoriesID', sql.Int, CategoriesID)
      .query('SELECT COUNT(*) as count FROM dbo.ProductCategories WHERE ProductID = @ProductID AND CategoriesID = @CategoriesID');

    if (existingCheck.recordset[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu ürün-kategori ilişkisi zaten mevcut'
      });
    }

    // Ürün-kategori ilişkisini kaydet
    const result = await pool.request()
      .input('ProductID', sql.Int, ProductID)
      .input('CategoriesID', sql.Int, CategoriesID)
      .query(`
        INSERT INTO dbo.ProductCategories (ProductID, CategoriesID)
        VALUES (@ProductID, @CategoriesID);
        SELECT SCOPE_IDENTITY() as id;
      `);

    console.log('Kayıt sonucu:', result.recordset);

    res.status(201).json({
      success: true,
      message: 'Ürün-kategori ilişkisi başarıyla kaydedildi',
      data: {
        id: result.recordset[0].id,
        ProductID,
        CategoriesID
      }
    });

  } catch (error) {
    console.error('Ürün-kategori kayıt hatası detayı:', {
      message: error.message,
      code: error.code,
      state: error.state,
      class: error.class,
      lineNumber: error.lineNumber,
      serverName: error.serverName,
      procName: error.procName
    });
    
    res.status(500).json({
      success: false,
      message: 'Ürün-kategori ilişkisi kaydedilirken bir hata oluştu',
      error: error.message
    });
  } finally {
    sql.close();
  }
};

// Ürünün kategorilerini getir
const getProductCategories = async (req, res) => {
  try {
    const { productId } = req.params;

    await sql.connect(config);

    const result = await sql.query`
      SELECT c.CategoriesID, c.CategoriesName
      FROM dbo.ProductCategories pc
      INNER JOIN dbo.Categories c ON pc.CategoriesID = c.CategoriesID
      WHERE pc.ProductID = ${productId}
    `;

    res.status(200).json({
      success: true,
      data: result.recordset
    });

  } catch (error) {
    console.error('Kategori getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kategoriler getirilirken bir hata oluştu',
      error: error.message
    });
  } finally {
    sql.close();
  }
};

module.exports = {
  createProductCategory,
  getProductCategories
}; 