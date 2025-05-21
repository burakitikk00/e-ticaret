-- Veritabanını kullan
USE DBLinaButik;
GO
 
-- Kullanıcılar tablosu
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(50),
    LastName NVARCHAR(50),
    PhoneNumber NVARCHAR(20),
    UserType NVARCHAR(20) DEFAULT 'customer', -- Kullanıcı tipi (user/admin)
    IsActive BIT DEFAULT 1, -- Hesap aktif mi?
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Admin kullanıcısı için varsayılan değer ekleme
INSERT INTO Users (Username, Email, Password, UserType, IsActive)
VALUES ('admin', 'admin@linabutik.com', 'admin123','admin',1);

-- Kullanıcı Adresleri tablosu
CREATE TABLE UserAddresses (
    AddressID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT,
    AddressTitle NVARCHAR(50), -- Adres başlığı (Ev, İş vb.)
    FullAddress NVARCHAR(500) NOT NULL,
    City NVARCHAR(50),
    District NVARCHAR(50),
    PostalCode NVARCHAR(20),
    IsDefault BIT DEFAULT 0, -- Varsayılan adres mi?
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Kategoriler tablosu
CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    ParentCategoryID INT,
    FOREIGN KEY (ParentCategoryID) REFERENCES Categories(CategoryID)
);

