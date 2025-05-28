import React, { useState, useEffect, useRef } from 'react';
import '../../css/dashboard/SatistakiUrunler.css';

const SatistakiUrunler = () => {
  const [acikMenu, setAcikMenu] = useState(null);
  const [aktifSayfa, setAktifSayfa] = useState(1);
  const [urunler, setUrunler] = useState([]); // Başlangıçta boş, ürünler API'den gelecek
  const sayfaBasinaUrun = 25;
  const menuRefs = useRef({}); // Her ürün için ayrı ref tutacak obje

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

  // Ürünü sil
  const handleSil = async (urun) => {
    try {
      if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        // API'ye DELETE isteği gönder
        const response = await fetch(`http://localhost:5000/api/products/${urun.id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          // Silme başarılı olursa frontend state'ini güncelle
          setUrunler(prevUrunler => prevUrunler.filter(u => u.id !== urun.id));
          setAcikMenu(null);
          alert('Ürün başarıyla silindi!');
        } else {
          // Hata durumunda kullanıcıya bilgi ver
          alert('Ürün silinirken bir hata oluştu: ' + data.message);
        }
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Silme işlemi sırasında bir hata oluştu!');
    }
  };

  // Ürünü pasifleştir/aktifleştir
  const handleDurumDegistir = async (urun) => {
    try {
      // Yeni durumu belirle (Eğer ürünün Status'ü true ise false yap, değilse true yap)
      const yeniStatus = urun.Status === true ? false : true; // urun.Status boolean değerine göre belirle

      // API'ye PATCH isteği gönder
      const response = await fetch(`http://localhost:5000/api/products/${urun.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: yeniStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Durum güncelleme başarılı olursa frontend state'ini güncelle
        setUrunler(prevUrunler =>
          prevUrunler.map(u =>
            u.id === urun.id
              // Frontend durumunu yeniStatus değerine göre güncelle
              ? { ...u, durum: yeniStatus === true ? 'AKTİF' : 'PASİF', Status: yeniStatus } // Status alanını da boolean olarak güncelle
              : u
          )
        );
        setAcikMenu(null);
        alert(`Ürün ${yeniStatus === false ? 'pasifleştirildi' : 'aktifleştirildi'}!`); // Mesajı yeniStatus boolean değerine göre ayarla
      } else {
        // Hata durumunda kullanıcıya bilgi ver
        alert('Ürün durumu güncellenirken bir hata oluştu: ' + data.message);
      }
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
      alert('Durum değiştirme işlemi sırasında bir hata oluştu!');
    }
  };

  // Sayfa yüklendiğinde API'den ürünleri çek
  useEffect(() => {
    fetch('http://localhost:5000/api/products') // Backend API adresini kendi portuna göre ayarla
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('API\'den çekilen ürün ham veri:', data.products); // Log ekledim
          // API'den gelen ürünleri uygun formata çevirip state'e aktar
          // Ürünleri eklenme tarihine göre yeniden eskiye doğru sırala
          const sortedProducts = data.products.sort((a, b) => {
            const dateA = new Date(a.CreatedAt);
            const dateB = new Date(b.CreatedAt);
            return dateB - dateA; // Yeniden eskiye doğru sıralama (azalan)
          });

          setUrunler(
            sortedProducts.map(urun => ({
              id: urun.ProductID,
              ad: urun.ProductName,
              // Durumu API'den gelen Status değerine göre belirle (true: AKTİF, false/null: PASİF)
              durum: urun.Status === true ? 'AKTİF' : 'PASİF',
              stok: urun.Stock,
              fiyat: `${Number(urun.BasePrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${urun.Currency}`,
              tarih: urun.CreatedAt ? new Date(urun.CreatedAt).toLocaleDateString('tr-TR') : '',
              // ImageURL boş veya null ise placeholder göster
              resim: urun.ImageURL || '', // src hatasını önlemek için boş string yap
              aciklama: urun.Description,
              kategori: [], // Kategoriler için ayrıca API çağrısı gerekebilir
              paraBirimi: urun.Currency,
              kargoTipi: urun.ShippingType,
              kargoUcreti: urun.ShippingCost || '0', // Backend modelde ShippingCost idi
              urunTipi: urun.ProductType,
              urunDil: urun.Language,
              Status: urun.Status // Backend'den gelen Status değerini tutalım
            }))
          );
        }
      })
      .catch(err => {
        console.error('Ürünler çekilemedi:', err);
      });
  }, []); // Sadece ilk yüklemede çalışır

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
                  {urun.resim ? ( // urun.resim dolu mu kontrol et
                    <img src={urun.resim} alt={urun.ad} className="satistaki-urun-resim" />
                  ) : (
                    // Resim yoksa buraya varsayılan bir resim veya boş bir div koyabilirsin
                     <div className="satistaki-urun-resim-placeholder">Resim Yok</div>
                  )}
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