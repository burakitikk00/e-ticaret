import React, { useState } from 'react';
import '..//../css/dashboard/SatistakiUrunler';

// Örnek ürün verisi (ileride API'den çekilecek)
const urunler = [
  {
    id: 1,
    ad: 'Yves Saint Laurent clutch',
    durum: 'AKTİF',
    stok: 12,
    fiyat: '850,00 TL',
    tarih: '13/05/2025',
  },
  {
    id: 2,
    ad: 'Mini vakko Speddy',
    durum: 'PASİF',
    stok: 0,
    fiyat: '779,99 TL',
    tarih: '12/05/2025',
  },
  {
    id: 3,
    ad: 'Victoria Secret Çanta',
    durum: 'AKTİF',
    stok: 5,
    fiyat: '1.299,00 TL',
    tarih: '10/05/2025',
  },
];

const SatistakiUrunler = () => {
  const [acikMenu, setAcikMenu] = useState(null);

  // İşlemler menüsünü aç/kapat
  const handleMenuToggle = (id) => {
    setAcikMenu(acikMenu === id ? null : id);
  };

  return (
    <div className="satistaki-urunler-container">
      <div className="satistaki-baslik">SATIŞTAKİ ÜRÜNLER</div>
      <div className="satistaki-table-wrapper">
        <table className="satistaki-table">
          <thead>
            <tr>
              <th>ÜRÜN ADI</th>
              <th>DURUM</th>
              <th>STOK</th>
              <th>FİYAT</th>
              <th>EKLENME TARİHİ</th>
              <th>İŞLEMLER</th>
            </tr>
          </thead>
          <tbody>
            {urunler.map((urun) => (
              <tr key={urun.id}>
                <td className="satistaki-urun-adi">{urun.ad}</td>
                <td>
                  <span className={`satistaki-durum ${urun.durum === 'AKTİF' ? 'aktif' : 'pasif'}`}>{urun.durum}</span>
                </td>
                <td>{urun.stok}</td>
                <td>{urun.fiyat}</td>
                <td>{urun.tarih}</td>
                <td style={{ position: 'relative' }}>
                  <button className="satistaki-islem-btn" onClick={() => handleMenuToggle(urun.id)}>
                    İŞLEMLER <span style={{ fontSize: 14 }}>▼</span>
                  </button>
                  {acikMenu === urun.id && (
                    <div className="satistaki-islem-menu">
                      <div className="satistaki-islem-item">Düzenle</div>
                      <div className="satistaki-islem-item">Stok Güncelle</div>
                      <div className="satistaki-islem-item">Ürünü Pasifleştir</div>
                      <div className="satistaki-islem-item">Ürünü Sil</div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Sayfalama örneği */}
      <div className="satistaki-pagination">
        <span>Toplam 3 kayıttan <b>1 ile 3</b> arası gösteriliyor</span>
        <div className="satistaki-pagination-pages">
          <span className="active">1</span>
        </div>
      </div>
    </div>
  );
};

export default SatistakiUrunler;
// Açıklama: Satıştaki ürünler tablosu, işlemler menüsü ve responsive yapı eklendi. CSS ayrı dosyada. 