import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig"; // Axios instance'ı import et
import "../css/Adreslerim.css";
import { useUser } from "../context/UserContext"; // Kullanıcı context'i import edildi

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
  // Kullanıcı bilgisini context'ten alıyoruz
  const { user } = useUser();

  // İller ve ilçeler için state'ler
  const [iller, setIller] = useState([]); // Tüm iller
  const [ilceler, setIlceler] = useState([]); // Seçilen ile ait ilçeler
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Kullanıcı bilgisi için state
  const [userInfo, setUserInfo] = useState({ ad: "", soyad: "", telefon: "" });

  // Kullanıcı bilgilerini backend'den çek
  useEffect(() => {
    axiosInstance.get("/api/auth/me")
      .then(res => {
        if (res.data && res.data.success) {
          setUserInfo({
            ad: res.data.user.ad || "",
            soyad: res.data.user.soyad || "",
            telefon: res.data.user.telefon || ""
          });
        }
      })
      .catch(err => {
        console.error("Kullanıcı bilgileri çekilemedi:", err);
      });
  }, []);

  // userInfo güncellendiğinde ve adres formu açık değilken, newAddress'in ad, soyad ve telefonunu otomatik doldur
  useEffect(() => {
    if (!showAddressForm && editIndex === null) {
      setNewAddress(prev => ({
        ...prev,
        ad: userInfo.ad || "",
        soyad: userInfo.soyad || "",
        telefon: userInfo.telefon || ""
      }));
    }
  }, [userInfo, showAddressForm, editIndex]);

  // Form açıldığında, yeni adres ekleniyorsa ad/soyad/telefonu otomatik doldur
  useEffect(() => {
    if (showAddressForm && editIndex === null) {
      setNewAddress(prev => ({
        ...prev,
        ad: userInfo.ad || "",
        soyad: userInfo.soyad || "",
        telefon: userInfo.telefon || ""
      }));
    }
  }, [showAddressForm, editIndex, userInfo]);

  // Sayfa ilk açıldığında illeri veritabanından çek
  useEffect(() => {
    axiosInstance.get("/api/sehirler")
      .then(res => {
        if (Array.isArray(res.data)) {
          setIller(res.data);
          console.log("[İller] Veritabanından gelen iller:", res.data);
        } else {
          console.error("[İller] Beklenen array gelmedi, gelen veri:", res.data);
        }
      })
      .catch(err => console.error("[İller] Çekilemedi:", err));
  }, []);

  // İl değiştiğinde ilçeleri veritabanından çek
  useEffect(() => {
    if (newAddress.il) {
      console.log("[İl Seçimi] Seçilen il:", newAddress.il);
      axiosInstance.get(`/api/ilceler/${newAddress.il}`)
        .then(res => {
          if (Array.isArray(res.data)) {
            setIlceler(res.data);
            console.log(`[İlçeler] ${newAddress.il} için gelen ilçeler:`, res.data);
          } else {
            setIlceler([]);
            console.error(`[İlçeler] ${newAddress.il} için array gelmedi, gelen veri:`, res.data);
          }
        })
        .catch(err => {
          setIlceler([]);
          console.error(`[İlçeler] ${newAddress.il} ilçeleri çekilemedi:`, err);
        });
    } else {
      setIlceler([]);
      console.log("[İlçeler] İl seçilmedi, ilçe listesi sıfırlandı.");
    }
  }, [newAddress.il]);

  // Adresleri veritabanından çekmek için yeni useEffect
  useEffect(() => {
    // Adresleri backend'den çek
    const fetchAddresses = async () => {
      try {
        const res = await axiosInstance.get("/api/adresler");
        if (res.data.success) {
          setAddresses(res.data.addresses); // Adresleri state'e kaydet
        } else {
          setAddresses([]);
        }
      } catch (err) {
        setAddresses([]);
        console.error("Adresler çekilemedi:", err);
      }
    };
    fetchAddresses();
  }, [showAddressForm]); // Adres ekleme/düzenleme sonrası güncellenmesi için showAddressForm'u ekledim

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
    console.log("[İl Seçimi] Kullanıcı yeni il seçti:", e.target.value);
  };

  const handleAddressSave = async (e) => {
    e.preventDefault();
    // userID'yi ekle
    const addressToSave = {
      ...newAddress,
      userID: user?.id // userID context'ten alınır
    };
    try {
      if (editIndex !== null && addresses[editIndex]) {
        // Düzenleme modunda ise PUT isteği at
        const id = addresses[editIndex].id || addresses[editIndex].Id;
        const res = await axiosInstance.put(`/api/adresler/${id}`, addressToSave);
        if (res.data.success) {
          // Başarıyla güncellendi, adresleri tekrar çek
          setShowAddressForm(false);
          setEditIndex(null);
          setNewAddress(emptyAddress);
        } else {
          alert("Adres güncellenemedi!");
        }
      } else {
        // Yeni adres ekle
        const res = await axiosInstance.post("/api/adresler", addressToSave);
        if (res.data.success) {
          setShowAddressForm(false);
          setNewAddress(emptyAddress);
        } else {
          alert("Adres kaydedilemedi!");
        }
      }
    } catch (err) {
      alert("Adres kaydedilirken/güncellenirken hata oluştu!");
      console.error(err);
    }
  };

  const handleEditAddress = (idx) => {
    setNewAddress(addresses[idx]); // Formu seçilen adresle doldur
    setEditIndex(idx);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (idx) => {
    try {
      // Adresin id'sini hem id hem Id olarak kontrol et
      const adres = addresses[idx];
      const id = adres.id || adres.Id;
      if (!id) {
        alert("Adresin id bilgisi bulunamadı, silinemiyor!");
        return;
      }
      await axiosInstance.delete(`/api/adresler/${id}`);
      // Silindikten sonra adresleri tekrar çekmek için fetchAddresses fonksiyonunu çağır
      // showAddressForm'u tetiklemek yerine adresleri güncelle
      const res = await axiosInstance.get("/api/adresler");
      if (res.data.success) {
        setAddresses(res.data.addresses);
      }
      setShowAddressForm(false);
      setEditIndex(null);
      setNewAddress(emptyAddress);
    } catch (err) {
      // Hata mesajını daha açıklayıcı göster
      if (err.response && err.response.status === 404) {
        alert("Adres bulunamadı veya silinemedi (404)");
      } else {
        alert("Adres silinirken hata oluştu! Detay: " + (err.message || ""));
      }
      console.error(err);
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
                    {iller.map(il => (
                      <option key={il.id} value={il.SehirAd}>{il.SehirAd}</option>
                    ))}
                  </select>
                </label>
                <label>İlçe *
                  <select name="ilce" value={newAddress.ilce} onChange={handleAddressChange} required disabled={!newAddress.il}>
                    <option value="">İlçe Seçiniz</option>
                    {ilceler.map(ilce => (
                      <option key={ilce.Id} value={ilce.Name}>{ilce.Name}</option>
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