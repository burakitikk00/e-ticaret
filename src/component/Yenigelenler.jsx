import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import '../css/style.css'

function Yenigelenler() {
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
            <div className="ProductsRecommendation_products"><h2 className="baslik">YENİ GELENLER</h2></div>
            <Slider {...settings} className="products-recommendation-slider">
                {products.map((product, index) => (
                    <div key={index} className="product-recommendation-slide">
                        <div className="product-card">
                            <div className="product-card-wrapper">  
                                <div className="product-card-image">
                                    <img src={product.resim || product.ImageURL} alt={product.baslik || product.ProductName} />
                                    <div className="hover-detay">
                                        <button type="submit" className="sepete-ekle-btn">SEPETE EKLE</button>
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
            <a className="link" href="/urunler?kategori=yeni%20gelenler">Tümünü Gör</a>
        </div>
    );
}

export default Yenigelenler;