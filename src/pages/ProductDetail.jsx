import React, { useState, useRef, useEffect } from 'react';
import '../css/ProductDetail.css';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import ProductDetailModal from '../component/ProductDetailModal';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [mainImage, setMainImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedVaryasyon1, setSelectedVaryasyon1] = useState('');
    const [selectedVaryasyon2, setSelectedVaryasyon2] = useState('');
    const [varyasyonlar, setVaryasyonlar] = useState([]);
    const [activeAccordion, setActiveAccordion] = useState(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const imageRef = useRef(null);
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [modalProduct, setModalProduct] = useState(null);

    // Ürün resimlerini state olarak tut
    const [productImages, setProductImages] = useState([]);

    // Ürün varyasyonlarını çek
    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:5000/api/urunvaryasyonbilgi/${id}`)
                .then(res => {
                    setVaryasyonlar(res.data);
                    // Varyasyonları yüklerken seçimleri sıfırla
                    setSelectedVaryasyon1('');
                    setSelectedVaryasyon2('');
                })
                .catch(error => {
                    console.error('Varyasyonlar yüklenirken hata:', error);
                    setVaryasyonlar([]);
                });
        }
    }, [id]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/products/${id}`);
                console.log('API yanıtı:', response.data);
                
                if (response.data.success) {
                    const productData = response.data.product;
                    
                    // Ürün resimlerini ayarla
                    const images = productData.ImageURL 
                        ? (Array.isArray(productData.ImageURL) 
                            ? productData.ImageURL 
                            : [productData.ImageURL])
                        : ['https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp'];
                    
                    setProductImages(images);
                    
                    // Opsiyonları parse et
                    const opsiyonlar = productData.Opsiyonlar ? productData.Opsiyonlar.split(', ') : [];
                    const opsiyonFiyatlari = productData.OpsiyonFiyatlari ? productData.OpsiyonFiyatlari.split(', ').map(Number) : [];
                    
                    // Ürün verisini düzenle
                    const formattedProduct = {
                        ...productData,
                        opsiyonlar: opsiyonlar,
                        opsiyonFiyatlari: opsiyonFiyatlari,
                        fiyat: `${productData.BasePrice} ${productData.Currency || '₺'}`
                    };
                    
                    setProduct(formattedProduct);
                } else {
                    setError('Ürün bilgileri yüklenirken bir hata oluştu');
                }
            } catch (error) {
                console.error('Ürün bilgileri yüklenirken hata:', error);
                setError('Ürün bilgileri yüklenirken bir hata oluştu: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleImageChange = (direction) => {
        if (direction === 'next') {
            setMainImage((prev) => (prev + 1) % productImages.length);
        } else {
            setMainImage((prev) => (prev - 1 + productImages.length) % productImages.length);
        }
    };

    const handleAccordion = (index) => {
        setActiveAccordion(activeAccordion === index ? null : index);
    };

    const handleMouseMove = (e) => {
        if (!imageRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setZoomPosition({ x, y });
    };

    const handleAddToCart = () => {
        if (product) {
            const itemToAdd = {
                product: product,
                selectedVaryasyon1: selectedVaryasyon1,
                selectedVaryasyon2: selectedVaryasyon2,
                quantity: quantity // Seçilen adet miktarını ekle
            };
            
            console.log('Ürün Detay: Sepete eklenecek ürün:', itemToAdd);
            addToCart(itemToAdd, quantity); // quantity bilgisini de gönderiyoruz
            alert('Ürün sepete eklendi!');
        } else {
            console.error('Ürün Detay: Sepete eklenecek ürün bilgisi eksik veya hatalı.');
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ fontSize: '18px', color: '#666' }}>Ürün bilgileri yükleniyor...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ fontSize: '18px', color: '#ff0000' }}>{error}</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ fontSize: '18px', color: '#666' }}>Ürün bulunamadı</div>
            </div>
        );
    }

    return (
        <div className="product-detail-container">
            <ProductDetailModal
                product={modalProduct}
                isVisible={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                onAddToCart={(itemToAdd) => {
                    console.log('Ürün Detay Modal: Sepete eklenecek ürün:', itemToAdd);
                    if (itemToAdd && itemToAdd.product) {
                        addToCart(itemToAdd);
                        setShowDetailModal(false);
                        alert('Ürün sepete eklendi!');
                    } else {
                        console.error('Ürün Detay Modal: Sepete eklenecek ürün bilgisi eksik veya hatalı.', itemToAdd);
                    }
                }}
                onViewProduct={(productId) => {
                    navigate(`/product/${productId}`);
                }}
            />
            
            <div className="product-images">
                <div
                    className="main-image-container"
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onMouseMove={handleMouseMove}
                >
                    <img
                        ref={imageRef}
                        src={productImages[mainImage].startsWith('http') ? productImages[mainImage] : `http://localhost:5000${productImages[mainImage]}`}
                        alt={product.ProductName || product.baslik}
                        className={`main-image ${isZoomed ? 'zoomed' : ''}`}
                        style={{
                            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                            transform: isZoomed ? 'scale(2)' : 'scale(1)'
                        }}
                    />
                    {productImages.length > 1 && (
                        <>
                            <button className="nav-button prev" onClick={() => handleImageChange('prev')}>❮</button>
                            <button className="nav-button next" onClick={() => handleImageChange('next')}>❯</button>
                        </>
                    )}
                </div>
                {productImages.length > 1 && (
                    <div className="thumbnail-container">
                        {productImages.map((image, index) => (
                            <img
                                key={index}
                                src={image.startsWith('http') ? image : `http://localhost:5000${image}`}
                                alt={`${product.ProductName || product.baslik} ${index + 1}`}
                                className={`thumbnail ${mainImage === index ? 'active' : ''}`}
                                onClick={() => setMainImage(index)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="product-info">
                <h1 className="product-title">{product.ProductName || product.baslik}</h1>
                <p className="product-price">{product.fiyat}</p>
                

                {/* Varyasyon seçim alanı */}
                {varyasyonlar.length > 0 && (
                    <>
                        {/* 1. Varyasyon Seçimi */}
                        <div style={{marginBottom: '1rem'}}>
                            <label className="variation-label">{varyasyonlar[0].Varyasyon1}</label>
                            <select
                                className="variation-select"
                                value={selectedVaryasyon1}
                                onChange={e => setSelectedVaryasyon1(e.target.value)}
                            >
                                <option value="">Seçiniz</option>
                                {[...new Set(varyasyonlar.map(v => v.Options1))].map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Varyasyon Seçimi (Eğer varyasyon2 bilgisi varsa) */}
                        {varyasyonlar[0].varyasyon2 && (
                            <div style={{marginBottom: '1rem'}}>
                                <label className="variation-label">{varyasyonlar[0].varyasyon2}</label>
                                <select
                                    className="variation-select"
                                    value={selectedVaryasyon2}
                                    onChange={e => setSelectedVaryasyon2(e.target.value)}
                                >
                                    <option value="">Seçiniz</option>
                                    {[...new Set(varyasyonlar.map(v => v.Options2))].filter(opt => opt && opt !== '').map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </>
                )}

                {/* Adet seçimi */}
                <div className="quantity-selector" style={{marginTop: '1rem'}}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>

                {/* Sepete Ekle butonu */}
                <button 
                    className="add-to-cart" 
                    onClick={handleAddToCart}
                    style={{marginTop: '1.5rem', width: '100%'}}
                >
                    SEPETE EKLE
                </button>

                <div className="accordion-container">
                    <div className="accordion-item">
                        <button
                            className="accordion-header"
                            onClick={() => handleAccordion(0)}
                        >
                            Ürün Açıklaması
                        </button>
                        {activeAccordion === 0 && (
                            <div className="accordion-content">
                                {product.Description || product.aciklama || 'Ürün açıklaması bulunmamaktadır.'}
                            </div>
                        )}
                    </div>

                    <div className="accordion-item">
                        <button
                            className="accordion-header"
                            onClick={() => handleAccordion(1)}
                        >
                            Teslimat ve İade
                        </button>
                        {activeAccordion === 1 && (
                            <div className="accordion-content">
                                <p><strong>Kargo Tipi:</strong> {product.ShippingType || 'Standart Kargo'}</p>
                                <p><strong>Kargo Ücreti:</strong> {product.ShippingCost ? `${product.ShippingCost} ₺` : 'Ücretsiz Kargo'}</p>
                                <p><strong>İade Koşulları:</strong> İademiz yoktur.   Whatsapp ile değişim talebi oluşturabilirsiniz.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;

