import React, { useState, useRef, useCallback } from 'react';
import '../../css/dashboard/UrunListeleme.css'; // Dashboard ürün ekleme için özel CSS
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';

// Örnek kategori ve opsiyon verileri (ileride API'den çekilecek)
const kategoriler = [
  'Çantalar',
  'Cüzdanlar',
  'Vakko',
  'Victoria\'s Secret',
  'Gözlükler',
  'Kartlık',
  'Babet Ayakkabı',
  'Topuklu Ayakkabı',
  'Makyaj Çantaları',
  'Spor Ayakkabı',
  'Abiye Çantalar',

];

const opsiyonlar = [
  { ad: '', fiyat: '' },
];

const varyasyonSecenekleri = [
  'Beden',
  'Renk',
  'Çocuk çantaları',
  'Numara',
  // İleride API'den çekilecek
];

// Varyasyon değerlerini dinamik olarak belirle
const varyasyonDegerleri = {
  Beden: ['2-3', '3-4', '4-5'],
  Renk: ['Pembe', 'Taba', 'Mor', 'Siyah'],
  'Çocuk çantaları': ['Çanta1', 'Çanta2'],
  Numara: ['36', '37', '38', '39'],
};

const UrunListeleme = () => {
  // Form state'leri
  const [urunAdi, setUrunAdi] = useState('');
  const [satisFiyati, setSatisFiyati] = useState('');
  const [paraBirimi, setParaBirimi] = useState('TL');
  const [stokAdedi, setStokAdedi] = useState('');
  const [aciklama, setAciklama] = useState('');

  // Kategori seçimi için state
  const [seciliKategoriler, setSeciliKategoriler] = useState([]);

  // Varyasyonlar için state
  const [varyasyon1, setVaryasyon1] = useState('');
  const [varyasyon2, setVaryasyon2] = useState('');
  const [varyasyonKombinasyonlari, setVaryasyonKombinasyonlari] = useState([]); // Her kombinasyon için resim, fiyat, stok

  // Opsiyonlar için state
  const [opsiyonList, setOpsiyonList] = useState([{ ad: '', fiyat: '' }]);

  // Accordion için açık olan bedenleri tutacak state
  const [acikBedenler, setAcikBedenler] = useState([]);

  // Diğer Seçenekler için state'ler
  const [indirimVar, setIndirimVar] = useState(false);
  const [kargoTipi, setKargoTipi] = useState('Sepette Ödeme');
  const [kargoUcreti, setKargoUcreti] = useState('');
  const [urunTipi, setUrunTipi] = useState('Fiziksel');
  const [urunDil, setUrunDil] = useState('Türkçe');

  // Ürün görseli düzenleme için state'ler
  const [gorselModalAcik, setGorselModalAcik] = useState(false);
  const [seciliGorsel, setSeciliGorsel] = useState(null); // Orijinal dosya
  const [gorselUrl, setGorselUrl] = useState(''); // Düzenleme için url
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const fileInputRef = useRef();

  // Cropper için ek state'ler
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Yükleme işlemi için state
  const [gorselYukleniyor, setGorselYukleniyor] = useState(false);

  // Yüklenen görselleri tutmak için state
  const [gorseller, setGorseller] = useState([]); // {url, name} objeleri

  // Görsel seçme modalı için state
  const [gorselSecModalAcik, setGorselSecModalAcik] = useState(false);
  const [gorselSecKombIndex, setGorselSecKombIndex] = useState(null);
  const [seciliGorselIndex, setSeciliGorselIndex] = useState(null);

  // Kategori seçimi değiştiğinde çalışır
  const handleKategoriChange = (kategori) => {
    setSeciliKategoriler(prev =>
      prev.includes(kategori)
        ? prev.filter(k => k !== kategori)
        : [...prev, kategori]
    );
  };

  // Varyasyon seçimi değiştiğinde çalışır
  const handleVaryasyonChange = (index, value) => {
    if (index === 1) setVaryasyon1(value);
    if (index === 2) setVaryasyon2(value);
    // Varyasyonlar değişince kombinasyonları sıfırla
    setVaryasyonKombinasyonlari([]);
  };

  // Kombinasyonları dinamik oluştur
  const handleKombinasyonOlustur = () => {
    if (!varyasyon1 || !varyasyon2) return;
    const v1Degerler = varyasyonDegerleri[varyasyon1] || [];
    const v2Degerler = varyasyonDegerleri[varyasyon2] || [];
    const kombinasyonlar = [];
    v1Degerler.forEach(v1 => {
      v2Degerler.forEach(v2 => {
        kombinasyonlar.push({
          varyasyon: `${v1} / ${v2}`,
          resim: null,
          fiyat: '',
          stok: '',
        });
      });
    });
    setVaryasyonKombinasyonlari(kombinasyonlar);
  };

  // Kombinasyon için resim, fiyat, stok güncelle
  const handleKombinasyonUpdate = (index, alan, deger) => {
    setVaryasyonKombinasyonlari(prev => {
      const yeni = [...prev];
      yeni[index][alan] = deger;
      return yeni;
    });
  };

  // Opsiyon ekle
  const handleOpsiyonEkle = () => {
    setOpsiyonList([...opsiyonList, { ad: '', fiyat: '' }]);
  };

  // Opsiyon güncelle
  const handleOpsiyonChange = (index, alan, deger) => {
    setOpsiyonList(prev => {
      const yeni = [...prev];
      yeni[index][alan] = deger;
      return yeni;
    });
  };

  // Accordion aç/kapa fonksiyonu
  const handleBedenToggle = (beden) => {
    setAcikBedenler(prev =>
      prev.includes(beden)
        ? prev.filter(b => b !== beden)
        : [...prev, beden]
    );
  };

  // Kombinasyonları gruplamak için yardımcı fonksiyon
  const grupluKombinasyonlar = () => {
    // varyasyon: "2-3 / Pembe" gibi
    const gruplar = {};
    varyasyonKombinasyonlari.forEach(komb => {
      const [beden, renk] = komb.varyasyon.split(' / ');
      if (!gruplar[beden]) gruplar[beden] = [];
      gruplar[beden].push({ ...komb, renk });
    });
    return gruplar;
  };

  // Kargo tipi değiştiğinde, ücretsiz kargo ise kargo ücretini 0 yap
  const handleKargoTipiChange = (e) => {
    setKargoTipi(e.target.value);
    if (e.target.value === 'Ücretsiz Kargo') {
      setKargoUcreti('0');
    }
  };

  // Görsel seçilince modalı aç
  const handleGorselSec = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSeciliGorsel(file);
      setGorselUrl(URL.createObjectURL(file));
      setZoom(1);
      setRotate(0);
      setGorselModalAcik(true);
    }
  };

  // Görsel kutusuna tıklayınca dosya seçtir
  const handleGorselBoxClick = () => {
    fileInputRef.current.click();
  };

  // Görsel silme fonksiyonu
  const handleGorselSil = (index) => {
    setGorseller(prev => prev.filter((_, i) => i !== index));
  };

  // Modalda tamam'a basınca, kırpılmış görseli yükle
  const handleGorselTamam = async () => {
    setGorselYukleniyor(true);
    // Kırpılmış görseli oluştur
    const croppedImg = await getCroppedImg(gorselUrl, croppedAreaPixels, rotate);
    setTimeout(() => {
      setGorselYukleniyor(false);
      setGorselModalAcik(false);
      setGorseller(prev => [
        ...prev,
        { url: croppedImg, name: `Görsel #${prev.length + 1}` }
      ]);
      setSeciliGorsel(null);
      setGorselUrl('');
    }, 1000);
  };

  // Modalda vazgeç'e basınca
  const handleGorselVazgec = () => {
    setGorselModalAcik(false);
    setSeciliGorsel(null);
    setGorselUrl('');
  };

  // Crop tamamlandığında kırpılacak alanı kaydet
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Kombinasyon satırında 'Görsel Seç' butonuna tıklayınca modalı aç
  const handleGorselSecModalAc = (kombIndex) => {
    setGorselSecKombIndex(kombIndex);
    setSeciliGorselIndex(null);
    setGorselSecModalAcik(true);
  };

  // Modalda görsel seçilince (kombinasyon için)
  const handleKombinasyonGorselSec = (index) => {
    setSeciliGorselIndex(index);
  };

  // Modalda kaydet'e basınca seçili görseli kombinasyona ata
  const handleGorselSecKaydet = () => {
    if (gorselSecKombIndex !== null && seciliGorselIndex !== null) {
      setVaryasyonKombinasyonlari(prev => {
        const yeni = [...prev];
        yeni[gorselSecKombIndex].resim = gorseller[seciliGorselIndex];
        return yeni;
      });
    }
    setGorselSecModalAcik(false);
  };

  // Modalı kapat
  const handleGorselSecKapat = () => {
    setGorselSecModalAcik(false);
  };

  // Kombinasyon görselini silen fonksiyon
  const handleKombinasyonGorselSil = (index) => {
    setVaryasyonKombinasyonlari(prev => {
      const yeni = [...prev];
      yeni[index].resim = null;
      return yeni;
    });
  };

  return (
    <div className="dashboard-urun-container">
      {/* Breadcrumb */}
      <div className="dashboard-breadcrumb">
        <b>ÜRÜNLER</b> &nbsp; &gt; &nbsp; <b>ÜRÜN LİSTELEME</b>
      </div>

      {/* Ürün görseli ve video yükleme alanı */}
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div className="dashboard-box" onClick={handleGorselBoxClick} style={{ cursor: 'pointer', position: 'relative' }}>
            Ürün görselini bu alana sürükleyin veya yüklemek için tıklayın.
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleGorselSec}
            />
          </div>
          
        </div>
        {/* Sağda görsellerin listesi */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          {gorseller.map((g, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16, background: '#fff',
              borderRadius: 8, padding: 16, marginBottom: 12, boxShadow: '0 1px 6px #0001', minWidth: 220
            }}>
              <img src={g.url} alt={g.name} style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 16 }}>{g.name}</div>
              </div>
              <button
                onClick={() => handleGorselSil(i)}
                style={{
                  background: 'none', border: 'none', color: '#b0b0b0', fontSize: 22, cursor: 'pointer'
                }}
                title='Sil'
              >🗑️</button>
            </div>
          ))}
        </div>
      </div>

      {/* Görsel düzenleme modalı */}
      {gorselModalAcik && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {gorselYukleniyor ? (
            <div style={{
              width: 400, maxWidth: '95vw', background: '#f7f8fa', borderRadius: 8, padding: 32, textAlign: 'center'
            }}>
              <div style={{ color: '#7a869a', fontSize: 15, marginBottom: 16 }}>
                Ürün görseli yükleniyor. Bağlantı hızınıza bağlı olarak bu işlem birkaç dakika sürebilir, lütfen bekleyiniz.
              </div>
              <div style={{ width: '100%', height: 4, background: '#e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: '#bfc7d1',
                  animation: 'progressBarAnim 1.2s linear infinite'
                }} />
              </div>
              <style>
                {`@keyframes progressBarAnim { 0% {transform: translateX(-100%);} 100% {transform: translateX(100%);} }`}
              </style>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 8, width: 400, maxWidth: '95vw', padding: 0, boxShadow: '0 2px 24px #0002', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Üstte döndürme ikonları */}
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 }}>
                <button onClick={() => setRotate(r => r - 90)} style={{ background: '#f7f8fa', border: 'none', borderRadius: '50%', cursor: 'pointer'}}>↺</button>
                <button onClick={() => setRotate(r => r + 90)}  style={{ background: '#f7f8fa', border: 'none', borderRadius: '50%', cursor: 'pointer'}}>↻</button>
              </div>
              {/* Görsel kırpma ve taşıma alanı */}
              <div style={{ margin: '24px 0 16px 0', width: 320, height: 240, background: '#eee', borderRadius: 16, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {gorselUrl && (
                  <Cropper
                    image={gorselUrl}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotate}
                    aspect={4 / 3}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onRotationChange={setRotate}
                    onCropComplete={onCropComplete}
                    cropShape="rect"
                    showGrid={false}
                    style={{ containerStyle: { borderRadius: 16 } }}
                  />
                )}
              </div>
              {/* Zoom butonları */}
              <div  style={{gap:'15px',display:'flex',border: 'none', borderRadius: '50%', cursor: 'pointer'}}>
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} style={{ display: 'flex', background: '#f7f8fa', border: 'none', borderRadius: '50%', cursor: 'pointer'}}>-</button>
                <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} style={{ display: 'flex', background: '#f7f8fa', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>+</button>
              </div>
              {/* Tamam ve Vazgeç butonları */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0 24px 0', alignItems: 'center' }}>
                <button onClick={handleGorselTamam} style={{ width: '90%', background: 'rgb(255 0 141)', color: '#fff', border: 'none', borderRadius: 24, padding: '12px 0', fontWeight: 600, fontSize: 17, marginBottom: 4 }}>Tamam</button>
                <button onClick={handleGorselVazgec} style={{ width: '90%', background: '#fff', color: 'rgb(255 0 141)', border: '2px solid rgb(255 0 141)', borderRadius: 24, padding: '12px 0', fontWeight: 600, fontSize: 17 }}>Vazgeç</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Görsel seçme modalı */}
      {gorselSecModalAcik && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', borderRadius: 10, width: 540, maxWidth: '98vw', padding: 32, boxShadow: '0 2px 24px #0002', position: 'relative' }}>
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span role="img" aria-label="görsel">🖼️</span> Ürün Görselleri
            </div>
            <div style={{ color: '#7a869a', fontSize: 15, marginBottom: 18 }}>
              Yeni bir görsel yükleyebilir veya mevcut görseller arasından seçim yapabilirsiniz.
            </div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 24 }}>
              {/* Yükleme kutusu */}
              <div style={{ width: 160, height: 120, border: '2px dashed #bfc7d1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a869a', fontSize: 15, cursor: 'pointer', textAlign: 'center', background: '#f7f8fa' }}>
                Ürün görselini bu alana sürükleyin veya yüklemek için tıklayın.
              </div>
              {/* Yüklenen görseller */}
              {gorseller.map((g, i) => (
                <div
                  key={i}
                  onClick={() => handleKombinasyonGorselSec(i)}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: seciliGorselIndex === i ? '3px solid #00e6c3' : '2px solid #eee',
                    cursor: 'pointer',
                    boxShadow: seciliGorselIndex === i ? '0 0 0 2px #00e6c3' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fff',
                    marginRight: 8
                  }}
                >
                  <img src={g.url} alt={g.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
              <button onClick={handleGorselSecKapat} style={{ padding: '10px 32px', borderRadius: 6, border: '1px solid #eee', background: '#fff', color: '#222', fontWeight: 600, fontSize: 16 }}>KAPAT</button>
              <button onClick={handleGorselSecKaydet} style={{ padding: '10px 32px', borderRadius: 6, border: 'none', background: '#00e6c3', color: '#fff', fontWeight: 700, fontSize: 16 }}>KAYDET</button>
            </div>
          </div>
        </div>
      )}

      {/* Ürün detayları formu */}
      <div className="dashboard-section">
        <div className="dashboard-flex-row">
          <div className="dashboard-flex-col">
            <label className="dashboard-label">ÜRÜN ADI <span style={{ color: 'red' }}>*</span></label>
            <input className="dashboard-input" value={urunAdi} onChange={e => setUrunAdi(e.target.value)} placeholder="Ürün adı giriniz" />
          </div>
          <div className="dashboard-flex-col">
            <label className="dashboard-label">SATIŞ FİYATI <span style={{ color: 'red' }}>*</span></label>
            <input className="dashboard-input" value={satisFiyati} onChange={e => setSatisFiyati(e.target.value)} placeholder="Satış fiyatı" />
          </div>
          <div className="dashboard-flex-col">
            <label className="dashboard-label">PARA BİRİMİ <span style={{ color: 'red' }}>*</span></label>
            <select className="dashboard-input" value={paraBirimi} onChange={e => setParaBirimi(e.target.value)}>
              <option>TL</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </div>
          <div className="dashboard-flex-col">
            <label className="dashboard-label">STOK ADEDİ <span style={{ color: 'red' }}>*</span></label>
            <input className="dashboard-input" value={stokAdedi} onChange={e => setStokAdedi(e.target.value)} placeholder="Stok adedi" />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="dashboard-label">ÜRÜN AÇIKLAMASI</label>
          {/* Burada zengin metin editörü yerine textarea kullandım, istersen ekleyebilirim */}
          <textarea
            className="dashboard-input"
            style={{ minHeight: 100, fontFamily: 'inherit', resize: 'vertical' }}
            value={aciklama}
            onChange={e => setAciklama(e.target.value)}
            maxLength={3000}
            placeholder="Ürün açıklaması giriniz"
          />
          <div className="dashboard-char-count">
            Karakter: {aciklama.length}/3000
          </div>
        </div>
      </div>

      {/* Kategori, varyasyon, özel listeleme, diğer seçenekler */}
      <div style={{ display: 'flex', gap: 16,alignItems:'center', marginBottom: 0 }}>
        {/* Kategori Seçimi Bölümü */}
        <div className="dashboard-section" style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>KATEGORİ SEÇİMİ</div>
          <div style={{ fontSize: 15, color: '#666', marginBottom: 12 }}>
            Bu ürünün dükkanınızda hangi kategori altında bulunmasını istediğinizi belirleyin. Birden fazla seçim yapabilirsiniz.
          </div>
          {kategoriler.map((kategori, i) => (
            <div key={kategori} style={{ marginBottom: 6 }}>
              <input
                type="checkbox"
                checked={seciliKategoriler.includes(kategori)}
                onChange={() => handleKategoriChange(kategori)}
                id={`kategori_${i}`}
              />
              <label htmlFor={`kategori_${i}`} style={{ marginLeft: 8 }}>{kategori}</label>
            </div>
          ))}
        </div>
        {/* Varyasyon & Opsiyon Seçimi Bölümü */}
        <div className="dashboard-section" style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>VARYASYON & OPSİYON SEÇİMİ</div>
          <div style={{ fontSize: 15, color: '#666', marginBottom: 12 }}>
            Bu üründe sunmak istediğiniz varyasyonları seçtikten sonra her biri veya bir bölümü için görsel, stok ve fiyat bilgisi girebilirsiniz.
          </div>
          {/* Varyasyon seçimi */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12,alignItems:'center'}}>
            <select
              className="dashboard-input"
              value={varyasyon1}
              onChange={e => handleVaryasyonChange(1, e.target.value)}
            >
              <option value="">VARYASYON 1 Seçiniz...</option>
              {varyasyonSecenekleri.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <select
              className="dashboard-input"
              value={varyasyon2}
              onChange={e => handleVaryasyonChange(2, e.target.value)}
            >
              <option value="">VARYASYON 2 Seçiniz...</option>
              {varyasyonSecenekleri.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <button
              type="button"
              className="dashboard-button"
              style={{ padding: '8px 16px', fontSize: 14, marginLeft: 8 }}
              onClick={handleKombinasyonOlustur}
              disabled={!varyasyon1 || !varyasyon2}
            >
              Kombinasyonları Oluştur
            </button>
          </div>
          {/* Varyasyon kombinasyonları accordion yapısı */}
          {varyasyonKombinasyonlari.length > 0 && (
            <div style={{ maxHeight: 350, overflowY: 'auto', border: '1px solid #eee', borderRadius: 4, marginBottom: 16 }}>
              {/* Gruplu kombinasyonları al */}
              {Object.entries(grupluKombinasyonlar()).map(([beden, renkler]) => (
                <div key={beden}>
                  {/* Ana başlık: Beden */}
                  <div
                    style={{
                      background: '#f7f8fa',
                      padding: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onClick={() => handleBedenToggle(beden)}
                  >
                    <span>{beden}</span>
                    <span style={{ fontSize: 18 }}>{acikBedenler.includes(beden) ? '▲' : '▼'}</span>
                  </div>
                  {/* Eğer bu beden açıksa, altına renkleri ve alanları göster */}
                  {acikBedenler.includes(beden) && (
                    <table className="kombinasyon-table" style={{ width: '100%', fontSize: 14, background: '#fff' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: 8, width: 120 }}>Renk</th>
                          <th style={{ padding: 8 }}>Görsel</th>
                          <th style={{ padding: 8 }}>Fiyat</th>
                          <th style={{ padding: 8 }}>Stok</th>
                        </tr>
                      </thead>
                      <tbody>
                        {renkler.map((komb, i) => (
                          <tr key={i}>
                            <td data-label="Renk" style={{ padding: 8 }}>{komb.renk}</td>
                            <td data-label="Görsel" style={{ padding: 8 }}>
                              {!komb.resim ? (
                                <button
                                  type="button"
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #ccc',
                                    background: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: 16
                                  }}
                                  onClick={() => handleGorselSecModalAc(varyasyonKombinasyonlari.findIndex(k => k.varyasyon === komb.varyasyon))}
                                >
                                  Görsel Seç
                                </button>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                  <img
                                    src={komb.resim.url}
                                    alt="Kombinasyon görseli"
                                    style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', border: '1px solid #eee' }}
                                  />
                                  <button
                                    onClick={() => handleKombinasyonGorselSil(varyasyonKombinasyonlari.findIndex(k => k.varyasyon === komb.varyasyon))}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#ff0099',
                                      fontSize: 12,
                                      cursor: 'pointer',
                                      marginTop: 2
                                    }}
                                    title="Görseli Kaldır"
                                  >🗑️</button>
                                </div>
                              )}
                            </td>
                            <td data-label="Fiyat" style={{ padding: 8 }}>
                              <input
                                type="number"
                                className="dashboard-input"
                                style={{ width: 90 }}
                                value={komb.fiyat}
                                onChange={e => handleKombinasyonUpdate(
                                  varyasyonKombinasyonlari.findIndex(k => k.varyasyon === komb.varyasyon),
                                  'fiyat',
                                  e.target.value
                                )}
                                placeholder="Fiyat"
                              />
                            </td>
                            <td data-label="Stok" style={{ padding: 8 }}>
                              <input
                                type="number"
                                className="dashboard-input"
                                style={{ width: 70 }}
                                value={komb.stok}
                                onChange={e => handleKombinasyonUpdate(
                                  varyasyonKombinasyonlari.findIndex(k => k.varyasyon === komb.varyasyon),
                                  'stok',
                                  e.target.value
                                )}
                                placeholder="Stok"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Opsiyon Belirleme Alanı */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Opsiyon Belirleme</div>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
              Üründe hangi opsiyonların bulunacağını ve bunlar için eklenecek fiyatları belirleyin. Opsiyon belirsiz ise fiyat alanını boş bırakabilirsiniz.
            </div>
            {opsiyonList.map((opsiyon, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  className="dashboard-input"
                  style={{ flex: 2 }}
                  placeholder="Opsiyon Adı"
                  value={opsiyon.ad}
                  onChange={e => handleOpsiyonChange(i, 'ad', e.target.value)}
                />
                <input
                  className="dashboard-input"
                  style={{ flex: 1 }}
                  placeholder="Fiyat"
                  value={opsiyon.fiyat}
                  onChange={e => handleOpsiyonChange(i, 'fiyat', e.target.value)}
                />
              </div>
            ))}
            <button
              type="button"
              className="dashboard-button"
              style={{ padding: '6px 16px', fontSize: 13, background: 'rgb(255 0 141);', color: 'white', border: '1px solid #ccc', marginTop: 4 }}
              onClick={handleOpsiyonEkle}
            >
              + Opsiyon Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Diğer Seçenekler Accordion */}
      <div className="dashboard-section" style={{ marginTop: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: '#888', marginBottom: 18, letterSpacing: 0.2 }}>DİĞER SEÇENEKLER</div>
        {/* İndirimli Ürün */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>İndirimli Ürün</div>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
            Ürünü dükkanınızda indirimli şekilde listelemek isterseniz bu seçeneği etkinleştirebilirsiniz.
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
            <input type="checkbox" checked={indirimVar} onChange={e => setIndirimVar(e.target.checked)} />
            Üründe indirim var
          </label>
        </div>
        {/* Kargo Tipi ve Ücreti */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>Kargo Tipi ve Ücreti</div>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
            Belirleyeceğiniz kargo ücreti, "Sepette Ödeme" şeklinde listelenen ürünlerde ürün fiyatına eklenecektir.
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label className="dashboard-label">KARGO TİPİ <span style={{ color: 'red' }}>*</span></label>
              <select className="dashboard-input" value={kargoTipi} onChange={handleKargoTipiChange}>
                <option>Sepette Ödeme</option>
                <option>Ücretsiz Kargo</option>
                <option>Mağazada Teslim</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label className="dashboard-label">KARGO ÜCRETİ</label>
              <input
                className="dashboard-input"
                type="number"
                value={kargoUcreti}
                onChange={e => setKargoUcreti(e.target.value)}
                placeholder="Kargo ücreti"
                disabled={kargoTipi === 'Ücretsiz Kargo' || kargoTipi === 'Mağazada Teslim'} // Mağazada teslim seçeneği için de disabled eklendi
              />
            </div>
            
          </div>
        </div>
        {/* Ürün Tipi */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>Ürün Tipi</div>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
            Ürün ve teslimat tipini belirler.
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', fontSize: 15 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" name="urunTipi" checked={urunTipi === 'Fiziksel'} onChange={() => setUrunTipi('Fiziksel')} /> Fiziksel
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" name="urunTipi" checked={urunTipi === 'Dijital'} onChange={() => setUrunTipi('Dijital')} /> Dijital
            </label>
          </div>
        </div>
        {/* Ürün Dil Seçeneği */}
        <div style={{ marginBottom: 0 }}>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>Ürün Dil Seçeneği</div>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
            Ürünün dükkanınızda hangi dilde görüntüleneceğini belirler.
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', fontSize: 15 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" name="urunDil" checked={urunDil === 'Türkçe'} onChange={() => setUrunDil('Türkçe')} /> Türkçe
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" name="urunDil" checked={urunDil === 'İngilizce'} onChange={() => setUrunDil('İngilizce')} /> İngilizce
            </label>
          </div>
        </div>
      </div>

      {/* Ürünü Satışa Çıkar butonu */}
      <button className="dashboard-button">ÜRÜNÜ SATIŞA ÇIKAR</button>
    </div>
  );
};

export default UrunListeleme;
// Açıklama: Kategori seçimi ve varyasyon/opsiyon seçimi bölümleri, ekran görüntüsüne uygun şekilde ve açıklamalı olarak eklendi. Her varyasyon kombinasyonu için ayrı resim, fiyat ve stok girilebilir. Kategoriler ve opsiyonlar ileride API'den çekilecek şekilde ayarlandı. 