-- Ürünler tablosu
CREATE TABLE Products (
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryID INT,
    ProductName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    Price DECIMAL(10,2) NOT NULL,
    StockQuantity INT NOT NULL DEFAULT 0,
    ImageURL NVARCHAR(255),
    Status NVARCHAR(20) DEFAULT 'Active', -- Ürün durumu
    Currency NVARCHAR(10) DEFAULT 'TRY', -- Para birimi
    ShippingType NVARCHAR(50), -- Kargo tipi
    ShippingCost DECIMAL(10,2), -- Kargo ücreti
    ProductType NVARCHAR(50), -- Ürün tipi
    ProductLanguage NVARCHAR(20) DEFAULT 'tr', -- Ürün dili
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

-- Ürün Varyasyonları tablosu
CREATE TABLE ProductVariations (
    VariationID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT,
    VariationName NVARCHAR(100) NOT NULL, -- Varyasyon adı (Renk, Beden vb.)
    VariationValue NVARCHAR(100) NOT NULL, -- Varyasyon değeri (Kırmızı, XL vb.)
    StockQuantity INT NOT NULL DEFAULT 0,
    Price DECIMAL(10,2), -- Varyasyon özel fiyatı (opsiyonel)
    SKU NVARCHAR(50), -- Stok kodu
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

-- Ürün Kombinasyonları tablosu
CREATE TABLE ProductCombinations (
    CombinationID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT,
    CombinationName NVARCHAR(100) NOT NULL, -- Kombinasyon adı
    StockQuantity INT NOT NULL DEFAULT 0,
    Price DECIMAL(10,2), -- Kombinasyon özel fiyatı
    SKU NVARCHAR(50), -- Stok kodu
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

-- Kombinasyon-Varyasyon ilişki tablosu
CREATE TABLE CombinationVariations (
    CombinationVariationID INT IDENTITY(1,1) PRIMARY KEY,
    CombinationID INT,
    VariationID INT,
    FOREIGN KEY (CombinationID) REFERENCES ProductCombinations(CombinationID),
    FOREIGN KEY (VariationID) REFERENCES ProductVariations(VariationID)
);

-- Siparişler tablosu
CREATE TABLE Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    OrderNumber NVARCHAR(50) NOT NULL UNIQUE, -- Sipariş numarası
    UserID INT,
    OrderDate DATETIME DEFAULT GETDATE(),
    Status NVARCHAR(20) DEFAULT 'Pending', -- Sipariş durumu
    CustomerName NVARCHAR(100), -- Müşteri adı
    CustomerEmail NVARCHAR(100), -- Müşteri email
    CustomerPhone NVARCHAR(20), -- Müşteri telefon
    ShippingAddress NVARCHAR(500), -- Kargo adresi
    CustomerNote NVARCHAR(MAX), -- Müşteri notu
    TotalAmount DECIMAL(10,2) NOT NULL,
    PaymentMethod NVARCHAR(50),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Sipariş Detayları tablosu
CREATE TABLE OrderDetails (
    OrderDetailID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT,
    ProductID INT,
    VariationID INT, -- Varyasyon ID (opsiyonel)
    CombinationID INT, -- Kombinasyon ID (opsiyonel)
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    TotalPrice DECIMAL(10,2) NOT NULL,
    ProductImage NVARCHAR(255), -- Ürün resmi
    ProductOptions NVARCHAR(MAX), -- Ürün opsiyonları (JSON formatında)
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (VariationID) REFERENCES ProductVariations(VariationID),
    FOREIGN KEY (CombinationID) REFERENCES ProductCombinations(CombinationID)
);

-- Sepet tablosu
CREATE TABLE Cart (
    CartID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT,
    ProductID INT,
    VariationID INT, -- Varyasyon ID (opsiyonel)
    CombinationID INT, -- Kombinasyon ID (opsiyonel)
    Quantity INT NOT NULL DEFAULT 1,
    AddedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (VariationID) REFERENCES ProductVariations(VariationID),
    FOREIGN KEY (CombinationID) REFERENCES ProductCombinations(CombinationID)
);

-- Ürün Yorumları tablosu
CREATE TABLE ProductReviews (
    ReviewID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT,
    UserID INT,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment NVARCHAR(MAX),
    ReviewDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Kuponlar tablosu
CREATE TABLE Coupons (
    CouponID INT IDENTITY(1,1) PRIMARY KEY,
    CouponCode NVARCHAR(50) NOT NULL UNIQUE,
    DiscountType NVARCHAR(20) NOT NULL, -- 'Percentage' veya 'FixedAmount'
    DiscountValue DECIMAL(10,2) NOT NULL,
    MinPurchaseAmount DECIMAL(10,2), -- Minimum alışveriş tutarı
    MaxDiscountAmount DECIMAL(10,2), -- Maksimum indirim tutarı
    StartDate DATETIME NOT NULL,
    EndDate DATETIME NOT NULL,
    UsageLimit INT, -- Toplam kullanım limiti
    UsedCount INT DEFAULT 0, -- Kullanım sayısı
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Kupon Kullanım tablosu
CREATE TABLE CouponUsage (
    UsageID INT IDENTITY(1,1) PRIMARY KEY,
    CouponID INT,
    UserID INT,
    OrderID INT,
    UsedAt DATETIME DEFAULT GETDATE(),
    DiscountAmount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (CouponID) REFERENCES Coupons(CouponID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
);

-- Kargo Firmaları tablosu
CREATE TABLE ShippingCompanies (
    CompanyID INT IDENTITY(1,1) PRIMARY KEY,
    CompanyName NVARCHAR(100) NOT NULL,
    TrackingUrlTemplate NVARCHAR(255), -- Kargo takip URL şablonu
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Kargo Takip tablosu
CREATE TABLE ShipmentTracking (
    TrackingID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT,
    CompanyID INT,
    TrackingNumber NVARCHAR(100),
    Status NVARCHAR(50),
    EstimatedDeliveryDate DATETIME,
    ActualDeliveryDate DATETIME,
    TrackingHistory NVARCHAR(MAX), -- JSON formatında takip geçmişi
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (CompanyID) REFERENCES ShippingCompanies(CompanyID)
);

-- Ödeme İşlemleri tablosu
CREATE TABLE PaymentTransactions (
    TransactionID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT,
    PaymentMethod NVARCHAR(50) NOT NULL,
    TransactionNumber NVARCHAR(100),
    Amount DECIMAL(10,2) NOT NULL,
    Currency NVARCHAR(10) DEFAULT 'TRY',
    Status NVARCHAR(50) NOT NULL,
    PaymentDate DATETIME,
    ErrorMessage NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
);

-- Ürün Etiketleri tablosu
CREATE TABLE ProductTags (
    TagID INT IDENTITY(1,1) PRIMARY KEY,
    TagName NVARCHAR(50) NOT NULL UNIQUE,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Ürün-Etiket ilişki tablosu
CREATE TABLE ProductTagRelations (
    ProductID INT,
    TagID INT,
    PRIMARY KEY (ProductID, TagID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (TagID) REFERENCES ProductTags(TagID)
);

-- Ürün Özellikleri tablosu
CREATE TABLE ProductAttributes (
    AttributeID INT IDENTITY(1,1) PRIMARY KEY,
    AttributeName NVARCHAR(100) NOT NULL,
    AttributeType NVARCHAR(50) NOT NULL, -- 'Text', 'Number', 'Boolean', 'Select' vb.
    IsRequired BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Ürün Özellik Değerleri tablosu
CREATE TABLE ProductAttributeValues (
    ValueID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT,
    AttributeID INT,
    AttributeValue NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (AttributeID) REFERENCES ProductAttributes(AttributeID)
);

-- Müşteri Puanları tablosu
CREATE TABLE CustomerPoints (
    PointID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT,
    Points INT NOT NULL DEFAULT 0,
    PointsEarned INT DEFAULT 0,
    PointsSpent INT DEFAULT 0,
    LastUpdated DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Puan İşlem Geçmişi tablosu
CREATE TABLE PointTransactions (
    TransactionID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT,
    Points INT NOT NULL,
    TransactionType NVARCHAR(50) NOT NULL, -- 'Earn', 'Spend', 'Expire'
    Description NVARCHAR(255),
    RelatedOrderID INT,
    ExpiryDate DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (RelatedOrderID) REFERENCES Orders(OrderID)
);

-- Siparişler tablosuna kupon ve kargo bilgileri eklendi
ALTER TABLE Orders
ADD CouponID INT,
    ShippingCompanyID INT,
    TrackingNumber NVARCHAR(100),
    FOREIGN KEY (CouponID) REFERENCES Coupons(CouponID),
    FOREIGN KEY (ShippingCompanyID) REFERENCES ShippingCompanies(CompanyID); 