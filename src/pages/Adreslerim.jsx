import React, { useState } from "react";
import "../css/Adreslerim.css";

// Türkiye'deki iller ve ilçeler
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
  // Diğer illerin ilçeleri de eklenebilir
};

const emptyAddress = {
  baslik: "",
  ad: "",
  soyad: "",
  adres: "",
  apartman: "",
  postaKodu: "",
  ulke: "Türkiye",
  il: "",
  ilce: "",
  telefon: "",
};

const Adreslerim = () => {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [editIndex, setEditIndex] = useState(null);

  // Telefon numarası formatı için yardımcı fonksiyon
  const formatPhoneNumber = (value) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '');
    
    // Maksimum 11 rakam kontrolü (başında 0 olmadan)
    if (numbers.length < 10) {
      return numbers.slice(0, 11); // İlk 11 rakamı al
    }
    
    // Format: 5XX XXX XX XX
    let formatted = numbers;
    if (numbers.length > 8) {
      formatted = `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8, 11)}`;
    } else if (numbers.length > 6) {
      formatted = `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6)}`;
    } else if (numbers.length > 3) {
      formatted = `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    }
    
    return formatted;
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefon') {
      setNewAddress({ ...newAddress, [name]: formatPhoneNumber(value) });
    } else {
      setNewAddress({ ...newAddress, [name]: value });
    }
  };

  const handleIlChange = (e) => {
    setNewAddress({ ...newAddress, il: e.target.value, ilce: "" });
  };

  const handleAddressSave = (e) => {
    e.preventDefault();
    if (editIndex !== null) {
      const updated = [...addresses];
      updated[editIndex] = newAddress;
      setAddresses(updated);
      setEditIndex(null);
    } else {
      setAddresses([...addresses, newAddress]);
    }
    setNewAddress(emptyAddress);
    setShowAddressForm(false);
  };

  const handleEditAddress = (idx) => {
    setNewAddress(addresses[idx]);
    setEditIndex(idx);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (idx) => {
    setAddresses(addresses.filter((_, i) => i !== idx));
    if (editIndex === idx) {
      setShowAddressForm(false);
      setEditIndex(null);
      setNewAddress(emptyAddress);
    }
  };

  return (
    <div className="adreslerim-container">
      <h2>ADRESLERİM</h2>
      {addresses.length === 0 && <p>Henüz kayıtlı adresiniz bulunmamaktadır</p>}
      <ul className="adres-listesi">
        {addresses.map((adr, i) => (
          <li key={i} className="adres-kart">
            <div className="adres-kart-baslik">
              <span className="adres-baslik" style={{fontWeight: 'bold', fontSize: '2.1rem'}}>{adr.baslik}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div className="adres-kart-detay">
                <div> {adr.ad} {adr.soyad}</div>
                <div> {adr.adres} {adr.apartman} {adr.postaKodu}</div>
                <div> {adr.il} / {adr.ilce}</div>
                <div>0 {adr.telefon}</div> 
              </div>
              <div className="adres-kart-btnlar" style={{marginTop: '8px'}}>
                <button className="adres-duzenle-btn" onClick={() => handleEditAddress(i)}>Düzenle</button>
                <button className="adres-sil-btn" onClick={() => handleDeleteAddress(i)} title="Sil">✕</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button className="adres-ekle-btn" onClick={() => { setShowAddressForm(true); setEditIndex(null); setNewAddress(emptyAddress); }}>YENİ ADRES EKLE</button>

      {/* Adres Form Modal */}
      {showAddressForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => { setShowAddressForm(false); setEditIndex(null); setNewAddress(emptyAddress); }}>&times;</button>
            <h2 style={{textAlign: 'center', marginBottom: 24}}>{editIndex !== null ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}</h2>
            <form onSubmit={handleAddressSave} className="adres-form detayli-adres-form">
              <label>Adres Başlığı *
                <input name="baslik" value={newAddress.baslik} onChange={handleAddressChange} required placeholder="Ev, Ofis, Yazlık..." />
              </label>
              <div className="adres-form-row">
                <label>Ad *
                  <input name="ad" value={newAddress.ad} onChange={handleAddressChange} required placeholder="Ad" />
                </label>
                <label>Soyad *
                  <input name="soyad" value={newAddress.soyad} onChange={handleAddressChange} required placeholder="Soyad" />
                </label>
              </div>
              <label>Adres *
                <textarea name="adres" value={newAddress.adres} onChange={handleAddressChange} required placeholder="Adres" />
              </label>
              <div className="adres-form-row">
                <label>Apartman, Daire
                  <input name="apartman" value={newAddress.apartman} onChange={handleAddressChange} placeholder="Apartman, Daire" />
                </label>
                <label>Posta Kodu
                  <input name="postaKodu" value={newAddress.postaKodu} onChange={handleAddressChange} placeholder="Posta Kodu" />
                </label>
              </div>
              <div className="adres-form-row">
                <label>Ülke *
                  <input name="ulke" value={newAddress.ulke} disabled />
                </label>
              </div>
              <div className="adres-form-row">
                <label>İl *
                  <select name="il" value={newAddress.il} onChange={handleIlChange} required>
                    <option value="">İl Seçiniz</option>
                    {iller.map((il) => (
                      <option key={il} value={il}>{il}</option>
                    ))}
                  </select>
                </label>
                <label>İlçe *
                  <select name="ilce" value={newAddress.ilce} onChange={handleAddressChange} required disabled={!newAddress.il}>
                    <option value="">İlçe Seçiniz</option>
                    {newAddress.il && ilceler[newAddress.il]?.map((ilce) => (
                      <option key={ilce} value={ilce}>{ilce}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>Telefon *
                <input 
                  name="telefon" 
                  value={newAddress.telefon} 
                  onChange={handleAddressChange} 
                  placeholder="5XX XXX XX XX" 
                  required 
                  maxLength="12"
                  pattern="[0-9\s]*"
                />
              </label>
              <div className="modal-buttons">
                <button type="submit" className="modal-submit-btn">Kaydet</button>
                <button type="button" className="modal-cancel-btn" onClick={() => { setShowAddressForm(false); setEditIndex(null); setNewAddress(emptyAddress); }}>İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adreslerim; 