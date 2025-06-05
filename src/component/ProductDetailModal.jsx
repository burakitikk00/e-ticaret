import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Bu component, ürün detay modalını göstermek için kullanılacak
function ProductDetailModal({ product, isVisible, onClose, onAddToCart, onViewProduct }) {
  // Varyasyon verileri için state
  const [varyasyonlar, setVaryasyonlar] = useState([]);
  // Seçilen varyasyonlar için state'ler
  const [selectedVaryasyon1, setSelectedVaryasyon1] = useState(''); // Seçilen 1. varyasyon değeri
  const [selectedVaryasyon2, setSelectedVaryasyon2] = useState(''); // Seçilen 2. varyasyon değeri

  // Ürün değiştiğinde varyasyonları çek
  useEffect(() => {
    if (product && (product.id || product.ProductID)) { // product ve id/ProductID kontrolü eklendi
      axios.get(`http://localhost:5000/api/urunvaryasyonbilgi/${product.id || product.ProductID}`)
        .then(res => {
          setVaryasyonlar(res.data);
          // Modal açıldığında seçimleri sıfırla (isVisible true olduğunda da sıfırlanabilir)
          setSelectedVaryasyon1('');
          setSelectedVaryasyon2('');
        })
        .catch(() => setVaryasyonlar([]));
    } else {
        setVaryasyonlar([]); // Ürün yoksa varyasyonları temizle
        setSelectedVaryasyon1('');
        setSelectedVaryasyon2('');
    }
  }, [product]); // product değiştiğinde useEffect tetiklenir

  // Eğer modal görünür değilse component render etme (performans için)
  if (!isVisible || !product) {
    return null;
  }

  // Sepete ekle butonuna basınca çalışacak fonksiyon
  const handleAddToCart = () => {
    console.log('ProductDetailModal: handleAddToCart çalıştı'); // Log eklendi
    // Seçilen varyasyonları ve ürün bilgisini onAddToCart prop'u ile parent'a gönder
    onAddToCart({
      product: product,
      selectedVaryasyon1: selectedVaryasyon1,
      selectedVaryasyon2: selectedVaryasyon2,
      // Ek olarak miktar gibi bilgileri de buradan gönderebilirsiniz
    });
    // Sepete ekledikten sonra modalı kapat
    onClose();
  };

  // Ürün incele butonuna basınca çalışacak fonksiyon
  const handleViewProduct = () => {
      // navigate('/product/' + product.id); // Navigation artık parent componentte yapılacak
      onViewProduct(product.id || product.ProductID); // Ürün id'sini parent'a gönder
      onClose(); // Modalı kapat
  };

  return (
    <div className="modal-overlay" onClick={onClose}> {/* Overlaye tıklayınca modalı kapat */}
      <div className="modal-content product-modal-content" onClick={e => e.stopPropagation()}> {/* Modal içeriğine tıklayınca kapanmayı engelle */}
        <button className="modal-close" onClick={onClose}>&times;</button> {/* Kapat butonuna tıklayınca modalı kapat */}
        <div className="product-modal-grid">
          {/* Sol: Ürün görseli */}
          <div className="product-modal-image">
            <img src={product.resim || product.ImageURL} alt={product.baslik || product.ProductName} />
          </div>
          {/* Sağ: Ürün detayları */}
          <div className="product-modal-details">
            <h2 className="product-modal-title">{product.baslik || product.ProductName}</h2>
            <div className="product-modal-price">{product.fiyat || (product.BasePrice + ' ' + (product.Currency || ''))}</div>

            {/* Varyasyon seçim alanı başlangıcı - Bağımsız Seçim */}
            {varyasyonlar.length > 0 && (
              <>
                {/* 1. Varyasyon Seçimi */}
                <div style={{marginBottom: '1rem'}}>
                  {/* Varyasyon adı için backend'den gelen anahtar: Varyasyon1 */}
                  <label className="variation-label">{varyasyonlar[0].Varyasyon1}</label>
                  {/* Select için class eklendi */}
                  <select
                    className="variation-select"
                    value={selectedVaryasyon1}
                    onChange={e => setSelectedVaryasyon1(e.target.value)} // Seçim state'i güncellenir
                  >
                    <option value="">Seçiniz</option>
                    {/* Options1 kolonundaki tüm benzersiz değerleri seçenek olarak göster */}
                    {[...new Set(varyasyonlar.map(v => v.Options1))].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Varyasyon Seçimi (Eğer varyasyon2 bilgisi varsa) */}
                {varyasyonlar[0].varyasyon2 && (
                  <div style={{marginBottom: '1rem'}}>
                    {/* Varyasyon adı için backend'den gelen anahtar: varyasyon2 */}
                    <label className="variation-label">{varyasyonlar[0].varyasyon2}</label>
                    <select
                      className="variation-select"
                      value={selectedVaryasyon2}
                      onChange={e => setSelectedVaryasyon2(e.target.value)} // Seçim state'i güncellenir
                    >
                      <option value="">Seçiniz</option>
                      {/* Options2 kolonundaki tüm benzersiz değerleri seçenek olarak göster */}
                      {[...new Set(varyasyonlar.map(v => v.Options2))].filter(opt => opt && opt !== '').map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
            {/* Varyasyon seçim alanı sonu */}

            {/* Sepete Ekle Butonu */}
            <button
                type="button"
                className="sepete-ekle-btn"
                style={{marginTop: '1.5rem', width: '100%'}}
                onClick={handleAddToCart} // Sepete ekleme fonksiyonunu bağla
            >
                SEPETE EKLE
            </button>

            {/* Ürün İncele Linki */}
            <div
                className="urun-incele"
                style={{marginTop: '1.5rem', justifyContent: 'flex-start', cursor: 'pointer'}} // Cursor style eklendi
                onClick={handleViewProduct} // Ürün inceleme fonksiyonunu bağla
            >
                <span>ÜRÜNÜ İNCELE</span>
                <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5.5H11M11 5.5L6 0.5M11 5.5L6 10.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailModal; 