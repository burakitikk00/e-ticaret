import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import '../css/style.css'
import { useNavigate } from 'react-router-dom';
import ProductDetailModal from './ProductDetailModal';
import { useCart } from '../context/CartContext';

function CokSatilan() {
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

    // Modal için state'ler
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [modalProduct, setModalProduct] = useState(null);

    // Çok satan ürünleri veritabanından çek
    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                // "kategori=çok satanlar" parametresiyle ürünleri çekiyoruz
                const response = await axios.get('http://localhost:5000/api/products?kategori=çok%20satılanlar');
                if (response.data.success) {
                    setProducts(response.data.products);
                }
            } catch (error) {
                console.error('Çok satanlar yüklenirken hata:', error);
            }
        };
        fetchTopProducts();
    }, []);

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
            <ProductDetailModal
                product={modalProduct}
                isVisible={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                onAddToCart={(itemToAdd) => {
                    console.log('Çok Satanlar: Sepete eklenecek ürün:', itemToAdd);
                    if (itemToAdd && itemToAdd.product) {
                        addToCart(itemToAdd);
                        setShowDetailModal(false);
                        alert('Ürün sepete eklendi!');
                    } else {
                        console.error('Çok Satanlar: Sepete eklenecek ürün bilgisi eksik veya hatalı.', itemToAdd);
                    }
                }}
                onViewProduct={(productId) => {
                    navigate(`/product/${productId}`);
                }}
            />

            <div className="ProductsRecommendation_products"><h2 className="baslik">ÇOK SATANLAR</h2></div>
            <Slider {...settings} className="products-recommendation-slider">
                {products.map((product, index) => (
                    <div key={index} className="product-recommendation-slide">
                        <div className="product-card">
                            <div className="product-card-wrapper">  
                                <div className="product-card-image">
                                    <img src={product.resim || product.ImageURL} alt={product.baslik || product.ProductName} />
                                    <div className="hover-detay">
                                        <button 
                                            type="button" 
                                            className="sepete-ekle-btn" 
                                            onClick={e => {e.stopPropagation(); setModalProduct(product); setShowDetailModal(true);}}
                                        >
                                            SEPETE EKLE
                                        </button>
                                        <div className="urun-incele">
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
                            <a className="urun-baslik" href="#">{product.baslik || product.ProductName}</a>
                            <span className="urun-fiyat">{product.fiyat || (product.BasePrice + ' ' + (product.Currency || '₺'))}</span>
                        </div>
                    </div>
                ))}
            </Slider>
            <a className="link" href="/urunler?kategori=çok%20satılanlar">Tümünü Gör</a>
        </div>
    );
}

export default CokSatilan;