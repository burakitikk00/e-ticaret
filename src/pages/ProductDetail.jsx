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
    const [selectedOption, setSelectedOption] = useState('');
    const [activeAccordion, setActiveAccordion] = useState(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const imageRef = useRef(null);
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [modalProduct, setModalProduct] = useState(null);

    const productImages = [
        'https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp',
        'https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp',
        'https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp',
        'https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp'
    ];

    const productOptions = [
        'Seçenek 1',
        'Seçenek 2',
        'Seçenek 3'
    ];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/products/${id}`);
                if (response.data.success) {
                    setProduct(response.data.product);
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
                selectedVaryasyon1: selectedOption,
                quantity: quantity
            };
            
            console.log('Ürün Detay: Sepete eklenecek ürün:', itemToAdd);
            addToCart(itemToAdd);
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
                        src={productImages[mainImage]}
                        alt="Ürün"
                        className={`main-image ${isZoomed ? 'zoomed' : ''}`}
                        style={{
                            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                            transform: isZoomed ? 'scale(2)' : 'scale(1)'
                        }}
                    />
                    <button className="nav-button prev" onClick={() => handleImageChange('prev')}>❮</button>
                    <button className="nav-button next" onClick={() => handleImageChange('next')}>❯</button>
                </div>
                <div className="thumbnail-container">
                    {productImages.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`Ürün ${index + 1}`}
                            className={`thumbnail ${mainImage === index ? 'active' : ''}`}
                            onClick={() => setMainImage(index)} />
                    ))}
                </div>
            </div>

            <div className="product-info">
                <h1 className="product-title">{product.baslik || product.ProductName}</h1>
                <p className="product-price">{product.fiyat || (product.BasePrice + ' ' + (product.Currency || '₺'))}</p>
                <p className="product-guide">Ürün Rehberi</p>

                <div className="product-options">
                    <select
                        value={selectedOption}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="option-select"
                    >
                        <option value="">Seçenek Seçin</option>
                        {productOptions.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <div className="quantity-selector">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>

                <button className="add-to-cart" onClick={handleAddToCart}>Sepete Ekle</button>

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
                                Ürün açıklaması burada yer alacak.
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
                                Teslimat ve iade bilgileri burada yer alacak.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;

