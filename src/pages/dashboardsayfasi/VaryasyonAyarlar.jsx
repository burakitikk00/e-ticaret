import React, { useState, useEffect, useRef } from 'react';
import '../../css/dashboard/VaryasyonAyarlar.css';

// Başlangıçta örnek varyasyonlar (ileride API'den çekilecek)
const ornekVaryasyonlar = [
  {
    ad: 'Renk',
    secenekler: ['Kırmızı Renk', 'Beyaz Renk', 'Siyah Renk', 'Krem renk', 'Bej Renk', 'Pembe Renk']
  },
  {
    ad: 'Numara Seç',
    secenekler: ['36', '37', '38', '39', '40']
  },
  {
    ad: 'Askı Renkleri',
    secenekler: ['Altın', 'Gümüş', 'Siyah']
  }
];

const VaryasyonAyarlar = () => {
  // Varyasyonlar state'i
  const [varyasyonlar, setVaryasyonlar] = useState(ornekVaryasyonlar);
  // Yeni varyasyon adı için state
  const [yeniVaryasyon, setYeniVaryasyon] = useState('');
  // Düzenlenen varyasyonun index'i ve adı
  const [duzenlenenVaryasyon, setDuzenlenenVaryasyon] = useState(null);
  const [duzenlenenVaryasyonAdi, setDuzenlenenVaryasyonAdi] = useState('');

  // Modal için state
  const [modalAcik, setModalAcik] = useState(false);
  const [modalVaryasyonIndex, setModalVaryasyonIndex] = useState(null);
  const [modalVaryasyon, setModalVaryasyon] = useState(null); // Modalda düzenlenen varyasyonun kopyası

  // Modal içi seçenek ekleme/düzenleme için state
  const [yeniSecenek, setYeniSecenek] = useState('');
  const [duzenlenenSecenekIndex, setDuzenlenenSecenekIndex] = useState(null);
  const [duzenlenenSecenek, setDuzenlenenSecenek] = useState('');

  // Modal dışında tıklanınca kapansın diye ref
  const modalRef = useRef();
  useEffect(() => {
    if (!modalAcik) return;
    const handleClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setModalAcik(false);
        setModalVaryasyon(null);
        setModalVaryasyonIndex(null);
        setDuzenlenenSecenekIndex(null);
        setDuzenlenenSecenek('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [modalAcik]);

  // Varyasyonlar değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('varyasyonlar', JSON.stringify(varyasyonlar));
  }, [varyasyonlar]);

  // Varyasyon ekle
  const handleVaryasyonEkle = () => {
    if (!yeniVaryasyon.trim()) return;
    setVaryasyonlar([...varyasyonlar, { ad: yeniVaryasyon, secenekler: [] }]);
    setYeniVaryasyon('');
  };

  // Varyasyon sil
  const handleVaryasyonSil = (index) => {
    setVaryasyonlar(varyasyonlar.filter((_, i) => i !== index));
    // Eğer modal açıksa ve silinen varyasyon ise modalı kapat
    if (modalVaryasyonIndex === index) {
      setModalAcik(false);
      setModalVaryasyon(null);
      setModalVaryasyonIndex(null);
    }
  };

  // Varyasyon adını düzenle moduna geç
  const handleVaryasyonDuzenle = (index) => {
    setDuzenlenenVaryasyon(index);
    setDuzenlenenVaryasyonAdi(varyasyonlar[index].ad);
  };

  // Varyasyon adını kaydet
  const handleVaryasyonKaydet = (index) => {
    const yeni = [...varyasyonlar];
    yeni[index].ad = duzenlenenVaryasyonAdi;
    setVaryasyonlar(yeni);
    setDuzenlenenVaryasyon(null);
    setDuzenlenenVaryasyonAdi('');
  };

  // Varyasyon kutusuna tıklayınca modalı aç
  const handleVaryasyonModalAc = (index) => {
    setModalVaryasyonIndex(index);
    setModalVaryasyon({ ...varyasyonlar[index], secenekler: [...varyasyonlar[index].secenekler] }); // Kopya
    setModalAcik(true);
    setDuzenlenenSecenekIndex(null);
    setDuzenlenenSecenek('');
    setYeniSecenek('');
  };

  // Modalda seçenek ekle
  const handleSecenekEkle = () => {
    if (!yeniSecenek.trim()) return;
    setModalVaryasyon((prev) => ({ ...prev, secenekler: [...prev.secenekler, yeniSecenek] }));
    setYeniSecenek('');
  };

  // Modalda seçenek sil
  const handleSecenekSil = (sIndex) => {
    setModalVaryasyon((prev) => ({ ...prev, secenekler: prev.secenekler.filter((_, i) => i !== sIndex) }));
  };

  // Modalda seçenek düzenle moduna geç
  const handleSecenekDuzenle = (sIndex) => {
    setDuzenlenenSecenekIndex(sIndex);
    setDuzenlenenSecenek(modalVaryasyon.secenekler[sIndex]);
  };

  // Modalda seçenek kaydet
  const handleSecenekKaydet = (sIndex) => {
    const yeniSecenekler = [...modalVaryasyon.secenekler];
    yeniSecenekler[sIndex] = duzenlenenSecenek;
    setModalVaryasyon((prev) => ({ ...prev, secenekler: yeniSecenekler }));
    setDuzenlenenSecenekIndex(null);
    setDuzenlenenSecenek('');
  };

  // Modalda değişiklikleri kaydet
  const handleModalKaydet = () => {
    const yeni = [...varyasyonlar];
    yeni[modalVaryasyonIndex] = modalVaryasyon;
    setVaryasyonlar(yeni);
    setModalAcik(false);
    setModalVaryasyon(null);
    setModalVaryasyonIndex(null);
  };

  // Modalı iptal et
  const handleModalIptal = () => {
    setModalAcik(false);
    setModalVaryasyon(null);
    setModalVaryasyonIndex(null);
    setDuzenlenenSecenekIndex(null);
    setDuzenlenenSecenek('');
  };

  return (
    <div className="varyasyon-ayarlar-container">
      <h2>Varyasyon Tanımlama</h2>
      <div className="varyasyon-ekle-row">
        <input
          type="text"
          placeholder="Varyasyon Adı"
          value={yeniVaryasyon}
          onChange={e => setYeniVaryasyon(e.target.value)}
        />
        <button onClick={handleVaryasyonEkle}>+</button>
      </div>
      <div className="varyasyonlar-listesi kutulu-list">
        <b>Mevcut Varyasyonlar</b>
        <div className="varyasyonlar-grid">
          {varyasyonlar.map((v, i) => (
            <div key={i} className="varyasyon-card">
              {duzenlenenVaryasyon === i ? (
                <>
                  <input
                    value={duzenlenenVaryasyonAdi}
                    onChange={e => setDuzenlenenVaryasyonAdi(e.target.value)}
                  />
                  <button onClick={() => handleVaryasyonKaydet(i)}>💾</button>
                  <button onClick={() => setDuzenlenenVaryasyon(null)}>İptal</button>
                </>
              ) : (
                <>
                  <span className="varyasyon-ad" onClick={() => handleVaryasyonModalAc(i)}>{v.ad}</span>
                  <button onClick={() => handleVaryasyonDuzenle(i)} title="Varyasyon Adını Düzenle">✏️</button>
                  <button onClick={() => handleVaryasyonSil(i)} title="Varyasyonu Sil">🗑️</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalAcik && (
        <div className="modal-overlay">
          <div className="modal-content modal-varyasyon" ref={modalRef}>
            <h3 style={{textAlign:'center',marginBottom:18}}>
              <b>{modalVaryasyon.ad}</b> için Seçenekler
            </h3>
            <div className="secenek-ekle-row">
              <input
                type="text"
                placeholder="Seçenek Ekle"
                value={yeniSecenek}
                onChange={e => setYeniSecenek(e.target.value)}
              />
              <button onClick={handleSecenekEkle}>+</button>
            </div>
            <div className="secenekler-listesi">
              <b>Mevcut Seçenekler</b>
              {modalVaryasyon.secenekler.length === 0 && <div style={{color:'#aaa',fontSize:15}}>Henüz seçenek yok.</div>}
              {modalVaryasyon.secenekler.map((s, si) => (
                <div key={si} className="secenek-item">
                  {duzenlenenSecenekIndex === si ? (
                    <>
                      <input
                        value={duzenlenenSecenek}
                        onChange={e => setDuzenlenenSecenek(e.target.value)}
                      />
                      <button onClick={() => handleSecenekKaydet(si)}>💾</button>
                      <button onClick={() => setDuzenlenenSecenekIndex(null)}>İptal</button>
                    </>
                  ) : (
                    <>
                      <span onClick={() => handleSecenekDuzenle(si)} style={{ cursor: 'pointer' }}>{s}</span>
                      <button onClick={() => handleSecenekDuzenle(si)} title="Düzenle">✏️</button>
                      <button onClick={() => handleSecenekSil(si)} title="Sil">🗑️</button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="modal-buttons">
              <button className="modal-submit-btn" onClick={handleModalKaydet}>Kayıt Et</button>
              <button className="modal-cancel-btn" onClick={handleModalIptal}>İptal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaryasyonAyarlar;
// Açıklama: Varyasyonlar kutulu ve düzenli listelenir. Üstüne tıklayınca modal açılır, seçenekler modalda eklenir/düzenlenir/silinir. Responsive ve kullanıcı dostu bir yapı sağlanır. 