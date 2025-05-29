import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../../css/dashboard/VaryasyonAyarlar.css';

// API base URL
const API_URL = 'http://localhost:5000/api';

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
  const [varyasyonlar, setVaryasyonlar] = useState([]);
  // Yeni varyasyon adı için state
  const [yeniVaryasyon, setYeniVaryasyon] = useState('');
  // Düzenlenen varyasyonun index'i ve adı
  const [duzenlenenVaryasyon, setDuzenlenenVaryasyon] = useState(null);
  const [duzenlenenVaryasyonAdi, setDuzenlenenVaryasyonAdi] = useState('');

  // Modal için state
  const [modalAcik, setModalAcik] = useState(false);
  const [modalVaryasyonIndex, setModalVaryasyonIndex] = useState(null);
  const [modalVaryasyon, setModalVaryasyon] = useState(null);

  // Modal içi seçenek ekleme/düzenleme için state
  const [yeniSecenek, setYeniSecenek] = useState('');
  const [duzenlenenSecenekIndex, setDuzenlenenSecenekIndex] = useState(null);
  const [duzenlenenSecenek, setDuzenlenenSecenek] = useState('');

  // Modal dışında tıklanınca kapansın diye ref
  const modalRef = useRef();

  // Sayfa yüklendiğinde varyasyonları getir
  useEffect(() => {
    fetchVaryasyonlar();
  }, []);

  // Varyasyonları getir
  const fetchVaryasyonlar = async () => {
    try {
      const response = await axios.get(`${API_URL}/variations`);
      setVaryasyonlar(response.data);
    } catch (error) {
      console.error('Varyasyonlar getirilirken hata:', error);
      // Hata durumunda boş array ile başlat
      setVaryasyonlar([]);
    }
  };

  // Varyasyon ekle
  const handleVaryasyonEkle = async () => {
    if (!yeniVaryasyon.trim()) return;
    try {
      const response = await axios.post(`${API_URL}/variations`, {
        variationName: yeniVaryasyon
      });
      setVaryasyonlar([...varyasyonlar, response.data]);
      setYeniVaryasyon('');
    } catch (error) {
      console.error('Varyasyon eklenirken hata:', error);
      alert('Varyasyon eklenirken bir hata oluştu!');
    }
  };

  // Varyasyon sil
  const handleVaryasyonSil = async (index) => {
    try {
      const response = await axios.delete(`${API_URL}/variations/${varyasyonlar[index].VariationID}`);
      setVaryasyonlar(varyasyonlar.filter((_, i) => i !== index));
      if (modalVaryasyonIndex === index) {
        setModalAcik(false);
        setModalVaryasyon(null);
        setModalVaryasyonIndex(null);
      }
    } catch (error) {
      console.error('Varyasyon silinirken hata:', error);
      
      // Özel hata mesajları
      let hataMesaji = 'Varyasyon silinirken bir hata oluştu!';
      
      if (error.response?.data?.message?.includes('REFERENCE constraint')) {
        hataMesaji = 'Bu varyasyon şu anda ürünlerde kullanılıyor. Varyasyonu silmek için önce bu varyasyonu kullanan ürünlerin varyasyon bilgilerini kaldırmanız gerekiyor.';
      } else if (error.response?.data?.message) {
        hataMesaji = error.response.data.message;
      } else if (error.message) {
        hataMesaji = error.message;
      }

      // Uyarı mesajını göster
      if (window.confirm(hataMesaji + '\n\nÜrünlerdeki varyasyon bilgilerini görüntülemek ister misiniz?')) {
        // Burada ürünler sayfasına yönlendirme yapılabilir
        // Örnek: window.location.href = '/urunler';
        alert('Ürünler sayfasına yönlendirileceksiniz. Lütfen önce bu varyasyonu kullanan ürünlerin varyasyon bilgilerini güncelleyin.');
      }
    }
  };

  // Varyasyon adını kaydet
  const handleVaryasyonKaydet = async (index) => {
    if (!duzenlenenVaryasyonAdi.trim()) return;
    try {
      const response = await axios.put(`${API_URL}/variations/${varyasyonlar[index].VariationID}`, {
        ad: duzenlenenVaryasyonAdi,
        secenekler: varyasyonlar[index].secenekler || []
      });
      
      // Güncellenmiş varyasyonu state'e ekle
      const yeniVaryasyonlar = [...varyasyonlar];
      yeniVaryasyonlar[index] = response.data;
      setVaryasyonlar(yeniVaryasyonlar);
      
      // Düzenleme modunu kapat
      setDuzenlenenVaryasyon(null);
      setDuzenlenenVaryasyonAdi('');
    } catch (error) {
      console.error('Varyasyon güncellenirken hata:', error);
      alert('Varyasyon güncellenirken bir hata oluştu!');
    }
  };

  // Varyasyon adını düzenle moduna geç
  const handleVaryasyonDuzenle = (index) => {
    setDuzenlenenVaryasyon(index);
    setDuzenlenenVaryasyonAdi(varyasyonlar[index].ad);
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
  const handleModalKaydet = async () => {
    if (!modalVaryasyon || !modalVaryasyon.ad.trim()) {
      alert('Varyasyon adı boş olamaz!');
      return;
    }
    
    try {
      // Seçenekleri temizle (boş olanları kaldır)
      const temizSecenekler = modalVaryasyon.secenekler
        .filter(secenek => secenek && secenek.trim())
        .map(secenek => secenek.trim());

      console.log('Gönderilecek veri:', {
        ad: modalVaryasyon.ad,
        secenekler: temizSecenekler
      });

      const response = await axios.put(
        `${API_URL}/variations/${varyasyonlar[modalVaryasyonIndex].VariationID}`,
        {
          ad: modalVaryasyon.ad.trim(),
          secenekler: temizSecenekler
        }
      );

      console.log('Sunucu yanıtı:', response.data);

      if (!response.data || !response.data.VariationID) {
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }

      // Güncellenmiş varyasyonu state'e ekle
      const yeniVaryasyonlar = [...varyasyonlar];
      yeniVaryasyonlar[modalVaryasyonIndex] = response.data;
      setVaryasyonlar(yeniVaryasyonlar);

      // Modalı kapat
      setModalAcik(false);
      setModalVaryasyon(null);
      setModalVaryasyonIndex(null);
      setYeniSecenek('');
    } catch (error) {
      console.error('Varyasyon güncellenirken hata:', error);
      
      // Özel hata mesajları
      let hataMesaji = 'Varyasyon güncellenirken bir hata oluştu!';
      
      if (error.response?.data?.message?.includes('REFERENCE constraint')) {
        hataMesaji = 'Bu varyasyon şu anda ürünlerde kullanılıyor. Varyasyonu güncellemek için önce bu varyasyonu kullanan ürünlerin varyasyon bilgilerini kaldırmanız gerekiyor.';
      } else if (error.response?.data?.message) {
        hataMesaji = error.response.data.message;
      } else if (error.message) {
        hataMesaji = error.message;
      }

      // Uyarı mesajını göster
      if (window.confirm(hataMesaji + '\n\nÜrünlerdeki varyasyon bilgilerini görüntülemek ister misiniz?')) {
        // Burada ürünler sayfasına yönlendirme yapılabilir
        // Örnek: window.location.href = '/urunler';
        alert('Ürünler sayfasına yönlendirileceksiniz. Lütfen önce bu varyasyonu kullanan ürünlerin varyasyon bilgilerini güncelleyin.');
      }
    }
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