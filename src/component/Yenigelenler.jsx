import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import '../css/style.css'
import { useNavigate } from 'react-router-dom';
import ProductDetailModal from './ProductDetailModal';
import { useCart } from '../context/CartContext';

function Yenigelenler() {
    const { addToCart } = useCart();
    // Ok bileşenleri
    const NextArrow = ({ onClick }) => (
        <button className="slick-arrow slick-next" onClick={onClick} aria-label="Next" type="button">
            <div className="arrow-next">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </button>
    );

    const PrevArrow = ({ onClick }) => (
        <button className="slick-arrow slick-prev" onClick={onClick} aria-label="Previous" type="button">
            <div className="arrow-prev">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </button>
    );

    // Ürünler state'i
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();
    // Modal için state
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [modalProduct, setModalProduct] = useState(null);
    // varyasyonlar state'i ProductDetailModal içine taşındı
    // selectedVaryasyon1 ve selectedVaryasyon2 state'leri ProductDetailModal içine taşındı

    // Yeni gelenler ürünlerini veritabanından çek
    useEffect(() => {
        const fetchNewProducts = async () => {
            try {
                // "kategori=yeni gelenler" parametresiyle ürünleri çekiyoruz
                const response = await axios.get('http://localhost:5000/api/products?kategori=yeni%20gelenler');
                if (response.data.success) {
                    setProducts(response.data.products);
                }
            } catch (error) {
                console.error('Yeni gelenler yüklenirken hata:', error);
            }
        };
        fetchNewProducts();
    }, []);

    useEffect(() => {
        if (modalProduct) {
            // Varyasyon çekme logic'i ProductDetailModal içine taşındı
            // Modal açıldığında seçimleri sıfırlama logic'i ProductDetailModal içine taşındı
        }
    }, [modalProduct]);

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2
                }
            }
        ]
    };

    return (
        <div className="products-recommendation-wrapper">
            {/* Ürün detay modalı */}
            <ProductDetailModal
                product={modalProduct} // Gösterilecek ürün bilgisi
                isVisible={showDetailModal} // Modalın görünürlüğü
                onClose={() => setShowDetailModal(false)} // Modalı kapatma fonksiyonu
                onAddToCart={(itemToAdd) => {
                    // ProductDetailModal'dan gelen objenin içindeki product'ı addToCart'a gönderiyoruz
                    console.log('Yenigelenler: Sepete eklenecek ürün:', itemToAdd); // Log eklendi
                    if (itemToAdd && itemToAdd.product) {
                         addToCart(itemToAdd); // Tam itemToAdd objesini gönderiyoruz
                         setShowDetailModal(false);
                         // İsteğe bağlı: Kullanıcıya bildirim göster
                         alert('Ürün sepete eklendi!');
                     } else {
                         console.error('Yenigelenler: Sepete eklenecek ürün bilgisi eksik veya hatalı.', itemToAdd);
                     }
                }} // Sepete ekleme fonksiyonu
                onViewProduct={(productId) => {
                    navigate(`/product/${productId}`); // Ürün detay sayfasına yönlendirme
                }} // Ürün detay sayfasına gitme fonksiyonu
            />

            <div className="ProductsRecommendation_products"><h2 className="baslik">YENİ GELENLER</h2></div>
            <Slider {...settings} className="products-recommendation-slider">
                {products.map((product, index) => (
                    <div key={index} className="product-recommendation-slide">
                        <div className="product-card">
                            <div className="product-card-wrapper">  
                                <div className="product-card-image" style={{cursor:'pointer'}} onClick={() => navigate(`/product/${product.id || product.ProductID}`)}>
                                    <img src={product.resim || product.ImageURL} alt={product.baslik || product.ProductName} />
                                    <div className="hover-detay">
                                        {/* Sepete ekle butonu modalı açacak */}
                                        <button type="button" className="sepete-ekle-btn" onClick={e => {e.stopPropagation(); setModalProduct(product); setShowDetailModal(true);}}>SEPETE EKLE</button>
                                        {/* Ürün incele linki ürün detay sayfasına gidecek */}
                                        <div className="urun-incele" style={{cursor:'pointer'}} onClick={e => {e.stopPropagation(); navigate(`/product/${product.id || product.ProductID}`);}}>
                                            <span>ÜRÜNÜ İNCELE</span>
                                            <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 5.5H11M11 5.5L6 0.5M11 5.5L6 10.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="urun-bilgi">
                            <a className="urun-baslik" href="#" onClick={e => {e.preventDefault(); navigate(`/product/${product.id || product.ProductID}`);}}>{product.baslik || product.ProductName}</a>
                            <span className="urun-fiyat">{product.fiyat || (product.BasePrice + ' ' + (product.Currency || ''))}</span>
                        </div>
                    </div>
                ))}
            </Slider>
            <a className="link" href="/urunler?kategori=yeni%20gelenler">Tümünü Gör</a>
        </div>
    );
}


export default Yenigelenler;