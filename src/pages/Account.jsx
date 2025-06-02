import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import "../css/Account.css";
import Siparislerim from "./Siparislerim";
import Adreslerim from "./Adreslerim";

const menuItems = [
  { key: "kisisel", label: "KİŞİSEL BİLGİLERİM" },
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
  const { user, updateUserInfo } = useUser();
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState("kisisel");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Kullanıcı bilgilerini form'a yükle
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phoneNumber || ''
    });
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const result = await updateUserInfo({
        FirstName: formData.firstName,
        LastName: formData.lastName,
        PhoneNumber: formData.phone,
        email: formData.email
      });
      
      if (result.success) {
        setSuccess('Bilgileriniz başarıyla güncellendi');
        setIsEditing(false);
      } else {
        setError(result.error || 'Bilgiler güncellenirken bir hata oluştu');
      }
    } catch (err) {
      setError('Bilgiler güncellenirken bir hata oluştu');
    }
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

  const handleEditClick = (e) => {
    e.preventDefault(); // Form submit'i engelle
    setIsEditing(true);
  };

  const handleCancelClick = (e) => {
    e.preventDefault(); // Form submit'i engelle
    setIsEditing(false);
    // Form verilerini sıfırla
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phoneNumber || ''
    });
  };

  // Menüye göre içerik render et
  const renderContent = () => {
    switch (selectedMenu) {
      case "kisisel":
        return (
          <div>
            <h2>Hesap Bilgileri</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="account-form">
              <div className="form-group">
                <label>Ad</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Adınız"
                  required
                />
              </div>

              <div className="form-group">
                <label>Soyad</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Soyadınız"
                  required
                />
              </div>

              <div className="form-group">
                <label>E-posta</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="E-posta adresiniz"
                  required
                />
              </div>

              <div className="form-group">
                <label>Telefon</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Telefon numaranız"
                  pattern="[0-9]{10}"
                  title="Lütfen 10 haneli telefon numaranızı giriniz"
                  required
                />
              </div>

              <div className="form-actions">
                {!isEditing ? (
                  <button 
                    type="button" 
                    className="edit-button"
                    onClick={handleEditClick}
                  >
                    Düzenle
                  </button>
                ) : (
                  <>
                    <button 
                      type="submit" 
                      className="save-button"
                    >
                      Kaydet
                    </button>
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={handleCancelClick}
                    >
                      İptal
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        );
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