import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/dashboard/SatistakiUrunler.css';

// Örnek ürün verisi (ileride API'den çekilecek)
const urunler = [
  {
    id: 1,
    ad: 'Yves Saint Laurent clutch',
    durum: 'AKTİF',
    stok: 12,
    fiyat: '850,00 TL',
    tarih: '13/05/2025',
    resim: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    aciklama: 'Yves Saint Laurent marka clutch çanta',
    kategori: ['Çantalar'],
    paraBirimi: 'TL',
    kargoTipi: 'Sepette Ödeme',
    kargoUcreti: '0',
    urunTipi: 'Fiziksel',
    urunDil: 'Türkçe'
  },
  {
    id: 2,
    ad: 'Mini vakko Speddy',
    durum: 'PASİF',
    stok: 0,
    fiyat: '779,99 TL',
    tarih: '12/05/2025',
    resim: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    aciklama: 'Vakko marka mini speddy çanta',
    kategori: ['Çantalar'],
    paraBirimi: 'TL',
    kargoTipi: 'Ücretsiz Kargo',
    kargoUcreti: '0',
    urunTipi: 'Fiziksel',
    urunDil: 'Türkçe'
  },
  {
    id: 3,
    ad: 'Victoria Secret Çanta',
    durum: 'AKTİF',
    stok: 5,
    fiyat: '1.299,00 TL',
    tarih: '10/05/2025',
    resim: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    aciklama: 'Victoria Secret marka çanta',
    kategori: ['Çantalar'],
    paraBirimi: 'TL',
    kargoTipi: 'Sepette Ödeme',
    kargoUcreti: '0',
    urunTipi: 'Fiziksel',
    urunDil: 'Türkçe'
  },
  // Daha fazla ürün eklenebilir...
];

