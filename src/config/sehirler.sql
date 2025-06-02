-- Önce mevcut tabloyu silme (eğer varsa)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Sehirler')
    DROP TABLE Sehirler;

-- Yeni tablo oluşturma
CREATE TABLE Sehirler (
    id INT IDENTITY(1,1) PRIMARY KEY,
    SehirAd NVARCHAR(255)
);

-- Verileri ekleme
SET IDENTITY_INSERT Sehirler ON;

INSERT INTO Sehirler (id, SehirAd) VALUES (1,'ADANA');
INSERT INTO Sehirler (id, SehirAd) VALUES (2,'ADIYAMAN');
INSERT INTO Sehirler (id, SehirAd) VALUES (3,'AFYONKARAHISAR');
INSERT INTO Sehirler (id, SehirAd) VALUES (4,'AĞRI');
INSERT INTO Sehirler (id, SehirAd) VALUES (5,'AKSARAY');
INSERT INTO Sehirler (id, SehirAd) VALUES (6,'AMASYA');
INSERT INTO Sehirler (id, SehirAd) VALUES (7,'ANKARA');
INSERT INTO Sehirler (id, SehirAd) VALUES (8,'ANTALYA');
INSERT INTO Sehirler (id, SehirAd) VALUES (9,'ARDAHAN');
INSERT INTO Sehirler (id, SehirAd) VALUES (10,'ARTVİN');
INSERT INTO Sehirler (id, SehirAd) VALUES (11,'AYDIN');
INSERT INTO Sehirler (id, SehirAd) VALUES (12,'BALIKESİR');
INSERT INTO Sehirler (id, SehirAd) VALUES (13,'BARTIN');
INSERT INTO Sehirler (id, SehirAd) VALUES (14,'BATMAN');
INSERT INTO Sehirler (id, SehirAd) VALUES (15,'BAYBURT');
INSERT INTO Sehirler (id, SehirAd) VALUES (16,'BILECIK');
INSERT INTO Sehirler (id, SehirAd) VALUES (17,'BINGOL');
INSERT INTO Sehirler (id, SehirAd) VALUES (18,'BITLIS');
INSERT INTO Sehirler (id, SehirAd) VALUES (19,'BOLU');
INSERT INTO Sehirler (id, SehirAd) VALUES (20,'BURDUR');
INSERT INTO Sehirler (id, SehirAd) VALUES (21,'BURSA');
INSERT INTO Sehirler (id, SehirAd) VALUES (22,'ÇANAKKALE');
INSERT INTO Sehirler (id, SehirAd) VALUES (23,'ÇANKIRI');
INSERT INTO Sehirler (id, SehirAd) VALUES (24,'ÇORUM');
INSERT INTO Sehirler (id, SehirAd) VALUES (25,'DENİZLİ');
INSERT INTO Sehirler (id, SehirAd) VALUES (26,'DİYARBAKIR');
INSERT INTO Sehirler (id, SehirAd) VALUES (27,'DÜZCE');
INSERT INTO Sehirler (id, SehirAd) VALUES (28,'EDİRNE');
INSERT INTO Sehirler (id, SehirAd) VALUES (29,'ELAZIG');
INSERT INTO Sehirler (id, SehirAd) VALUES (30,'ERZINCAN');
INSERT INTO Sehirler (id, SehirAd) VALUES (31,'ERZURUM');
INSERT INTO Sehirler (id, SehirAd) VALUES (32,'ESKISEHIR');
INSERT INTO Sehirler (id, SehirAd) VALUES (33,'GAZIANTEP');
INSERT INTO Sehirler (id, SehirAd) VALUES (34,'GIRISUN');
INSERT INTO Sehirler (id, SehirAd) VALUES (35,'GUMUSHANE');
INSERT INTO Sehirler (id, SehirAd) VALUES (36,'HAKKAR');
INSERT INTO Sehirler (id, SehirAd) VALUES (37,'HATAY');
INSERT INTO Sehirler (id, SehirAd) VALUES (38,'IDIR');
INSERT INTO Sehirler (id, SehirAd) VALUES (39,'ISPARTA');
INSERT INTO Sehirler (id, SehirAd) VALUES (40,'ISTANBUL');
INSERT INTO Sehirler (id, SehirAd) VALUES (41,'IZMIR');
INSERT INTO Sehirler (id, SehirAd) VALUES (42,'KAHRAMANMARAS');
INSERT INTO Sehirler (id, SehirAd) VALUES (43,'KARABUK');
INSERT INTO Sehirler (id, SehirAd) VALUES (44,'KARAMAN');
INSERT INTO Sehirler (id, SehirAd) VALUES (45,'KARS');
INSERT INTO Sehirler (id, SehirAd) VALUES (46,'KASTAMONU');
INSERT INTO Sehirler (id, SehirAd) VALUES (47,'KAYSERI');
INSERT INTO Sehirler (id, SehirAd) VALUES (48,'KIRIKKALE');
INSERT INTO Sehirler (id, SehirAd) VALUES (49,'KIRKLARELİ');
INSERT INTO Sehirler (id, SehirAd) VALUES (50,'KIRŞEHİR');
INSERT INTO Sehirler (id, SehirAd) VALUES (51,'KILIS');
INSERT INTO Sehirler (id, SehirAd) VALUES (52,'KOCAELI');
INSERT INTO Sehirler (id, SehirAd) VALUES (53,'KONYA');
INSERT INTO Sehirler (id, SehirAd) VALUES (54,'KUTAHYA');
INSERT INTO Sehirler (id, SehirAd) VALUES (55,'MALATYA');
INSERT INTO Sehirler (id, SehirAd) VALUES (56,'MANISA');
INSERT INTO Sehirler (id, SehirAd) VALUES (57,'MARDIN');
INSERT INTO Sehirler (id, SehirAd) VALUES (58,'MERSIN');
INSERT INTO Sehirler (id, SehirAd) VALUES (59,'MUGLA');
INSERT INTO Sehirler (id, SehirAd) VALUES (60,'MUS');
INSERT INTO Sehirler (id, SehirAd) VALUES (61,'NEVSEHIR');
INSERT INTO Sehirler (id, SehirAd) VALUES (62,'NIĞDE');
INSERT INTO Sehirler (id, SehirAd) VALUES (63,'ORDU');
INSERT INTO Sehirler (id, SehirAd) VALUES (64,'OSMANIYE');
INSERT INTO Sehirler (id, SehirAd) VALUES (65,'RIZE');
INSERT INTO Sehirler (id, SehirAd) VALUES (66,'SAKARYA');
INSERT INTO Sehirler (id, SehirAd) VALUES (67,'SAMSUN');
INSERT INTO Sehirler (id, SehirAd) VALUES (68,'SİİRT');
INSERT INTO Sehirler (id, SehirAd) VALUES (69,'SİNOP');
INSERT INTO Sehirler (id, SehirAd) VALUES (70,'SİVAS');
INSERT INTO Sehirler (id, SehirAd) VALUES (71,'ŞANLIURFA');
INSERT INTO Sehirler (id, SehirAd) VALUES (72,'ŞIRNAK');
INSERT INTO Sehirler (id, SehirAd) VALUES (73,'TEKİRDAĞ');
INSERT INTO Sehirler (id, SehirAd) VALUES (74,'TOKAT');
INSERT INTO Sehirler (id, SehirAd) VALUES (75,'TRABZON');
INSERT INTO Sehirler (id, SehirAd) VALUES (76,'TUNCELİ');
INSERT INTO Sehirler (id, SehirAd) VALUES (77,'UŞAK');
INSERT INTO Sehirler (id, SehirAd) VALUES (78,'VAN');
INSERT INTO Sehirler (id, SehirAd) VALUES (79,'YALOVA');
INSERT INTO Sehirler (id, SehirAd) VALUES (80,'YOZGAT');
INSERT INTO Sehirler (id, SehirAd) VALUES (81,'ZONGULDAK');

SET IDENTITY_INSERT Sehirler OFF;