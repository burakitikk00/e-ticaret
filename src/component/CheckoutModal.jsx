import React, { useState, useEffect } from 'react';
import '../css/CheckoutModal.css'; // Modal için ayrı bir css dosyası oluşturulabilir
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import axiosInstance from '../utils/axiosConfig'; // axios yerine axiosInstance kullan
import { useNavigate } from 'react-router-dom'; // yönlendirme için import


// Bu modal artık dışarıdan açılacak. Üye olmadan/giriş yap modalı ile birlikte kullanılacak.

function CheckoutModal({ isOpen, onClose, onOrderComplete }) {
    // Kullanıcı ve sepet contextlerini alıyoruz
    const { user } = useUser();
    const { cartItems, getTotalPrice } = useCart();
    const navigate = useNavigate(); // yönlendirme hook'u

    // Adresler ve form state'leri
    const [addresses, setAddresses] = useState([]); // Kayıtlı adresler
    const [selectedAddressId, setSelectedAddressId] = useState(null); // Seçili adres
    const [newAddress, setNewAddress] = useState({
        baslik: '', ad: '', soyad: '', adres: '', apartman: '', postaKodu: '', ulke: 'Türkiye', il: '', ilce: '', telefon: ''
    });
    const [isAddingNew, setIsAddingNew] = useState(false); // Yeni adres ekleme modu
    const [iller, setIller] = useState([]); // İller
    const [ilceler, setIlceler] = useState([]); // İlçeler
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Kullanıcı bilgisi için state (Ad/Soyad/Telefon otomatik doldurma için)
    const [userInfo, setUserInfo] = useState({ ad: '', soyad: '', telefon: '' });

    // Kargo fiyatı sabit (örnek)
    const kargoFiyati = 80;

    // Modal açıkken adresleri ve illeri çek (Adreslerim.jsx mantığı)
    useEffect(() => {
        if (isOpen && user) {
            // Kullanıcının adreslerini çek
            axiosInstance.get('/api/adresler')
                .then(res => {
                    if (res.data.success) setAddresses(res.data.addresses);
                });
        }
        if (isOpen) {
            // İller bilgisini çek
            axiosInstance.get('/api/sehirler')
                .then(res => {
                    if (Array.isArray(res.data)) setIller(res.data);
                });
        }
    }, [isOpen, user]);

    // İl değiştiğinde ilçeleri çek (Adreslerim.jsx mantığı)
    useEffect(() => {
        if (newAddress.il) {
            axiosInstance.get(`/api/ilceler/${newAddress.il}`)
                .then(res => {
                    if (Array.isArray(res.data)) setIlceler(res.data);
                    else setIlceler([]);
                })
                .catch(() => setIlceler([]));
        } else {
            setIlceler([]);
        }
    }, [newAddress.il]);

    // Kullanıcı bilgilerini backend'den çek (Adreslerim.jsx mantığı)
    useEffect(() => {
        if (user) {
            axiosInstance.get('/api/auth/me')
                .then(res => {
                    if (res.data && res.data.success) {
                        setUserInfo({
                            ad: res.data.user.ad || '',
                            soyad: res.data.user.soyad || '',
                            telefon: res.data.user.telefon || ''
                        });
                    }
                })
                .catch(err => {
                    console.error('Kullanıcı bilgileri çekilemedi:', err);
                });
        }
    }, [user]);

    // userInfo güncellendiğinde ve yeni adres ekleme modunda, ad/soyad/telefonu otomatik doldur
    useEffect(() => {
        if (isAddingNew) {
            setNewAddress(prev => ({
                ...prev,
                ad: userInfo.ad || '',
                soyad: userInfo.soyad || '',
                telefon: userInfo.telefon || ''
            }));
        }
    }, [userInfo, isAddingNew]);

    // Telefon numarası formatlama fonksiyonu (Adreslerim.jsx ile aynı)
    const formatPhoneNumber = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length < 10) {
            return numbers.slice(0, 11);
        }
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

    // Yeni adres formu değişikliği (telefon için formatlama ekledim)
    const handleNewAddressChange = (e) => {
        const { name, value } = e.target;
        if (name === 'telefon') {
            setNewAddress(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
        } else if (name === 'il') {
            setNewAddress(prev => ({ ...prev, il: value, ilce: '' }));
        } else {
            setNewAddress(prev => ({ ...prev, [name]: value }));
        }
    };

    // Yeni adres kaydet (Adreslerim.jsx ile aynı mantıkta, userID ekliyorum ve axiosInstance kullanıyorum)
    const handleSaveNewAddress = async (e) => {
        e.preventDefault();
        setError('');
        const addressToSave = {
            ...newAddress,
            userID: user?.id
        };
        try {
            const res = await axiosInstance.post('/api/adresler', addressToSave);
            if (res.data.success) {
                // Adres başarıyla eklendikten sonra adres listesini backend'den tekrar çek
                const adreslerRes = await axiosInstance.get('/api/adresler');
                if (adreslerRes.data.success) {
                    setAddresses(adreslerRes.data.addresses);
                }
                setIsAddingNew(false);
                setNewAddress({ baslik: '', ad: '', soyad: '', adres: '', apartman: '', postaKodu: '', ulke: 'Türkiye', il: '', ilce: '', telefon: '' });
                setSuccess('Adres başarıyla eklendi.');
            } else {
                setError(res.data.error || 'Adres eklenemedi.');
            }
        } catch (err) {
            setError('Adres eklenirken hata oluştu.');
        }
    };

    // Siparişi tamamla butonu
    const handleCompleteOrder = () => {
        setError(''); // Önceki hatayı temizle
        // Kullanıcı giriş yaptıysa ve adres seçilmediyse uyarı ver
        if (user && addresses.length > 0 && !selectedAddressId) {
            setError('Lütfen bir adres seçiniz.');
            return;
        }
        // Kullanıcı giriş yapmadıysa formun eksiksiz doldurulup doldurulmadığını kontrol et
        if (!user) {
            // Gerekli alanlar: email, telefon, ad, soyad, il, ilce, adres, apartman, postaKodu (not opsiyonel)
            const form = newAddress;
            if (!form.email || !form.telefon || !form.ad || !form.soyad || !form.il || !form.ilce || !form.adres || !form.apartman || !form.postaKodu) {
                setError('Lütfen tüm teslimat bilgilerini eksiksiz doldurunuz.');
                return;
            }
            // Teslimat bilgisini localStorage'a kaydet
            localStorage.setItem('teslimatBilgisi', JSON.stringify({ ...form, KargoBedeli: kargoFiyati }));
        } else {
            // Kullanıcı giriş yaptıysa seçili adresi ve bilgileri kaydet
            const seciliAdres = addresses.find(a => a.id === selectedAddressId);
            if (seciliAdres) {
                localStorage.setItem('teslimatBilgisi', JSON.stringify({
                    ...seciliAdres,
                    AdresID: seciliAdres.id,
                    not: newAddress.not || '',
                    email: user.email || '',
                    telefon: seciliAdres.telefon || user.telefon || '',
                    KargoBedeli: kargoFiyati
                }));
            }
        }
        // Sipariş kaydı işlemleri burada olabilir
        // Yönlendirme: Ödeme sayfasına git
        navigate('/odeme'); // ödeme sayfasına yönlendir
        if (onOrderComplete) onOrderComplete(); // Sepet panelini kapat
        onClose();
    };

    // Modal kapalıysa render etme
    if (!isOpen) return null;

    return (
        <div className="checkout-modal-overlay">
            <div className="checkout-modal">
                <button className="close-btn" onClick={onClose}>×</button>
                <div className="checkout-content">
                    {/* Sol: Adres/Form */}
                    <div className="checkout-left">
                        <h2>Teslimat Bilgileri</h2>
                        {user ? (
                            <>
                                {/* Kayıtlı adresler */}
                                <div>
                                    <h4>Kayıtlı Adreslerim</h4>
                                    {addresses.length === 0 && <div>Adresiniz yok. Yeni adres ekleyin.</div>}
                                    <ul>
                                        {addresses.map((adres, idx) => (
                                            <li key={adres.id}>
                                                <label>
                                                    <input type="radio" name="selectedAddress" value={adres.id} checked={selectedAddressId === adres.id} onChange={() => setSelectedAddressId(adres.id)} />
                                                    {adres.baslik} - {adres.ad}, {adres.soyad}, {adres.adres}, {adres.il}/{adres.ilce}
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                    <button onClick={() => setIsAddingNew(!isAddingNew)}>{isAddingNew ? 'Vazgeç' : 'Yeni Adres Ekle'}</button>
                                </div>
                                {/* Yeni adres formu */}
                                {isAddingNew && (
                                    <form onSubmit={handleSaveNewAddress} className="adres-form">
                                        <input name="baslik" placeholder="Adres Başlığı" value={newAddress.baslik} onChange={handleNewAddressChange} required />
                                        <input name="ad" placeholder="Ad" value={newAddress.ad} onChange={handleNewAddressChange} required />
                                        <input name="soyad" placeholder="Soyad" value={newAddress.soyad} onChange={handleNewAddressChange} required />
                                        <input name="adres" placeholder="Adres" value={newAddress.adres} onChange={handleNewAddressChange} required />
                                        <input name="apartman" placeholder="Apartman No/İsmi" value={newAddress.apartman} onChange={handleNewAddressChange} required />
                                        <input name="postaKodu" placeholder="Posta Kodu" value={newAddress.postaKodu} onChange={handleNewAddressChange} required />
                                        <select
                                            name="il"
                                            value={newAddress.il}
                                            onChange={handleNewAddressChange}
                                            required
                                        >
                                            <option value="">İl Seçiniz</option>
                                            {iller.map(il => (
                                                <option key={il.id} value={il.SehirAd}>{il.SehirAd}</option>
                                            ))}
                                        </select>
                                        <select name="ilce" value={newAddress.ilce} onChange={handleNewAddressChange} required disabled={!newAddress.il}>
                                            <option value="">İlçe Seçiniz</option>
                                            {ilceler.map(ilce => (
                                                <option key={ilce.Id} value={ilce.Name}>{ilce.Name}</option>
                                            ))}
                                        </select>
                                        <input name="telefon" placeholder="Telefon" value={newAddress.telefon} onChange={handleNewAddressChange} required />
                                        <button type="submit">Kaydet</button>
                                    </form>
                                )}
                                {error && <div className="error-message">{error}</div>}
                                {success && <div className="success-message">{success}</div>}
                            </>
                        ) : (
                            // Kullanıcı giriş yapmamışsa boş form (Adreslerim.jsx mantığı ile il/ilçe)
                            <form className="adres-form">
                                <input name="email" placeholder="E-posta" value={newAddress.email || ''} onChange={handleNewAddressChange} required />
                                <input name="telefon" placeholder="Telefon" value={newAddress.telefon || ''} onChange={handleNewAddressChange} required />
                                <input name="ad" placeholder="Ad" value={newAddress.ad || ''} onChange={handleNewAddressChange} required />
                                <input name="soyad" placeholder="Soyad" value={newAddress.soyad || ''} onChange={handleNewAddressChange} required />
                                <select name="il" value={newAddress.il} onChange={handleNewAddressChange} required>
                                    <option value="">İl Seçiniz</option>
                                    {iller.map(il => <option key={il.id} value={il.SehirAd}>{il.SehirAd}</option>)}
                                </select>
                                <select name="ilce" value={newAddress.ilce} onChange={handleNewAddressChange} required disabled={!newAddress.il}>
                                    <option value="">İlçe Seçiniz</option>
                                    {ilceler.map(ilce => <option key={ilce.Id} value={ilce.Name}>{ilce.Name}</option>)}
                                </select>
                                <input name="adres" placeholder="Adres" value={newAddress.adres || ''} onChange={handleNewAddressChange} required />
                                <input name="apartman" placeholder="Apartman No/İsmi" value={newAddress.apartman || ''} onChange={handleNewAddressChange} required />
                                <input name="postaKodu" placeholder="Posta Kodu" value={newAddress.postaKodu || ''} onChange={handleNewAddressChange} required />
                                <input name="not" placeholder="Satıcıya notunuz (tercihen)" value={newAddress.not || ''} onChange={handleNewAddressChange} />
                            </form>
                        )}
                    </div>
                    {/* Sağ: Sipariş Özeti */}
                    <div className="checkout-right">
                        <h3>Özet</h3>
                        <div className="urun-listesi">
                            {cartItems.map((item, idx) => (
                                <div key={idx} className="urun-ozet">
                                    <img src={item.product?.resim || item.product?.ImageURL} alt={item.product?.baslik || item.product?.ProductName} width={50} />
                                    <div>
                                        <div>{item.product?.baslik || item.product?.ProductName}</div>
                                        <div>Varyasyon: {item.selectedVaryasyon1} {item.selectedVaryasyon2 && `- ${item.selectedVaryasyon2}`}</div>
                                        <div>Adet: {item.quantity}</div>
                                        <div>Fiyat: ₺{
                                            (() => {
                                                // Fiyatı güvenli şekilde sayıya çevirerek çarp
                                                let fiyat = item.product?.fiyat ?? item.product?.BasePrice ?? 0;
                                                if (typeof fiyat === 'string') fiyat = parseFloat(fiyat.replace(/[^\d,\.]/g, '').replace(',', '.'));
                                                if (isNaN(fiyat)) fiyat = 0;
                                                return (fiyat * (item.quantity || 1)).toLocaleString('tr-TR', {minimumFractionDigits:2});
                                            })()
                                        }</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="siparis-toplam">
                            <div className="ara-toplam">Ara toplam: ₺{getTotalPrice().toLocaleString('tr-TR', {minimumFractionDigits:2})}</div>
                            <div className="kargo">Kargo: ₺{(kargoFiyati).toLocaleString('tr-TR', {minimumFractionDigits:2})}</div>
                            <div className="genel-toplam"><b>Genel toplam: ₺{(getTotalPrice() + kargoFiyati).toLocaleString('tr-TR', {minimumFractionDigits:2})}</b></div>
                        </div>
                        <button className="siparisi-tamamla-btn" onClick={handleCompleteOrder}>Siparişi Tamamla</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutModal; 