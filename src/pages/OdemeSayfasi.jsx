import React, { useState } from 'react';
import '../css/OdemeSayfasi.css';
import logo from '../Images/logo.jpg'; // Logo'yu ES6 import ile alıyoruz
import { useCart } from '../context/CartContext'; // Sepet verisi için import
import axiosInstance from '../utils/axiosConfig'; // API istekleri için axiosInstance ekle
import { useUser } from '../context/UserContext'; // Kullanıcı bilgisi için import
import { useNavigate } from 'react-router-dom'; // Sayfa yönlendirme için ekledik

// Sadece logo ve isim içeren sade header
function OdemeHeader() {
    return (
        <header className="odeme-header">
            <img src={logo} alt="Lina Butik Logo" className="odeme-logo" />
            <span className="odeme-title">Lina Butik</span>
        </header>
    );
}

function OdemeSayfasi() {
    // Sepet contextinden ürünler ve toplam fiyat fonksiyonu alınır
    const { cartItems, getTotalPrice, clearCart } = useCart();
    const { user } = useUser();
    const navigate = useNavigate(); // Yönlendirme hook'u
    const kargoFiyati = teslimat.KargoBedeli || 0; // Kargo bedelini localStorage'dan veya sabit olarak al
    // Teslimat bilgisi CheckoutModal'dan props ile alınabilir veya context ile alınabilir. Burada örnek için localStorage üzerinden alınacak.
    const [teslimat, setTeslimat] = useState(() => {
        // CheckoutModal'da siparişi tamamla aşamasında localStorage'a kaydedilmiş olabilir
        const data = localStorage.getItem('teslimatBilgisi');
        return data ? JSON.parse(data) : {};
    });

    // Form state'leri
    const [form, setForm] = useState({
        ad: '',
        soyad: '',
        kartNo: '',
        sonKullanma: '',
        cvc: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Kart numarasını 4+4+4+4 formatında gösteren fonksiyon
    const formatCardNumber = (value) => {
        // Sadece rakamları al, ilk 16 haneyi al
        const digits = value.replace(/\D/g, '').slice(0, 16);
        // 4'erli gruplara ayırıp aralarına boşluk koy
        return digits.replace(/(.{4})/g, '$1 ').trim();
    };

    // Son kullanma tarihini MM/YY formatında otomatik olarak yazan fonksiyon
    const formatExpiryDate = (value) => {
        // Sadece rakamları al, ilk 4 haneyi al
        const digits = value.replace(/\D/g, '').slice(0, 4);
        if (digits.length < 3) return digits;
        // 2. haneden sonra slash ekle
        return digits.slice(0, 2) + '/' + digits.slice(2);
    };

    // Form input değişikliği
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'kartNo') {
            // Kart numarasını otomatik olarak 4+4+4+4 formatla
            setForm(f => ({ ...f, kartNo: formatCardNumber(value) }));
        } else if (name === 'sonKullanma') {
            // Son kullanma tarihini otomatik olarak MM/YY formatla
            setForm(f => ({ ...f, sonKullanma: formatExpiryDate(value) }));
        } else if (name === 'cvc') {
            const val = value.replace(/\D/g, '').slice(0, 3);
            setForm(f => ({ ...f, cvc: val }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };

    // Son kullanma tarihi kontrolü (MM/YY veya MM/YYYY)
    const isValidDate = (dateStr) => {
        if (!/^\d{2}\/\d{2,4}$/.test(dateStr)) return false;
        const [mm, yy] = dateStr.split('/');
        const month = parseInt(mm, 10);
        let year = parseInt(yy, 10);
        if (yy.length === 2) year += 2000;
        if (month < 1 || month > 12) return false;
        const now = new Date();
        const exp = new Date(year, month - 1, 1);
        // Şu anki ayın son günü
        const nowEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return exp > nowEnd;
    };

    // Form gönderimi
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        // Kart numarasındaki boşlukları kaldırarak validasyon yap
        const rawCardNo = form.kartNo.replace(/\s/g, '');
        if (!form.ad || !form.soyad || !rawCardNo || !form.sonKullanma || !form.cvc) {
            setError('Tüm alanları doldurunuz.');
            return;
        }
        if (rawCardNo.length !== 16) {
            setError('Kart numarası 16 haneli olmalıdır.');
            return;
        }
        if (!isValidDate(form.sonKullanma)) {
            setError('Son kullanma tarihi geçerli ve ileri bir tarih olmalı (MM/YY).');
            return;
        }
        if (form.cvc.length !== 3) {
            setError('CVC 3 haneli olmalıdır.');
            return;
        }
        // Sipariş verisini hazırla
        const orderData = {
            UserID: user?.id || null,
            AdresID: teslimat.AdresID || null, // Kayıtlı adres varsa
            OrderDate: new Date().toISOString(),
            OrderStatus: 'Hazırlanıyor',
            TotalAmount: getTotalPrice() + kargoFiyati,
            KargoBedeli: kargoFiyati, // Kargo bedelini ekle
            PaymentStatus: 'Ödendi',
            CustomerNote: teslimat.not || '',
            Telefon: teslimat.telefon || '',
            Eposta: teslimat.email || ''
        };
        // Sipariş ürünleri
        const items = cartItems.map(item => ({
            ProductID: item.product?.id || item.product?.ProductID,
            Quantity: item.quantity,
            UnitPrice: (typeof item.product?.fiyat === 'string' ? parseFloat(item.product.fiyat.replace(/[^-\d,\.]/g, '').replace(',', '.')) : (item.product?.fiyat ?? item.product?.BasePrice ?? 0)),
            OpsiyonID: item.selectedOpsiyonID || null,
            VaryasyonID: item.selectedVaryasyonID || null
        }));
        try {
            // API'ye sipariş kaydı gönder
            const res = await axiosInstance.post('/api/orders', { order: orderData, items });
            if (res.data.success) {
                setSuccess('Siparişiniz başarıyla kaydedildi!');
                clearCart(); // Sepeti temizle
                localStorage.removeItem('teslimatBilgisi'); // Teslimat bilgisini temizle
                localStorage.setItem('accountMenu', 'siparislerim'); // Account sayfasında siparişlerim sekmesini açmak için anahtar kaydet
                // 1 saniye sonra account sayfasına yönlendir
                setTimeout(() => {
                    navigate('/account'); // Account sayfasına yönlendir
                }, 1000);
            } else {
                setError('Sipariş kaydedilemedi.');
            }
        } catch (err) {
            setError('Sipariş kaydedilirken hata oluştu.');
        }
    };

    return (
        <div className="odeme-sayfasi-container">
            <OdemeHeader />
            <div className="odeme-content-flex">
                {/* Sol: Ödeme Formu */}
                <div className="odeme-form-wrapper">
                    <h2>Ödeme Bilgileri</h2>
                    <form className="odeme-form" onSubmit={handleSubmit}>
                        <input name="ad" placeholder="Ad" value={form.ad} onChange={handleChange} required />
                        <input name="soyad" placeholder="Soyad" value={form.soyad} onChange={handleChange} required />
                        <input
                            name="kartNo"
                            placeholder="Kart Numarası (16 hane)"
                            value={form.kartNo}
                            onChange={handleChange}
                            maxLength={19} // 16 rakam + 3 boşluk
                            required
                        />
                        <input
                            name="sonKullanma"
                            placeholder="Son Kullanma Tarihi (MM/YY)"
                            value={form.sonKullanma}
                            onChange={handleChange}
                            maxLength={5} // 2 rakam + 1 slash + 2 rakam
                            required
                        />
                        <input name="cvc" placeholder="CVC (3 hane)" value={form.cvc} onChange={handleChange} maxLength={3} required />
                        <button type="submit">Ödemeyi Tamamla</button>
                    </form>
                    {error && <div className="odeme-error">{error}</div>}
                    {success && <div className="odeme-success">{success}</div>}
                </div>
                {/* Sağ: Sipariş Özeti */}
                <div className="odeme-ozet-wrapper">
                    <h3>Sipariş Özeti</h3>
                    <div className="odeme-urun-listesi">
                        {cartItems.length === 0 ? (
                            <div className="odeme-bos">Sepetiniz boş.</div>
                        ) : (
                            cartItems.map((item, idx) => (
                                <div key={idx} className="odeme-urun-ozet">
                                    <img src={item.product?.resim || item.product?.ImageURL} alt={item.product?.baslik || item.product?.ProductName} width={50} />
                                    <div>
                                        <div>{item.product?.baslik || item.product?.ProductName}</div>
                                        <div style={{fontSize:'12px', color:'#888'}}>Varyasyon: {item.selectedVaryasyon1} {item.selectedVaryasyon2 && `- ${item.selectedVaryasyon2}`}</div>
                                        <div style={{fontSize:'12px'}}>Adet: {item.quantity}</div>
                                        <div style={{fontSize:'12px'}}>Fiyat: ₺{
                                            (() => {
                                                let fiyat = item.product?.fiyat ?? item.product?.BasePrice ?? 0;
                                                if (typeof fiyat === 'string') fiyat = parseFloat(fiyat.replace(/[^\d,\.]/g, '').replace(',', '.'));
                                                if (isNaN(fiyat)) fiyat = 0;
                                                return (fiyat * (item.quantity || 1)).toLocaleString('tr-TR', {minimumFractionDigits:2});
                                            })()
                                        }</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="odeme-siparis-toplam">
                        <div className="odeme-ara-toplam">Ara toplam: ₺{getTotalPrice().toLocaleString('tr-TR', {minimumFractionDigits:2})}</div>
                        <div className="odeme-kargo">Kargo: ₺{kargoFiyati.toLocaleString('tr-TR', {minimumFractionDigits:2})}</div>
                        <div className="odeme-genel-toplam"><b>Genel toplam: ₺{(getTotalPrice() + kargoFiyati).toLocaleString('tr-TR', {minimumFractionDigits:2})}</b></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OdemeSayfasi; 