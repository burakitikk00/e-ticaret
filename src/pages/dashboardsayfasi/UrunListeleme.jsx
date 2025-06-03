import React, { useState, useRef, useCallback, useEffect } from 'react';
import '../../css/dashboard/UrunListeleme.css'; // Dashboard ürün ekleme için özel CSS
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import axios from 'axios';

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

  // Varyasyon tipi seçimleri (Dropdown için string)
  const [secilenVaryasyon1Tipi, setSecilenVaryasyon1Tipi] = useState('');
  const [secilenVaryasyon2Tipi, setSecilenVaryasyon2Tipi] = useState('');

  // Varyasyon seçenekleri seçimleri (Checkbox için array)
  const [secilenVaryasyon1Degerleri, setSecilenVaryasyon1Degerleri] = useState([]);
  const [secilenVaryasyon2Degerleri, setSecilenVaryasyon2Degerleri] = useState([]);

  // varyasyonKombinasyonlari state'ini tanımlıyorum (başlangıçta boş dizi)
  const [varyasyonKombinasyonlari, setVaryasyonKombinasyonlari] = useState([]);

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

  // Opsiyon listesi için state
  const [opsiyonList, setOpsiyonList] = useState([{ ad: '', fiyat: '' }]);

  // Varyasyon stoklarının toplamını hesapla
  const hesaplaToplamStok = useCallback(() => {
    if (!secilenVaryasyon1Tipi || !secilenVaryasyon2Tipi) return 0;
    return varyasyonKombinasyonlari.reduce((toplam, komb) => {
      return toplam + (parseInt(komb.stok) || 0);
    }, 0);
  }, [varyasyonKombinasyonlari, secilenVaryasyon1Tipi, secilenVaryasyon2Tipi]);

  // Kategori seçimi değiştiğinde çalışır (radio button mantığı)
  const handleKategoriChange = (kategori) => {
    setSeciliKategori(kategori === seciliKategori ? '' : kategori);
  };

  // Opsiyon ekle
  const handleOpsiyonEkle = () => {
    setOpsiyonList(prev => [...prev, { ad: '', fiyat: '' }]);
  };

  // Opsiyon güncelle
  const handleOpsiyonChange = (index, alan, deger) => {
    setOpsiyonList(prev => {
      const yeni = [...prev];
      yeni[index][alan] = deger;
      return yeni;
    });
  };

  // Opsiyon sil
  const handleOpsiyonSil = (index) => {
    setOpsiyonList(prev => prev.filter((_, i) => i !== index));
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

  // Varyasyon tipi seçimi değiştiğinde çalışır (Dropdown için)
  const handleVaryasyonTipiChange = (index, value) => {
    if (index === 1) {
      setSecilenVaryasyon1Tipi(value);
      setSecilenVaryasyon1Degerleri([]); // Tip değişince seçenekleri sıfırla
    }
    if (index === 2) {
      setSecilenVaryasyon2Tipi(value);
      setSecilenVaryasyon2Degerleri([]); // Tip değişince seçenekleri sıfırla
    }
    // Varyasyon tipleri değişince kombinasyonları sıfırla
    setVaryasyonKombinasyonlari([]);
  };

  // Varyasyon seçeneği (değeri) seçimi değiştiğinde çalışır (Checkbox için)
  const handleVaryasyonDegerChange = (varyasyonIndex, deger) => {
    if (varyasyonIndex === 1) {
      setSecilenVaryasyon1Degerleri(prev => {
        // Seçiliyse kaldır, değilse ekle
        const yeniVaryasyon1 = prev.find(item => item.OptionID === deger.OptionID)
          ? prev.filter(item => item.OptionID !== deger.OptionID)
          : [...prev, deger];

        // Kombinasyonları sadece seçili varyasyonlar için oluştur
        if (yeniVaryasyon1.length > 0 && secilenVaryasyon2Degerleri.length > 0) {
          const yeniKombinasyonlar = yeniVaryasyon1.flatMap(v1 =>
            secilenVaryasyon2Degerleri.map(v2 => ({
              varyasyon: `${v1.OptionName} / ${v2.OptionName}`,
              v1,
              v2,
              stok: '',
              fiyat: '',
              resim: null
            }))
          );
          setVaryasyonKombinasyonlari(yeniKombinasyonlar);
        } else {
          setVaryasyonKombinasyonlari([]);
        }

        return yeniVaryasyon1;
      });
    }
    if (varyasyonIndex === 2) {
      setSecilenVaryasyon2Degerleri(prev => {
        // Seçiliyse kaldır, değilse ekle
        const yeniVaryasyon2 = prev.find(item => item.OptionID === deger.OptionID)
          ? prev.filter(item => item.OptionID !== deger.OptionID)
          : [...prev, deger];

        // Kombinasyonları sadece seçili varyasyonlar için oluştur
        if (secilenVaryasyon1Degerleri.length > 0 && yeniVaryasyon2.length > 0) {
          const yeniKombinasyonlar = secilenVaryasyon1Degerleri.flatMap(v1 =>
            yeniVaryasyon2.map(v2 => ({
              varyasyon: `${v1.OptionName} / ${v2.OptionName}`,
              v1,
              v2,
              stok: '',
              fiyat: '',
              resim: null
            }))
          );
          setVaryasyonKombinasyonlari(yeniKombinasyonlar);
        } else {
          setVaryasyonKombinasyonlari([]);
        }

        return yeniVaryasyon2;
      });
    }
  };

  // Ürün kaydedilince localStorage'dan sil
  const handleSubmit = async () => {
    // Ana görsel seçilmediyse uyarı ver ve kaydı durdur
    if (anaGorselIndex === null || !gorseller[anaGorselIndex]) {
      alert('Lütfen ürün için ana görsel seçiniz!');
      return;
    }
    // Varyasyon seçildiyse ancak kombinasyon oluşturulmadıysa uyarı ver
    if ((secilenVaryasyon1Tipi || secilenVaryasyon2Tipi) && varyasyonKombinasyonlari.length === 0) {
      alert('Lütfen varyasyon seçeneklerini seçip kombinasyonları oluşturun.');
      return;
    }

    try {
      // Önce ürünü kaydet
      const productData = {
        ProductName: urunAdi,
        Description: aciklama,
        BasePrice: satisFiyati,
        Currency: paraBirimi,
        Stock: varyasyonKombinasyonlari.length > 0 ? hesaplaToplamStok() : parseInt(stokAdedi) || 0,
        ShippingType: kargoTipi,
        ShippingCost: kargoUcreti === '' ? 0 : Number(kargoUcreti),
        ProductType: urunTipi,
        Language: urunDil,
        IsDiscounted: indirimVar,
        ImageURL: gorseller[anaGorselIndex]?.url || '',
        Status: true
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
        // Kombinasyonları kaydet
        const combinationsToSave = varyasyonKombinasyonlari.map(komb => ({
          ProductID: parseInt(productId), // ProductID'yi sayıya çevir
          Varyasyon1: secilenVaryasyon1Tipi,
          Varyasyon2: secilenVaryasyon2Tipi,
          Option1: komb.v1.OptionName,
          Option2: komb.v2.OptionName,
        }))
        .filter(komb => komb.Option1 && komb.Option2);

        if (combinationsToSave.length > 0) {
          console.log('Gönderilecek kombinasyonlar:', combinationsToSave); // Log ekledim
          await fetch(`${API_BASE_URL}/urunvaryasyonkaydet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(combinationsToSave)
          });
          console.log('Varyasyon kombinasyonları kaydedildi.');
        }
      }

      alert('Ürün ve kategori başarıyla kaydedildi!');
      // Formu temizle
      setUrunAdi('');
      setSatisFiyati('');
      setStokAdedi('');
      setAciklama('');
      setSeciliKategori(''); // Tek kategori için state'i temizle
      setSecilenVaryasyon1Tipi(''); // Varyasyon tipi state'lerini temizle
      setSecilenVaryasyon2Tipi('');
      setSecilenVaryasyon1Degerleri([]); // Varyasyon seçenekleri state'lerini temizle
      setSecilenVaryasyon2Degerleri([]);
      setVaryasyonKombinasyonlari([]); // Kombinasyonları temizle
      setGorseller([]);
      setAnaGorselIndex(null); // Ana görsel index'ini sıfırla
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

  // Varyasyonları API'den çeken fonksiyon
  const fetchVaryasyonlar = async () => {
    try {
      // API'den varyasyonları çek
      const response = await axios.get(`${API_BASE_URL}/variations`);
      console.log('API\'den gelen varyasyonlar:', response.data);

      // API'den gelen veriyi düzgün şekilde işle
      const data = response.data.map(v => ({
        ad: v.ad,
        VariationID: v.VariationID,
        secenekler: v.secenekler.map((opt, index) => ({
          OptionID: `${v.VariationID}-${index}`, // Benzersiz ID oluştur
          OptionName: opt
        }))
      }));

      console.log('İşlenmiş varyasyon verisi:', data);

      setVaryasyonlar(data);
      setVaryasyonSecenekleri(data.map(v => v.ad));
      const degerler = {};
      data.forEach(v => {
        degerler[v.ad] = v.secenekler;
      });
      setVaryasyonDegerleri(degerler);
    } catch (error) {
      console.error('Varyasyonlar API\'den çekilemedi:', error);
      setVaryasyonlar([]);
      setVaryasyonSecenekleri([]);
      setVaryasyonDegerleri({});
      alert('Varyasyonlar API\'den çekilemedi.');
    }
  };

  // Varyasyonları API'den getir (useEffect)
  useEffect(() => {
    fetchVaryasyonlar();
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
            />
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
          {/* Varyasyon tipi seçimi (Dropdown) */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems:'center'}}>
            <select
              className="dashboard-input"
              value={secilenVaryasyon1Tipi}
              onChange={e => handleVaryasyonTipiChange(1, e.target.value)}
            >
              <option value="">VARYASYON 1 Tipi Seçiniz...</option>
              {varyasyonSecenekleri.map((v, index) => (
                <option key={`varyasyon1-${index}-${v}`} value={v}>{v}</option>
              ))}
            </select>
            <select
              className="dashboard-input"
              value={secilenVaryasyon2Tipi}
              onChange={e => handleVaryasyonTipiChange(2, e.target.value)}
            >
              <option value="">VARYASYON 2 Tipi Seçiniz...</option>
              {varyasyonSecenekleri.map((v, index) => (
                <option key={`varyasyon2-${index}-${v}`} value={v}>{v}</option>
              ))}
            </select>
           
          </div>

          {/* Seçilen varyasyon tiplerine ait seçeneklerin çoklu seçimi (Checkboxlar) */}
          {(secilenVaryasyon1Tipi || secilenVaryasyon2Tipi) && (
            <div style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
              {/* Varyasyon 1 Seçenekleri */}
              {secilenVaryasyon1Tipi && varyasyonDegerleri[secilenVaryasyon1Tipi] && (
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={{ fontWeight: 500, marginBottom: 6 }}>{secilenVaryasyon1Tipi} Seçenekleri</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {varyasyonDegerleri[secilenVaryasyon1Tipi].map((deger, index) => (
                      <label key={`v1-${deger.OptionID}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15 }}>
                        <input
                          type="checkbox"
                          checked={secilenVaryasyon1Degerleri.find(item => item.OptionID === deger.OptionID) !== undefined}
                          onChange={() => handleVaryasyonDegerChange(1, deger)}
                        />
                        {deger.OptionName}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Varyasyon 2 Seçenekleri */}
              {secilenVaryasyon2Tipi && varyasyonDegerleri[secilenVaryasyon2Tipi] && (
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={{ fontWeight: 500, marginBottom: 6 }}>{secilenVaryasyon2Tipi} Seçenekleri</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {varyasyonDegerleri[secilenVaryasyon2Tipi].map((deger, index) => (
                      <label key={`v2-${deger.OptionID}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15 }}>
                        <input
                          type="checkbox"
                          checked={secilenVaryasyon2Degerleri.find(item => item.OptionID === deger.OptionID) !== undefined}
                          onChange={() => handleVaryasyonDegerChange(2, deger)}
                        />
                        {deger.OptionName}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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