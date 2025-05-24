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
-- Ürün Varyasyonları tablosu
CREATE TABLE Variations (
    VariationID INT IDENTITY(1,1) PRIMARY KEY,
    VariationName NVARCHAR(100) NOT NULL, -- Varyasyon adı (örn: Renk, Beden)
    
);

-- Varyasyon Seçenekleri tablosu (Renk seçenekleri için)
CREATE TABLE VariationOptions (
    OptionID INT IDENTITY(1,1) PRIMARY KEY,
    VariationID INT NOT NULL,
    OptionName NVARCHAR(50) NOT NULL, -- Seçenek değeri (örn: Kırmızı, Mavi, Yeşil)

    FOREIGN KEY (VariationID) REFERENCES Variations(VariationID)
);

-- Örnek renk varyasyonu ve seçenekleri ekleme
INSERT INTO tVariations (VariationName)
VALUES ('Renk');

-- Renk seçeneklerini ekleme
INSERT INTO VariationOptions (VariationID, OptionName)
VALUES 
    (1, 'Kırmızı'),
    (1, 'Mavi'),
    (1, 'Yeşil');



-- Ürünler tablosu

-- Ürün Varyasyonları tablosu

-- Ürün Kombinasyonları tablosu


-- Kombinasyon-Varyasyon ilişki tablosu


-- Siparişler tablosu

-- Sipariş Detayları tablosu

-- Sepet tablosu

-- Ürün Yorumları tablosu

-- Kuponlar tablosu


-- Kupon Kullanım tablosu

-- Kargo Firmaları tablosu

-- Kargo Takip tablosu

-- Ödeme İşlemleri tablosu


-- Ürün Etiketleri tablosu

-- Ürün-Etiket ilişki tablosu


-- Ürün Özellikleri tablosu

-- Ürün Özellik Değerleri tablosu

-- Müşteri Puanları tablosu


-- Puan İşlem Geçmişi tablosu


-- Siparişler tablosuna kupon ve kargo bilgileri eklendi

-- Varyasyon Seçenekleri tablosu
