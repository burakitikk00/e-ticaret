const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Veritabanı bağlantısı

// Products tablosu için model tanımı
dbo_Products = sequelize.define('dbo_Products', {
  ProductID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    comment: 'Benzersiz ürün ID'
  },
  ProductName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Ürün adı'
  },
  Description: {
    type: DataTypes.STRING(3000),
    allowNull: true,
    comment: 'Ürün açıklaması'
  },
  BasePrice: {
    type: DataTypes.DECIMAL(18,2),
    allowNull: false,
    comment: 'Ürün satış fiyatı'
  },
  Currency: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'Para birimi (TL, USD, EUR)'
  },
  Stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Stok adedi'
  },
  ShippingType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Kargo tipi'
  },
  ShippingCost: {
    type: DataTypes.DECIMAL(18,2),
    allowNull: true,
    comment: 'Kargo ücreti'
  },
  ProductType: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Ürün tipi (Fiziksel/Dijital)'
  },
  Language: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Dil'
  },
  IsDiscounted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'İndirimli mi?'
  },
  CreatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Oluşturulma tarihi'
  },
  UpdatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Güncellenme tarihi'
  },
  ImageURL: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Ürün ana görseli URL'
  }
}, {
  tableName: 'dbo.Products', // MSSQL için tablo adı
  timestamps: false // Otomatik timestamp kullanma (manuel ekledik)
});

module.exports = dbo_Products; 