import React, { useState, useRef, useEffect } from "react";
import "./../../css/dashboard/siparisler.css";
import "../../css/Adreslerim.css"; // Modal için gerekli
import { Link } from "react-router-dom"; // Link ekle
import axiosInstance from '../../utils/axiosConfig'; // API istekleri için axiosInstance'ı ekle

// Adres modalı için boş adres şablonu
const emptyAddress = {
  adres: "",
  apartman: "",
  postaKodu: "",
  il: "",
  ilce: "",
  telefon: "",
};

const Siparisler = () => {
  const [siparisler, setSiparisler] = useState([]);
  const [acikSiparis, setAcikSiparis] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sayfalama için state
  const [aktifSayfa, setAktifSayfa] = useState(1);
  const sayfaBasinaSiparis = 25;
  const toplamSayfa = Math.ceil(siparisler.length / sayfaBasinaSiparis);

  // Aktif sayfadaki siparişleri filtrele
  const aktifSayfaSiparisleri = siparisler.slice(
    (aktifSayfa - 1) * sayfaBasinaSiparis,
    aktifSayfa * sayfaBasinaSiparis
  );

  // Adres modalı için state
  const [adresModal, setAdresModal] = useState({ acik: false, index: null, adres: emptyAddress });

  // Menü dışında tıklanınca menüyü kapat
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    if (openMenu !== null) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenu]);

  // Sipariş detayını aç/kapat
  const handleSiparisClick = (index) => {
    setAcikSiparis(acikSiparis === index ? null : index);
  };

  // Menü aç/kapat
  const handleMenuToggle = (index, e) => {
    e.stopPropagation();
    setOpenMenu(openMenu === index ? null : index);
  };

  // WhatsApp linki oluştur
  const getWhatsappLink = (tel) => {
    const number = tel.replace(/\D/g, "");
    return `https://wa.me/${number}`;
  };

  // E-posta linki oluştur
  const getMailLink = (mail) => `mailto:${mail}`;

  // Siparişi kapat
  const handleSiparisKapat = async (index) => {
    const yeni = [...siparisler];
    const orderId = yeni[index].OrderID;
    yeni[index].OrderStatus = "Teslim Edildi"; // Önce frontend'de güncelle
    setSiparisler(yeni);
    setOpenMenu(null);
    // Backend'e PATCH isteği gönder
    try {
      await axiosInstance.patch(`/api/orders/${orderId}/status`, { status: "Teslim Edildi" });
    } catch (err) {
      // Hata olursa kullanıcıya bilgi ver
      alert('Sipariş durumu backendde güncellenemedi!');
    }
  };

  // Adres modalını aç
  const handleAdresDegistir = (index) => {
    const s = siparisler[index];
    // Adres bilgisini parçalara ayır (örnek: il, ilçe, apartman, postaKodu vs. yoksa boş bırak)
    // Burada örnek olarak sadece adres, apartman, postaKodu, il, ilce, telefon alanlarını kullanıyoruz.
    setAdresModal({
      acik: true,
      index,
      adres: {
        adres: s.adres || "",
        apartman: "",
        postaKodu: "",
        il: "",
        ilce: "",
        telefon: s.telefon.replace(/^\+90\s?/, "") || "",
      }
    });
    setOpenMenu(null);
  };

  // Adres modalı input değişikliği
  const handleAdresInput = (e) => {
    const { name, value } = e.target;
    setAdresModal((prev) => ({
      ...prev,
      adres: { ...prev.adres, [name]: value }
    }));
  };

  // İl değişince ilçe sıfırlansın
  const handleIlChange = (e) => {
    setAdresModal((prev) => ({
      ...prev,
      adres: { ...prev.adres, il: e.target.value, ilce: "" }
    }));
  };

  // Adres kaydet
  const handleAdresKaydet = (e) => {
    e.preventDefault();
    const yeni = [...siparisler];
    // Adres bilgisini birleştirip güncelle (örnek olarak sadece adres alanını güncelliyoruz)
    yeni[adresModal.index].adres = adresModal.adres.adres;
    yeni[adresModal.index].telefon = adresModal.adres.telefon;
    setSiparisler(yeni);
    setAdresModal({ acik: false, index: null, adres: emptyAddress });
  };

  // Sayfa yüklendiğinde siparişleri backend'den çek
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        // Admin için tüm siparişleri çekiyoruz
        const res = await axiosInstance.get('/api/orders/all');
        if (res.data.success) {
          setSiparisler(res.data.orders);
        } else {
          setError('Siparişler alınamadı.');
        }
      } catch (err) {
        setError('Siparişler alınırken hata oluştu.');
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div className="dashboard-siparisler-container">
      <div className="satistaki-baslik">SİPARİŞLER</div>
      <table className="dashboard-siparisler-table">
        <thead>
          <tr>
            <th>SİPARİŞ NO</th>
            <th>DURUM</th>
            <th>SİPARİŞ TARİHİ</th>
            <th>MÜŞTERİ</th>
            <th>ÜRÜN ADI</th>
            <th>TOPLAM TUTAR</th>
            <th>İŞLEMLER</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={7}>Yükleniyor...</td></tr>
          )}
          {error && (
            <tr><td colSpan={7} style={{color:'red'}}>{error}</td></tr>
          )}
          {!loading && !error && aktifSayfaSiparisleri.length === 0 && (
            <tr><td colSpan={7} style={{color:'#888'}}>Hiç sipariş yok.</td></tr>
          )}
          {!loading && !error && aktifSayfaSiparisleri.map((siparis, i) => {
            const globalIndex = (aktifSayfa - 1) * sayfaBasinaSiparis + i;
            return (
              <React.Fragment key={siparis.OrderID}>
                <tr
                  className={acikSiparis === globalIndex ? "dashboard-siparis-row acik" : "dashboard-siparis-row"}
                  onClick={(e) => {
                    if (
                      e.target.closest('.dashboard-islemler-btn') ||
                      e.target.closest('.dashboard-dropdown-content')
                    ) {
                      return;
                    }
                    setAcikSiparis(acikSiparis === globalIndex ? null : globalIndex);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <td data-label="SİPARİŞ NO">{siparis.OrderID}</td>
                  <td data-label="DURUM">{siparis.OrderStatus}</td>
                  <td data-label="SİPARİŞ TARİHİ">{new Date(siparis.OrderDate).toLocaleString('tr-TR')}</td>
                  <td data-label="MÜŞTERİ">{siparis.Eposta || '-'}</td>
                  <td data-label="ÜRÜN ADI">
                    <span className="satistaki-urun-adi">
                      {siparis.items && siparis.items.length > 0 ? siparis.items[0].ProductName : '-'}
                      {siparis.items && siparis.items.length > 1 ? ` +${siparis.items.length - 1}` : ''}
                    </span>
                  </td>
                  <td data-label="TOPLAM TUTAR">{siparis.TotalAmount ? Number(siparis.TotalAmount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '-'}</td>
                  <td data-label="İŞLEMLER" style={{ position: "relative" }}>
                    <div style={{ display: "inline-block" }}>
                      <button
                        className="dashboard-islemler-btn"
                        onClick={(e) => handleMenuToggle(globalIndex, e)}
                      >
                        İŞLEMLER ▼
                      </button>
                      {openMenu === globalIndex && (
                        <div className="dashboard-dropdown-content acik" ref={menuRef}>
                          <div
                            className="dashboard-dropdown-item"
                            onClick={() => handleSiparisKapat(globalIndex)}
                          >
                            Siparişi kapat
                          </div>
                          {siparis.Telefon && (
                            <a
                              className="dashboard-dropdown-item"
                              href={getWhatsappLink(siparis.Telefon)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Müşteriye WhatsApp'tan ulaş
                            </a>
                          )}
                          {siparis.Eposta && (
                            <a
                              className="dashboard-dropdown-item"
                              href={getMailLink(siparis.Eposta)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Müşteriye e-posta gönder
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
                {acikSiparis === globalIndex && (
                  <tr className="dashboard-siparis-detay-row">
                    <td colSpan={7}>
                      <div className="dashboard-siparis-detay">
                        <div><b>Adres:</b> {siparis.AdresID || '-'}</div>
                        <div><b>Telefon:</b> {siparis.Telefon || '-'}</div>
                        <div><b>E-posta:</b> {siparis.Eposta || '-'}</div>
                        <div><b>Müşteri Notu:</b> {siparis.CustomerNote || '-'}</div>
                        <div>
                          <Link to={`/dashboard/siparisler/${siparis.OrderID}`} style={{ color: "#0074d9" }}>
                            <span role="img" aria-label="info">📁</span> Tüm sipariş bilgilerini göster
                          </Link>
                        </div>
                        <div style={{marginTop: '12px'}}>
                          <b>Ürünler:</b>
                          <ul style={{margin:0, paddingLeft:20}}>
                            {siparis.items && siparis.items.map((item) => (
                              <li key={item.OrderItemID}>
                                {item.ProductName} x{item.Quantity} - {Number(item.UnitPrice).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                {item.ImageURL && (
                                  <img src={item.ImageURL} alt={item.ProductName} style={{width:32, height:32, objectFit:'cover', borderRadius:4, marginLeft:8}} />
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Sayfalama */}
      <div className="satistaki-pagination">
        <span>
          Toplam {siparisler.length} kayıttan <b>{(aktifSayfa - 1) * sayfaBasinaSiparis + 1} ile {Math.min(aktifSayfa * sayfaBasinaSiparis, siparisler.length)}</b> arası gösteriliyor
        </span>
        <div className="satistaki-pagination-pages">
          {/* Sayfa numaraları */}
          {Array.from({ length: toplamSayfa }, (_, idx) => (
            <span
              key={idx + 1}
              className={aktifSayfa === idx + 1 ? "active" : ""}
              onClick={() => setAktifSayfa(idx + 1)}
              style={{ cursor: "pointer" }}
            >
              {idx + 1}
            </span>
          ))}
        </div>
      </div>

      {/* Adres modalı */}
      {adresModal.acik && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setAdresModal({ acik: false, index: null, adres: emptyAddress })}>&times;</button>
            <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Teslimat Adresini Değiştir</h2>
            <form onSubmit={handleAdresKaydet} className="adres-form detayli-adres-form">
              <label>Adres *
                <textarea name="adres" value={adresModal.adres.adres} onChange={handleAdresInput} required placeholder="Adres" />
              </label>
              <div className="adres-form-row">
                <label>Apartman, Daire
                  <input name="apartman" value={adresModal.adres.apartman} onChange={handleAdresInput} placeholder="Apartman, Daire" />
                </label>
                <label>Posta Kodu
                  <input name="postaKodu" value={adresModal.adres.postaKodu} onChange={handleAdresInput} placeholder="Posta Kodu" />
                </label>
              </div>
              <div className="adres-form-row">
                <label>İl *
                  <select name="il" value={adresModal.adres.il} onChange={handleIlChange} required>
                    <option value="">İl Seçiniz</option>
                  </select>
                </label>
                <label>İlçe *
                  <select name="ilce" value={adresModal.adres.ilce} onChange={handleAdresInput} required disabled={!adresModal.adres.il}>
                    <option value="">İlçe Seçiniz</option>
                  </select>
                </label>
              </div>
              <label>Telefon *
                <input
                  name="telefon"
                  value={adresModal.adres.telefon}
                  onChange={handleAdresInput}
                  placeholder="5XX XXX XX XX"
                  required
                  maxLength="12"
                  pattern="[0-9\s]*"
                />
              </label>
              <div className="modal-buttons">
                <button type="submit" className="modal-submit-btn">Kaydet</button>
                <button type="button" className="modal-cancel-btn" onClick={() => setAdresModal({ acik: false, index: null, adres: emptyAddress })}>İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Siparisler;
