import React, { useState, useRef, useCallback, useEffect } from 'react';
import '../../css/dashboard/UrunListeleme.css'; // Dashboard ürün ekleme için özel CSS
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import axios from 'axios';

// Örnek kategori ve opsiyon verileri (ileride API'den çekilecek)
const opsiyonlar = [
  { ad: '', fiyat: '' },
];

// Base64 data URL'yi Blob nesnesine dönüştüren yardımcı fonksiyon
const dataURLtoBlob = (dataurl) => {
  if (!dataurl) return null;
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
};

// API base URL'i
const API_BASE_URL = 'http://localhost:5000/api';
const SERVER_BASE_URL = 'http://localhost:5000'; // Sunucu base URL'i

const UrunListeleme = () => {
  // Form state'leri
  const [urunAdi, setUrunAdi] = useState('');
  const [satisFiyati, setSatisFiyati] = useState('');
  const [paraBirimi, setParaBirimi] = useState('TL');
  const [stokAdedi, setStokAdedi] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);

  const [kategoriler, setKategoriler] = useState([]);
  const [seciliKategori, setSeciliKategori] = useState('');
  const [loading, setLoading] = useState(true);

  // Varyasyonlar için state'ler
  const [varyasyonlar, setVaryasyonlar] = useState([]); // API'den gelen varyasyonlar
  const [varyasyonSecenekleri, setVaryasyonSecenekleri] = useState([]); // Varyasyon adları
  const [varyasyonDegerleri, setVaryasyonDegerleri] = useState({}); // Varyasyon seçenekleri
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

  // Yeni ref'ler ekleyelim
  const anaGorselInputRef = useRef();
  const modalGorselInputRef = useRef();

  // Varyasyon stoklarının toplamını hesapla
  const hesaplaToplamStok = useCallback(() => {
    if (!varyasyon1 || !varyasyon2) return 0;
    return varyasyonKombinasyonlari.reduce((toplam, komb) => {
      return toplam + (parseInt(komb.stok) || 0);
    }, 0);
  }, [varyasyonKombinasyonlari, varyasyon1, varyasyon2]);

  // Kategori seçimi değiştiğinde çalışır (radio button mantığı)
  const handleKategoriChange = (kategori) => {
    setSeciliKategori(kategori === seciliKategori ? '' : kategori);
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
    const gruplar = {};
    varyasyonKombinasyonlari.forEach(komb => {
      // v1 ve v2 objesi varsa OptionName kullan
      const beden = komb.v1 ? komb.v1.OptionName : (komb.varyasyon.split(' / ')[0] || '');
      const renk = komb.v2 ? komb.v2.OptionName : (komb.varyasyon.split(' / ')[1] || '');
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

  // Ana görsel kutusuna tıklayınca dosya seçtir
  const handleAnaGorselBoxClick = () => {
    if (anaGorselInputRef.current) {
      anaGorselInputRef.current.click();
    }
  };

  // Modal görsel kutusuna tıklayınca dosya seçtir
  const handleModalGorselBoxClick = () => {
    if (modalGorselInputRef.current) {
      modalGorselInputRef.current.click();
    }
  };

  // Görsel seçilince modalı aç
  const handleGorselSec = (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setSeciliGorsel(file);
    setGorselUrl(URL.createObjectURL(file));
    setZoom(1);
    setRotate(0);
    setGorselModalAcik(true);
  };

  // Görsel silme fonksiyonu
  const handleGorselSil = async (index) => {
    const gorselToDelete = gorseller[index];

    // Kullanıcıdan onay al
    if (!window.confirm(`'${gorselToDelete.name}' görselini silmek istediğinizden emin misiniz?`)) {
      return; // Kullanıcı vazgeçti
    }

    try {
      // Backend API'sine silme isteği gönder
      // Dosya adı URL'den çıkarılabilir veya state'de saklanabilir. Upload response'una filename ekledik.
      const filename = gorselToDelete.filename; // Upload sırasında kaydettiğimiz dosya adını kullan
      
      if (!filename) {
          console.error('Silinecek görselin dosya adı bulunamadı');
          alert('Görsel silinirken bir hata oluştu: Dosya adı eksik.');
          // Frontend state'inden yine de kaldıralım mı? Şimdilik kaldırmayalım.
          return;
      }

      console.log(`Görsel backend'den siliniyor: ${filename}`);

      const response = await fetch(`${API_BASE_URL}/upload/image/${filename}`, {
        method: 'DELETE',
        // credentials: 'include' // Eğer backend session/cookie kullanıyorsa dahil edilebilir
      });

      console.log('Delete API yanıtı:', response);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Delete API yanıt hatası:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      const result = await response.json();
      console.log('Delete API başarılı yanıt:', result);

      // Backend'den başarı yanıtı gelince frontend state'inden görseli kaldır
      setGorseller(prev => prev.filter((_, i) => i !== index));

      alert('Görsel başarıyla silindi.');

    } catch (error) {
      console.error('Görsel silinirken hata:', error);
      alert(`Görsel silinirken bir hata oluştu: ${error.message}`);
    }
  };

  // Modalda tamam'a basınca, kırpılmış görseli yükle
  const handleGorselTamam = async () => {
    if (!croppedAreaPixels || !seciliGorsel) {
      alert('Lütfen bir görsel seçin ve kırpma alanını belirleyin.');
      setGorselYukleniyor(false);
      return;
    }

    setGorselYukleniyor(true);
    
    try {
      const croppedImageResult = await getCroppedImg(gorselUrl, croppedAreaPixels, rotate);
      let croppedImageBlob;

      if (!(croppedImageResult instanceof Blob)) {
          croppedImageBlob = dataURLtoBlob(croppedImageResult);
      } else {
          croppedImageBlob = croppedImageResult;
      }

      if (!croppedImageBlob) {
          throw new Error(`Görsel Blob'a dönüştürülemedi.`);
      }

      const formData = new FormData();
      formData.append('image', croppedImageBlob, seciliGorsel.name);

      console.log(`Görsel backend'e yükleniyor...`);
      
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        body: formData,
      });

      console.log('Upload API yanıtı:', response);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Upload API yanıt hatası:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      const result = await response.json();
      console.log('Upload API başarılı yanıt:', result);

      if (!result.imageUrl || !result.filename) { // filename kontrolünü de ekle
         throw new Error(`API yanıtında görsel URL'si veya dosya adı bulunamadı`);
      }

      // Yüklenen görseli gorseller state'ine ekle
      setGorseller(prev => [
        ...prev,
        { 
          url: `${SERVER_BASE_URL}${result.imageUrl}`, 
          name: seciliGorsel.name || `Görsel #${prev.length + 1}`,
          filename: result.filename // Dosya adını state'de sakla
        }
      ]);

      // Modal ve state'leri kapat ve sıfırla
      setGorselModalAcik(false);
      setSeciliGorsel(null);
      setGorselUrl('');
      setZoom(1);
      setRotate(0);
      setCrop({ x: 0, y: 0 });
      setCroppedAreaPixels(null);

    } catch (error) {
      console.error('Görsel yüklenirken hata:', error);
      alert(`Görsel yüklenirken bir hata oluştu: ${error.message}`);
    } finally {
      setGorselYukleniyor(false);
    }
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

  // Stok girişi için kontrol fonksiyonu
  const handleStokChange = (e) => {
    const value = e.target.value;
    // Sadece sayısal değer girilmesine izin ver
    if (/^\d*$/.test(value)) {
      setStokAdedi(value);
    }
  };

  // Fiyat girişi için kontrol fonksiyonu
  const handleFiyatChange = (e) => {
    const value = e.target.value;
    // Sadece sayısal değer ve nokta girilmesine izin ver
    if (/^\d*\.?\d*$/.test(value)) {
      setSatisFiyati(value);
    }
  };

  // Varyasyon kombinasyonu için fiyat kontrolü
  const handleKombinasyonFiyatChange = (index, value) => {
    // Sadece sayısal değer ve nokta girilmesine izin ver
    if (/^\d*\.?\d*$/.test(value)) {
      handleKombinasyonUpdate(index, 'fiyat', value);
    }
  };

  // Varyasyon kombinasyonu için stok kontrolü
  const handleKombinasyonStokChange = (index, value) => {
    // Sadece sayısal değer girilmesine izin ver
    if (/^\d*$/.test(value)) {
      handleKombinasyonUpdate(index, 'stok', value);
      // Stok değiştiğinde toplam stok miktarını güncelle
      if (varyasyon1 && varyasyon2) {
        setStokAdedi(hesaplaToplamStok().toString());
      }
    }
  };

  // useEffect ile toplam stok miktarını takip et
  useEffect(() => {
    if (varyasyon1 && varyasyon2) {
      setStokAdedi(hesaplaToplamStok().toString());
    }
  }, [varyasyonKombinasyonlari, varyasyon1, varyasyon2, hesaplaToplamStok]);

  // Varyasyonları API'den getir
  useEffect(() => {
    const fetchVaryasyonlar = async () => {
      try {
        console.log('Varyasyonlar getiriliyor...');
        const response = await fetch(`${API_BASE_URL}/variations`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('API yanıtı:', response);

        if (!response.ok) {
          const errorData = await response.text();
          console.error('API yanıt hatası:', errorData);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
        }

        const data = await response.json();
        console.log('Gelen varyasyonlar:', data);

        if (!Array.isArray(data)) {
          throw new Error('API geçersiz veri formatı döndürdü');
        }

        // Gelen varyasyonların secenekler alanını OptionName string dizisine çevir
        const mapped = data.map(v => ({
          ...v,
          secenekler: v.secenekler.map(opt => opt.OptionName)
        }));
        setVaryasyonlar(data);
        
        // Varyasyon adlarını ve seçeneklerini ayarla
        const secenekler = mapped.map(v => v.ad);
        setVaryasyonSecenekleri(secenekler);
        
        const degerler = {};
        mapped.forEach(v => {
          degerler[v.ad] = v.secenekler;
        });
        setVaryasyonDegerleri(degerler);
      } catch (error) {
        console.error('Varyasyonlar getirilirken hata:', error);
        // Hata durumunda varsayılan varyasyonları kullan
        const varsayilanVaryasyonlar = [
          { ad: 'Beden', secenekler: ['S', 'M', 'L', 'XL'] },
          { ad: 'Renk', secenekler: ['Siyah', 'Beyaz', 'Kırmızı', 'Mavi'] }
        ];
        setVaryasyonlar(varsayilanVaryasyonlar);
        setVaryasyonSecenekleri(varsayilanVaryasyonlar.map(v => v.ad));
        const degerler = {};
        varsayilanVaryasyonlar.forEach(v => {
          degerler[v.ad] = v.secenekler;
        });
        setVaryasyonDegerleri(degerler);
        // Kullanıcıya bilgi ver
        alert(`Varyasyonlar yüklenirken bir hata oluştu: ${error.message}. Varsayılan varyasyonlar kullanılıyor.`);
      }
    };
    
    // Backend sunucusunun çalışıp çalışmadığını kontrol et
    const checkServer = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/test`);
        if (response.ok) {
          console.log('Backend sunucusu çalışıyor');
          fetchVaryasyonlar();
        } else {
          const errorData = await response.text();
          throw new Error(`Backend sunucusu yanıt vermiyor: ${errorData}`);
        }
      } catch (error) {
        console.error('Backend sunucusu kontrolü başarısız:', error);
        // Sunucu çalışmıyorsa varsayılan varyasyonları kullan
        const varsayilanVaryasyonlar = [
          { ad: 'Beden', secenekler: ['S', 'M', 'L', 'XL'] },
          { ad: 'Renk', secenekler: ['Siyah', 'Beyaz', 'Kırmızı', 'Mavi'] }
        ];
        setVaryasyonlar(varsayilanVaryasyonlar);
        setVaryasyonSecenekleri(varsayilanVaryasyonlar.map(v => v.ad));
        const degerler = {};
        varsayilanVaryasyonlar.forEach(v => {
          degerler[v.ad] = v.secenekler;
        });
        setVaryasyonDegerleri(degerler);
        alert(`Backend sunucusuna bağlanılamadı: ${error.message}. Varsayılan varyasyonlar kullanılıyor.`);
      }
    };

    checkServer();
  }, []);

  // Varyasyon seçimi değiştiğinde çalışır
  const handleVaryasyonChange = (index, value) => {
    if (index === 1) {
      setVaryasyon1(value);
      if (value && varyasyon2) {
        // Varyasyon seçildiğinde stok adedini sıfırla
        setStokAdedi('');
      }
    }
    if (index === 2) {
      setVaryasyon2(value);
      if (value && varyasyon1) {
        // Varyasyon seçildiğinde stok adedini sıfırla
        setStokAdedi('');
      }
    }
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

  // Kombinasyon güncelleme fonksiyonu
  const handleKombinasyonUpdate = async (index, alan, deger) => {
    const kombinasyon = varyasyonKombinasyonlari[index];
    
    // Önce state'i güncelle
    setVaryasyonKombinasyonlari(prev => {
      const yeni = [...prev];
      yeni[index][alan] = deger;
      return yeni;
    });
    
    // Eğer kombinasyon ID'si varsa (yani veritabanında kayıtlıysa) API'yi güncelle
    if (kombinasyon.combinationId) {
      try {
        const response = await fetch(`${API_BASE_URL}/variation-combinations/combinations/${kombinasyon.combinationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            // Eğer authentication gerekiyorsa token ekleyin
            // 'Authorization': `Bearer ${token}`
          },
          credentials: 'include', // Cookie'leri gönder
          body: JSON.stringify({
            imageUrl: kombinasyon.resim?.url,
            price: kombinasyon.fiyat,
            stock: kombinasyon.stok
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedData = await response.json();
        console.log('Kombinasyon güncellendi:', updatedData);
      } catch (error) {
        console.error('Kombinasyon güncellenirken hata:', error);
        // Hata durumunda state'i geri al
        setVaryasyonKombinasyonlari(prev => {
          const yeni = [...prev];
          yeni[index][alan] = kombinasyon[alan];
          return yeni;
        });
        // Kullanıcıya hata mesajı göster
        alert('Kombinasyon güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  // Sayfa açıldığında localStorage'dan görselleri yükle (süre kontrolü ile)
  useEffect(() => {
    try {
      const kayitli = localStorage.getItem('yuklenenGorseller');
      if (kayitli) {
        const kayitObj = JSON.parse(kayitli);
        const now = Date.now();
        const SURE_MS = 60 * 60 * 1000; // 1 saat
        
        // Timestamp kontrolü
        if (now - kayitObj.timestamp < SURE_MS) {
          // Görsel URL'lerinin geçerli olduğundan emin ol
          const gecerliGorseller = kayitObj.data.filter(gorsel => 
            gorsel && gorsel.url && gorsel.url.startsWith('http')
          );
          
          if (gecerliGorseller.length > 0) {
            setGorseller(gecerliGorseller);
            console.log('Görseller localStorage\'dan yüklendi:', gecerliGorseller);
          } else {
            console.log('Geçerli görsel bulunamadı');
            localStorage.removeItem('yuklenenGorseller');
          }
        } else {
          console.log('Görsellerin süresi dolmuş');
          localStorage.removeItem('yuklenenGorseller');
        }
      }
    } catch (error) {
      console.error('Görseller yüklenirken hata:', error);
      localStorage.removeItem('yuklenenGorseller');
    }
  }, []);

  // gorseller state'i değiştiğinde localStorage'a kaydet (timestamp ile)
  useEffect(() => {
    try {
      if (gorseller && gorseller.length > 0) {
        const kayit = {
          data: gorseller,
          timestamp: Date.now()
        };
        localStorage.setItem('yuklenenGorseller', JSON.stringify(kayit));
        console.log('Görseller localStorage\'a kaydedildi:', gorseller);
      }
    } catch (error) {
      console.error('Görseller kaydedilirken hata:', error);
    }
  }, [gorseller]);

  // Ürün kaydedilince localStorage'dan sil
  const handleSubmit = async () => {
    try {
      // Önce ürünü kaydet
      const productData = {
        ProductName: urunAdi,
        Description: aciklama,
        BasePrice: satisFiyati,
        Currency: paraBirimi,
        Stock: stokAdedi,
        ShippingType: kargoTipi,
        ShippingCost: kargoUcreti,
        ProductType: urunTipi,
        Language: urunDil,
        IsDiscounted: indirimVar,
        ImageURL: gorseller[anaGorselIndex]?.url || '',
        opsiyonlar: opsiyonList.filter(o => o.ad && o.ad.trim() !== '') // Sadece adı dolu olan opsiyonları gönder
      };

      console.log('Gönderilen ürün verisi:', productData);

      // Ürünü kaydet ve ProductID'yi al
      const productResponse = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const productResult = await productResponse.json();
      console.log('Ürün kayıt yanıtı:', productResult);

      if (!productResponse.ok) {
        throw new Error(`Ürün kaydedilirken hata: ${productResult.message || productResponse.statusText}`);
      }

      if (!productResult.ProductID) {
        console.error('Ürün kayıt yanıtı detayı:', productResult);
        throw new Error('Ürün kaydedildi fakat ProductID alınamadı. Lütfen backend loglarını kontrol edin.');
      }

      const productId = productResult.ProductID;

      // Seçili kategoriyi kaydet
      const selectedCategory = kategoriler.find(kat => kat.CategoriesName === seciliKategori);
      
      if (!selectedCategory) {
        console.log('Seçili kategori bulunmadığı için kategori kaydı atlanıyor');
      } else {
        console.log(`Kategori ${selectedCategory.CategoriesID} kaydediliyor...`);
        
        const categoryResponse = await fetch('http://localhost:5000/api/product-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ProductID: productId,
            CategoriesID: selectedCategory.CategoriesID
          })
        });

        const categoryResult = await categoryResponse.json();
        console.log(`Kategori kayıt yanıtı:`, categoryResult);
        
        if (!categoryResponse.ok) {
          throw new Error(`Kategori kaydedilirken hata: ${categoryResult.message || categoryResponse.statusText}`);
        }
      }

      // Ürün kaydından sonra:
      if (varyasyonKombinasyonlari.length > 0) {
        // OptionName'den OptionID'ye mapping oluştur
        const optionNameToId = {};
        varyasyonlar.forEach(v => {
          v.secenekler.forEach(opt => {
            optionNameToId[opt.OptionName] = opt.OptionID;
          });
        });

        const combinations = varyasyonKombinasyonlari
          .map(komb => {
            const [v1, v2] = komb.varyasyon.split(' / ');
            return {
              option1ID: optionNameToId[v1],
              option2ID: optionNameToId[v2],
              price: komb.fiyat === '' ? 0 : Number(komb.fiyat),
              stock: komb.stok === '' ? 0 : Number(komb.stok),
              imageUrl: komb.resim?.url || ''
            };
          })
          .filter(komb => komb.price > 0 && komb.stock > 0);

        await fetch('http://localhost:5000/api/variation-combinations/combinations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: productId,
            combinations: combinations
          })
        });
      }

      alert('Ürün ve kategori başarıyla kaydedildi!');
      // Formu temizle
      setUrunAdi('');
      setSatisFiyati('');
      setStokAdedi('');
      setAciklama('');
      setSeciliKategori(''); // Tek kategori için state'i temizle
      setGorseller([]);
      localStorage.removeItem('yuklenenGorseller');

    } catch (error) {
      console.error('Kayıt hatası detayı:', error);
      alert('Ürün kaydedilirken bir hata oluştu: ' + error.message);
    }
  };

  const [anaGorselIndex, setAnaGorselIndex] = useState(null);

  // Kategorileri veritabanından çekme
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        console.log('Kategoriler yükleniyor...');
        const response = await axios.get('http://localhost:5000/api/categories');
        console.log('Kategori yanıtı:', response.data);
        
        if (response.data.success) {
          setKategoriler(response.data.data);
        } else {
          console.error('Kategori yanıtı başarısız:', response.data);
        }
      } catch (error) {
        console.error('Kategoriler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="dashboard-urun-container">
      {/* Breadcrumb */}
      <div className="dashboard-breadcrumb">
        <b>ÜRÜNLER</b> &nbsp; &gt; &nbsp; <b>ÜRÜN LİSTELEME</b>
      </div>

      {/* Ürün görseli ve video yükleme alanı */}
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div className="dashboard-box" onClick={handleAnaGorselBoxClick} style={{ cursor: 'pointer', position: 'relative' }}>
            Ürün görselini bu alana sürükleyin veya yüklemek için tıklayın.
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={anaGorselInputRef}
              onChange={handleGorselSec}
            />
          </div>
        </div>
        {/* Sağda görsellerin listesi */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          {gorseller.map((g, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 16, background: '#fff',
                borderRadius: 8, padding: 16, marginBottom: 12, boxShadow: '0 1px 6px #0001', minWidth: 220,
                border: anaGorselIndex === i ? '2px solid #00e676' : '1px solid #eee',
                cursor: 'pointer'
              }}
              onClick={() => setAnaGorselIndex(i)}
              title="Ana görsel olarak seç"
            >
              <img src={g.url} alt={g.name} style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 16 }}>{g.name}</div>
              </div>
              {anaGorselIndex === i && (
                <span style={{ color: '#00e676', fontSize: 28, marginRight: 8 }}>✔️</span>
              )}
              <button
                onClick={e => { e.stopPropagation(); handleGorselSil(i); }}
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
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 10000,
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
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <span role="img" aria-label="görsel">🖼️</span> Ürün Görselleri
            </div>
            <div className="modal-description">
              Yeni bir görsel yükleyebilir veya mevcut görseller arasından seçim yapabilirsiniz.
            </div>
            <div className="modal-content">
              {/* Yükleme kutusu */}
              <div 
                className="modal-upload-box dashboard-box" 
                onClick={handleModalGorselBoxClick}
              >
                Ürün görselini bu alana sürükleyin veya yüklemek için tıklayın.
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={modalGorselInputRef}
                  onChange={handleGorselSec}
                />
              </div>
              {/* Yüklenen görseller */}
              <div className="modal-image-grid">
                {gorseller.map((g, i) => (
                  <div
                    key={i}
                    onClick={() => handleKombinasyonGorselSec(i)}
                    className={`modal-image-item ${seciliGorselIndex === i ? 'selected' : ''}`}
                  >
                    <img src={g.url} alt={g.name} />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={handleGorselSecKapat} 
                className="modal-button modal-button-secondary"
              >
                KAPAT
              </button>
              <button 
                onClick={handleGorselSecKaydet} 
                className="modal-button modal-button-primary"
              >
                KAYDET
              </button>
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
            <input 
              className="dashboard-input" 
              value={satisFiyati} 
              onChange={handleFiyatChange} 
              placeholder="Satış fiyatı"
              type="text"
              inputMode="decimal"
            />
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
            <input 
              className="dashboard-input" 
              value={stokAdedi} 
              onChange={handleStokChange} 
              placeholder="Stok adedi"
              type="text"
              inputMode="numeric"
              disabled={varyasyon1 && varyasyon2} // Varyasyon seçiliyse devre dışı bırak
            />
            {varyasyon1 && varyasyon2 && (
              <div style={{ color: '#ff0099', fontSize: 13, marginTop: 4 }}>
                Varyasyon seçildiği için stok adedi otomatik olarak toplanmaktadır.
              </div>
            )}
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
            Bu ürünün dükkanınızda hangi kategori altında bulunmasını istediğinizi belirleyin.
          </div>
          {loading ? (
            <div>Kategoriler yükleniyor...</div>
          ) : (
            kategoriler.map((kategori) => (
              <div key={kategori.CategoriesID} style={{ marginBottom: 6 }}>
                <input
                  type="radio"
                  name="kategori"
                  checked={seciliKategori === kategori.CategoriesName}
                  onChange={() => handleKategoriChange(kategori.CategoriesName)}
                />
                <label style={{ marginLeft: 8 }}>{kategori.CategoriesName}</label>
              </div>
            ))
          )}
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
                <div key={`beden-${beden}`}>
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
                        {renkler.map((komb, index) => (
                          <tr key={`kombinasyon-${beden}-${komb.renk}-${index}`}>
                            <td data-label="Renk" style={{ padding: 8 }}>{komb.v2 ? komb.v2.OptionName : komb.renk}</td>
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
                                type="text"
                                className="dashboard-input"
                                style={{ width: 90 }}
                                value={komb.fiyat}
                                onChange={e => handleKombinasyonFiyatChange(
                                  varyasyonKombinasyonlari.findIndex(k => k.varyasyon === komb.varyasyon),
                                  e.target.value
                                )}
                                placeholder="Fiyat"
                                inputMode="decimal"
                              />
                            </td>
                            <td data-label="Stok" style={{ padding: 8 }}>
                              <input
                                type="text"
                                className="dashboard-input"
                                style={{ width: 70 }}
                                value={komb.stok}
                                onChange={e => handleKombinasyonStokChange(
                                  varyasyonKombinasyonlari.findIndex(k => k.varyasyon === komb.varyasyon),
                                  e.target.value
                                )}
                                placeholder="Stok"
                                inputMode="numeric"
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
            {opsiyonList.map((opsiyon, index) => (
              <div key={`opsiyon-${index}`} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  className="dashboard-input"
                  style={{ flex: 2 }}
                  placeholder="Opsiyon Adı"
                  value={opsiyon.ad}
                  onChange={e => handleOpsiyonChange(index, 'ad', e.target.value)}
                />
                <input
                  className="dashboard-input"
                  style={{ flex: 1 }}
                  placeholder="Fiyat"
                  value={opsiyon.fiyat}
                  onChange={e => handleOpsiyonChange(index, 'fiyat', e.target.value)}
                />
              </div>
            ))}
            <button
              type="button"
              className="dashboard-button"
              style={{ padding: '6px 16px', fontSize: 13, background: 'rgb(255 0 141)', color: 'white', border: '1px solid #ccc', marginTop: 4 }}
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
      <button className="dashboard-button" onClick={handleSubmit}>
        ÜRÜNÜ SATIŞA ÇIKAR
      </button>
    </div>
  );
};

export default UrunListeleme;
// Açıklama: Kategori seçimi ve varyasyon/opsiyon seçimi bölümleri, ekran görüntüsüne uygun şekilde ve açıklamalı olarak eklendi. Her varyasyon kombinasyonu için ayrı resim, fiyat ve stok girilebilir. Kategoriler ve opsiyonlar ileride API'den çekilecek şekilde ayarlandı. 