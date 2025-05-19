import React, { useState, useRef, useEffect } from "react";
import "./../../css/dashboard/siparisler.css";
import "../../css/Adreslerim.css"; // Modal için gerekli

// Örnek sipariş verisi
const initialSiparisler = [
  {
    no: "272934877",
    durum: "AÇIK",
    tarih: "17/05/2025 11:31",
    musteri: "Serra Bahçıvan",
    urun: "Coach Trail Çapraz Çanta",
    tutar: "1.079,00 TL",
    adres: "Kiptaş Topkapı merkez evleri 2. Etap A-9 blok daire:58 Zeytinburnu İstanbul Türkiye",
    telefon: "+90 531 237 08 37",
    email: "serra.bahcivan@gmail.com",
    musteriNotu: "-",
  },
  {
    no: "710253125",
    durum: "KAPALI",
    tarih: "19/05/2025 11:36",
    musteri: "Merve Demir",
    urun: "Mini vakko Speddy",
    tutar: "779,99 TL",
    adres: "Adres örneği",
    telefon: "+90 555 111 22 33",
    email: "merve.demir@gmail.com",
    musteriNotu: "-",
  },
  // ... diğer siparişler
];

// Adres modalı için boş adres şablonu
const emptyAddress = {
  adres: "",
  apartman: "",
  postaKodu: "",
  il: "",
  ilce: "",
  telefon: "",
};

const iller = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

const ilceler = {
  "İstanbul": ["Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü", "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt", "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer", "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu"],
  "Ankara": ["Altındağ", "Çankaya", "Etimesgut", "Keçiören", "Mamak", "Sincan", "Yenimahalle", "Gölbaşı", "Polatlı", "Beypazarı", "Kahramankazan", "Söğütözü"],
  "İzmir": ["Konak", "Karşıyaka", "Bornova", "Buca", "Çiğli", "Gaziemir", "Karabağlar", "Menemen", "Torbalı", "Urla"],
  // Diğer iller eklenebilir
};

const Siparisler = () => {
  const [siparisler, setSiparisler] = useState(initialSiparisler);
  const [acikSiparis, setAcikSiparis] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

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
  const handleSiparisKapat = (index) => {
    const yeni = [...siparisler];
    yeni[index].durum = "KAPALI";
    setSiparisler(yeni);
    setOpenMenu(null);
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

  return (
    <div className="satistaki-urunler-container">
      <div className="satistaki-baslik">SİPARİŞLER</div>
      <table className="satistaki-table">
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
          {aktifSayfaSiparisleri.map((siparis, i) => {
            // i: aktif sayfadaki index, global indexi bulmak için:
            const globalIndex = (aktifSayfa - 1) * sayfaBasinaSiparis + i;
            return (
              <React.Fragment key={siparis.no}>
                <tr
                  className={acikSiparis === globalIndex ? "siparis-row acik" : "siparis-row"}
                  onClick={(e) => {
                    if (
                      e.target.closest('.satistaki-islem-btn') ||
                      e.target.closest('.satistaki-islem-menu')
                    ) {
                      return;
                    }
                    setAcikSiparis(acikSiparis === globalIndex ? null : globalIndex);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <td data-label="SİPARİŞ NO">{siparis.no}</td>
                  <td data-label="DURUM">{siparis.durum}</td>
                  <td data-label="SİPARİŞ TARİHİ">{siparis.tarih}</td>
                  <td data-label="MÜŞTERİ">{siparis.musteri}</td>
                  <td data-label="ÜRÜN ADI">
                    <span className="satistaki-urun-adi">{siparis.urun}</span>
                  </td>
                  <td data-label="TOPLAM TUTAR">{siparis.tutar}</td>
                  <td data-label="İŞLEMLER" style={{ position: "relative" }}>
                    <div style={{ display: "inline-block" }}>
                      <button
                        className="satistaki-islem-btn"
                        onClick={(e) => handleMenuToggle(globalIndex, e)}
                      >
                        İŞLEMLER ▼
                      </button>
                      {openMenu === globalIndex && (
                        <div className="dropdown-content satistaki-islem-menu acik" ref={menuRef}>
                          {siparis.durum === "AÇIK" && (
                            <div
                              className="dropdown-item satistaki-islem-item"
                              onClick={() => handleSiparisKapat(globalIndex)}
                            >
                              Siparişi kapat
                            </div>
                          )}
                          <div
                            className="dropdown-item satistaki-islem-item"
                            onClick={() => handleAdresDegistir(globalIndex)}
                          >
                            Teslimat adresini değiştir
                          </div>
                          <a
                            className="dropdown-item satistaki-islem-item"
                            href={getWhatsappLink(siparis.telefon)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Müşteriye WhatsApp'tan ulaş
                          </a>
                          <a
                            className="dropdown-item satistaki-islem-item"
                            href={getMailLink(siparis.email)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Müşteriye e-posta gönder
                          </a>
                          <div className="dropdown-item satistaki-islem-item">Sipariş notu düzenle / görüntüle</div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
                {/* Sipariş detayları açılır satır */}
                {acikSiparis === globalIndex && (
                  <tr className="siparis-detay-row">
                    <td colSpan={7}>
                      <div className="siparis-detay">
                        <div><b>Adres:</b> {siparis.adres}</div>
                        <div><b>Telefon:</b> {siparis.telefon}</div>
                        <div><b>E-posta:</b> {siparis.email}</div>
                        <div><b>Müşteri Notu:</b> {siparis.musteriNotu}</div>
                        <div>
                          <a href="#" style={{ color: "#0074d9" }}>
                            <span role="img" aria-label="info">📁</span> Tüm sipariş bilgilerini göster
                          </a>
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
                    {iller.map((il) => (
                      <option key={il} value={il}>{il}</option>
                    ))}
                  </select>
                </label>
                <label>İlçe *
                  <select name="ilce" value={adresModal.adres.ilce} onChange={handleAdresInput} required disabled={!adresModal.adres.il}>
                    <option value="">İlçe Seçiniz</option>
                    {adresModal.adres.il && ilceler[adresModal.adres.il]?.map((ilce) => (
                      <option key={ilce} value={ilce}>{ilce}</option>
                    ))}
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
