import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/dashboard/HesapGuvenligi.css'

const HesapGuvenligi = () => {
    const navigate = useNavigate();
    // Form state'lerini tanımlıyoruz
    const [formData, setFormData] = useState({
        mevcutSifre: '',
        yeniSifre: '',
        yeniSifreTekrar: ''
    });

    // Hata mesajları için state
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Input değişikliklerini handle eden fonksiyon
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        
        // Şifre tekrarı kontrolü
        if (name === 'yeniSifre' || name === 'yeniSifreTekrar') {
            if (name === 'yeniSifre' && formData.yeniSifreTekrar) {
                if (value !== formData.yeniSifreTekrar) {
                    setErrors(prev => ({ ...prev, yeniSifreTekrar: 'Şifreler uyuşmuyor' }));
                } else {
                    setErrors(prev => ({ ...prev, yeniSifreTekrar: '' }));
                }
            } else if (name === 'yeniSifreTekrar' && formData.yeniSifre) {
                if (value !== formData.yeniSifre) {
                    setErrors(prev => ({ ...prev, yeniSifreTekrar: 'Şifreler uyuşmuyor' }));
                } else {
                    setErrors(prev => ({ ...prev, yeniSifreTekrar: '' }));
                }
            }
        }
    };

    // Form gönderimini handle eden fonksiyon
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccessMessage('');
        
        // Validasyon kontrolleri
        const newErrors = {};
        if (!formData.mevcutSifre) newErrors.mevcutSifre = 'Mevcut şifre gereklidir';
        if (!formData.yeniSifre) newErrors.yeniSifre = 'Yeni şifre gereklidir';
        if (!formData.yeniSifreTekrar) newErrors.yeniSifreTekrar = 'Şifre tekrarı gereklidir';
        if (formData.yeniSifre !== formData.yeniSifreTekrar) {
            newErrors.yeniSifreTekrar = 'Şifreler uyuşmuyor';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:5000/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    mevcutSifre: formData.mevcutSifre,
                    yeniSifre: formData.yeniSifre
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage('Şifreniz başarıyla değiştirildi');
                setFormData({
                    mevcutSifre: '',
                    yeniSifre: '',
                    yeniSifreTekrar: ''
                });
            } else {
                setErrors({ submit: data.message || 'Şifre değiştirme işlemi başarısız oldu' });
            }
        } catch (error) {
            console.error('Şifre değiştirme hatası:', error);
            setErrors({ submit: 'Sunucu bağlantı hatası!' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hesap-guvenligi-container">
            <h2>Hesap Güvenliği</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="mevcutSifre">Mevcut Şifre</label>
                    <input
                        type="password"
                        id="mevcutSifre"
                        name="mevcutSifre"
                        value={formData.mevcutSifre}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    {errors.mevcutSifre && <div className="error-message">{errors.mevcutSifre}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="yeniSifre">Yeni Şifre</label>
                    <input
                        type="password"
                        id="yeniSifre"
                        name="yeniSifre"
                        value={formData.yeniSifre}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    {errors.yeniSifre && <div className="error-message">{errors.yeniSifre}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="yeniSifreTekrar">Yeni Şifre (Tekrar)</label>
                    <input
                        type="password"
                        id="yeniSifreTekrar"
                        name="yeniSifreTekrar"
                        value={formData.yeniSifreTekrar}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    {errors.yeniSifreTekrar && <div className="error-message">{errors.yeniSifreTekrar}</div>}
                </div>

                {successMessage && <div className="success-message">{successMessage}</div>}
                {errors.submit && <div className="error-message">{errors.submit}</div>}

                <div className="button-group">
                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? 'İşlem Yapılıyor...' : 'Şifreyi Değiştir'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HesapGuvenligi;
