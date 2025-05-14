import React, { useState } from "react";
import "../css/Account.css";
import Siparislerim from "./Siparislerim";
import Adreslerim from "./Adreslerim";

const menuItems = [
  { key: "kisisel", label: "KİŞİSEL BİLGİLERİM" },
  { key: "favori", label: "FAVORİ ÜRÜNLER" },
  { key: "adreslerim", label: "ADRESLERİM" },
  { key: "siparislerim", label: "SİPARİŞLERİM" },
];

// Örnek il ve ilçe verisi
const iller = ["İstanbul", "Ankara", "İzmir"];
const ilceler = {
  İstanbul: ["Kadıköy", "Beşiktaş", "Üsküdar"],
  Ankara: ["Çankaya", "Keçiören", "Yenimahalle"],
  İzmir: ["Konak", "Bornova", "Karşıyaka"],
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

const Account = () => {
  const [selectedMenu, setSelectedMenu] = useState("siparislerim");
  // Kişisel bilgiler için state
  const [userInfo, setUserInfo] = useState({ 
    ad: "Ali", 
    soyad: "Veli", 
    email: "ali@eposta.com",
    telefon: "5XX XXX XX XX"
  });
  const [editUser, setEditUser] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  // Adres ekleme/düzenleme için state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [editIndex, setEditIndex] = useState(null); // Düzenlenen adresin indexi

  // Kişisel bilgiler güncelleme fonksiyonu
  const handleUserChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };
  const handleUserSave = (e) => {
    e.preventDefault();
    setEditUser(false);
    // Burada API'ye güncelleme isteği atabilirsin
  };

  // Şifre değiştirme fonksiyonları
  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Yeni şifreler eşleşmiyor!");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Şifre en az 6 karakter olmalıdır!");
      return;
    }

    // Burada API'ye şifre değiştirme isteği atılabilir
    alert("Şifreniz başarıyla değiştirildi!");
    setShowPasswordForm(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  // Adres ekleme/düzenleme fonksiyonları
  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };
  const handleIlChange = (e) => {
    setNewAddress({ ...newAddress, il: e.target.value, ilce: "" });
  };
  const handleAddressSave = (e) => {
    e.preventDefault();
    if (editIndex !== null) {
      // Düzenleme
      const updated = [...addresses];
      updated[editIndex] = newAddress;
      setAddresses(updated);
      setEditIndex(null);
    } else {
      // Yeni adres
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
    // Eğer düzenleme modunda silinen adresse, formu kapat
    if (editIndex === idx) {
      setShowAddressForm(false);
      setEditIndex(null);
      setNewAddress(emptyAddress);
    }
  };

  // Menüye göre içerik render et
  const renderContent = () => {
    switch (selectedMenu) {
      case "kisisel":
        return (
          <div>
            <h2>KİŞİSEL BİLGİLERİM</h2>
            {editUser ? (
              <form onSubmit={handleUserSave} className="kisisel-form">
                <label>Ad
                  <input name="ad" value={userInfo.ad} onChange={handleUserChange} required />
                </label>
                <label>Soyad
                  <input name="soyad" value={userInfo.soyad} onChange={handleUserChange} required />
                </label>
                <label>Email
                  <input name="email" value={userInfo.email} onChange={handleUserChange} required type="email" />
                </label>
                <label>Telefon
                  <input 
                    name="telefon" 
                    value={userInfo.telefon} 
                    onChange={handleUserChange} 
                    required 
                    placeholder="5XX XXX XX XX"
                    pattern="[0-9\s]*"
                    maxLength="12"
                  />
                </label>
                <div className="form-buttons">
                  <button type="submit">Kaydet</button>
                  <button type="button" onClick={() => setEditUser(false)}>İptal</button>
                </div>
              </form>
            ) : (
              <div className="kisisel-bilgiler">
                <div><b>Ad:</b> {userInfo.ad}</div>
                <div><b>Soyad:</b> {userInfo.soyad}</div>
                <div><b>Email:</b> {userInfo.email}</div>
                <div><b>Telefon:</b> {userInfo.telefon}</div>
                <div className="kisisel-buttons">
                  <button onClick={() => setEditUser(true)}>Bilgileri Düzenle</button>
                  <button onClick={() => setShowPasswordForm(true)}>Şifre Değiştir</button>
                </div>
              </div>
            )}

            {/* Şifre Değiştirme Modal */}
            {showPasswordForm && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <button className="modal-close" onClick={() => { setShowPasswordForm(false); setPasswordError(""); }}>&times;</button>
                  <h2 style={{textAlign: 'center', marginBottom: 24}}>Şifre Değiştir</h2>
                  <form onSubmit={handlePasswordSubmit} className="password-form">
                    <label>Mevcut Şifre *
                      <input 
                        type="password" 
                        name="currentPassword" 
                        value={passwordForm.currentPassword} 
                        onChange={handlePasswordChange} 
                        required 
                      />
                    </label>
                    <label>Yeni Şifre *
                      <input 
                        type="password" 
                        name="newPassword" 
                        value={passwordForm.newPassword} 
                        onChange={handlePasswordChange} 
                        required 
                        minLength="6"
                      />
                    </label>
                    <label>Yeni Şifre (Tekrar) *
                      <input 
                        type="password" 
                        name="confirmPassword" 
                        value={passwordForm.confirmPassword} 
                        onChange={handlePasswordChange} 
                        required 
                        minLength="6"
                      />
                    </label>
                    {passwordError && <div className="error-message">{passwordError}</div>}
                    <div className="modal-buttons">
                      <button type="submit" className="modal-submit-btn">Şifreyi Değiştir</button>
                      <button type="button" className="modal-cancel-btn" onClick={() => { setShowPasswordForm(false); setPasswordError(""); }}>İptal</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      case "favori":
        return <div>Favori Ürünler burada görünecek.</div>;
      case "adreslerim":
        return <Adreslerim />;
      case "siparislerim":
        return <Siparislerim />;
      default:
        return null;
    }
  };

  return (
    <div className="account-container">
      {/* Sol menü */}
      <div className="account-menu">
        <h3>HESABIM</h3>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.key}
              className={selectedMenu === item.key ? "active" : ""}
              onClick={() => setSelectedMenu(item.key)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
      {/* Sağ içerik */}
      <div className="account-content">{renderContent()}</div>
    </div>
  );
};

export default Account; 