const SatistakiUrunler = () => {
  const [acikMenu, setAcikMenu] = useState(null);
  const [aktifSayfa, setAktifSayfa] = useState(1);
  const [urunler, setUrunler] = useState([
    {
      id: 1,
      ad: 'Yves Saint Laurent clutch',
      durum: 'AKTİF',
      stok: 12,
      fiyat: '850,00 TL',
      tarih: '13/05/2025',
      resim: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      aciklama: 'Yves Saint Laurent marka clutch çanta',
      kategori: ['Çantalar'],
      paraBirimi: 'TL',
      kargoTipi: 'Sepette Ödeme',
      kargoUcreti: '0',
      urunTipi: 'Fiziksel',
      urunDil: 'Türkçe'
    },
    {
      id: 2,
      ad: 'Mini vakko Speddy',
      durum: 'PASİF',
      stok: 0,
      fiyat: '779,99 TL',
      tarih: '12/05/2025',
      resim: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      aciklama: 'Vakko marka mini speddy çanta',
      kategori: ['Çantalar'],
      paraBirimi: 'TL',
      kargoTipi: 'Ücretsiz Kargo',
      kargoUcreti: '0',
      urunTipi: 'Fiziksel',
      urunDil: 'Türkçe'
    },
    {
      id: 3,
      ad: 'Victoria Secret Çanta',
      durum: 'AKTİF',
      stok: 5,
      fiyat: '1.299,00 TL',
      tarih: '10/05/2025',
      resim: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      aciklama: 'Victoria Secret marka çanta',
      kategori: ['Çantalar'],
      paraBirimi: 'TL',
      kargoTipi: 'Sepette Ödeme',
      kargoUcreti: '0',
      urunTipi: 'Fiziksel',
      urunDil: 'Türkçe'
    }
  ]);
  const sayfaBasinaUrun = 25;
  const menuRefs = useRef({}); // Her ürün için ayrı ref tutacak obje
  const navigate = useNavigate();

  // Toplam sayfa sayısını hesapla
  const toplamSayfa = Math.ceil(urunler.length / sayfaBasinaUrun);

  // Aktif sayfadaki ürünleri filtrele
  const aktifSayfaUrunleri = urunler.slice(
    (aktifSayfa - 1) * sayfaBasinaUrun,
    aktifSayfa * sayfaBasinaUrun
  );

  // İşlemler menüsünü aç/kapat
  const handleMenuToggle = (id, event) => {
    event.stopPropagation();
    setAcikMenu(acikMenu === id ? null : id);
  };

  // Sayfa değiştirme fonksiyonu
  const handleSayfaDegistir = (sayfaNo) => {
    setAktifSayfa(sayfaNo);
    setAcikMenu(null);
  };

  // Dışarı tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Tüm menü ref'lerini kontrol et
      const clickedOutsideAllMenus = Object.values(menuRefs.current).every(
        ref => !ref?.current?.contains(event.target)
      );
      
      if (clickedOutsideAllMenus) {
        setAcikMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Ürün düzenleme sayfasına yönlendir
  const handleDuzenle = (urun) => {
    try {
      // Ürün bilgilerini localStorage'a kaydet
      localStorage.setItem('duzenlenecekUrun', JSON.stringify(urun));
      // Ürün listeleme sayfasına yönlendir
      navigate('/dashboard/urun-listeleme');
    } catch (error) {
      console.error('Düzenleme hatası:', error);
      alert('Düzenleme işlemi sırasında bir hata oluştu!');
    }
  };

  // Ürünü pasifleştir/aktifleştir
  const handleDurumDegistir = (urun) => {
    try {
      setUrunler(prevUrunler => 
        prevUrunler.map(u => 
          u.id === urun.id 
            ? { ...u, durum: u.durum === 'AKTİF' ? 'PASİF' : 'AKTİF' } 
            : u
        )
      );
      setAcikMenu(null);
      alert(`Ürün ${urun.durum === 'AKTİF' ? 'pasifleştirildi' : 'aktifleştirildi'}!`);
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
      alert('Durum değiştirme işlemi sırasında bir hata oluştu!');
    }
  };

  // Ürünü sil
  const handleSil = (urun) => {
    try {
      if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        setUrunler(prevUrunler => prevUrunler.filter(u => u.id !== urun.id));
        setAcikMenu(null);
        alert('Ürün başarıyla silindi!');
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Silme işlemi sırasında bir hata oluştu!');
    }
  };

  return (
    <div className="satistaki-urunler-container">
      <div className="satistaki-baslik">SATIŞTAKİ ÜRÜNLER</div>
      <table className="satistaki-table">
        <thead>
          <tr>
            <th>ÜRÜN</th>
            <th>DURUM</th>
            <th>STOK</th>
            <th>FİYAT</th>
            <th>EKLENME TARİHİ</th>
            <th>İŞLEMLER</th>
          </tr>
        </thead>
        <tbody>
          {aktifSayfaUrunleri.map((urun) => (
            <tr key={urun.id}>
              <td>
                <div className="satistaki-urun-bilgi">
                  <img src={urun.resim} alt={urun.ad} className="satistaki-urun-resim" />
                  <span className="satistaki-urun-adi">{urun.ad}</span>
                </div>
              </td>
              <td>
                <span className={`satistaki-durum ${urun.durum === 'AKTİF' ? 'aktif' : 'pasif'}`}>
                  {urun.durum}
                </span>
              </td>
              <td>{urun.stok}</td>
              <td>{urun.fiyat}</td>
              <td>{urun.tarih}</td>
              <td style={{ position: 'relative' }}>
                <div ref={el => menuRefs.current[urun.id] = { current: el }}>
                  <button 
                    className="satistaki-islem-btn" 
                    onClick={(e) => handleMenuToggle(urun.id, e)}
                  >
                    İŞLEMLER <span style={{ fontSize: 14 }}>▼</span>
                  </button>
                  {acikMenu === urun.id && (
                    <div className="satistaki-islem-menu">
                      <div 
                        className="satistaki-islem-item"
                        onClick={() => handleDuzenle(urun)}
                      >
                        Düzenle
                      </div>
                      <div 
                        className="satistaki-islem-item"
                        onClick={() => handleDurumDegistir(urun)}
                      >
                        {urun.durum === 'AKTİF' ? 'Ürünü Pasifleştir' : 'Ürünü Aktifleştir'}
                      </div>
                      <div 
                        className="satistaki-islem-item"
                        onClick={() => handleSil(urun)}
                      >
                        Ürünü Sil
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Sayfalama */}
      <div className="satistaki-pagination">
        <span>
          Toplam {urunler.length} kayıttan <b>{(aktifSayfa - 1) * sayfaBasinaUrun + 1} ile {Math.min(aktifSayfa * sayfaBasinaUrun, urunler.length)}</b> arası gösteriliyor
        </span>
        <div className="satistaki-pagination-pages">
          {[...Array(toplamSayfa)].map((_, index) => (
            <span
              key={index + 1}
              className={aktifSayfa === index + 1 ? 'active' : ''}
              onClick={() => handleSayfaDegistir(index + 1)}
            >
              {index + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SatistakiUrunler;
// Açıklama: Satıştaki ürünler tablosu, işlemler menüsü ve responsive yapı eklendi. CSS ayrı dosyada. 