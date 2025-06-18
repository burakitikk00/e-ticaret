import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import '../css/style.css'
import { useNavigate } from 'react-router-dom';
import ProductDetailModal from './ProductDetailModal';
import { useCart } from '../context/CartContext';

function Cantalar() {
    const { addToCart } = useCart();
    
    // Özel ok bileşenlerini ayrı fonksiyonlar olarak tanımlıyoruz
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

    // Ürünler state'i - başlangıçta boş array
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    // Modal için state'ler
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [modalProduct, setModalProduct] = useState(null);

    // Ürünleri API'den çek
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // "kategori=çantalar" parametresiyle ürünleri çekiyoruz
                const response = await axios.get('http://localhost:5000/api/products?kategori=çantalar');
                if (response.data.success) {
                    // İlk 8 ürünü al
                    const limitedProducts = response.data.products.slice(0, 8);
                    setProducts(limitedProducts);
                }
            } catch (error) {
                console.error('Çantalar yüklenirken hata:', error);
                // Hata durumunda örnek ürünler göster
                setProducts([
                    {
                        id: 1,
                        resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
                        baslik: "Örnek Çanta 1",
                        fiyat: "₺999.90"
                    },
                    {
                        id: 2,
                        resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
                        baslik: "Örnek Çanta 2",
                        fiyat: "₺899.90"
                    },
                    {
                        id: 3,
                        resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
                        baslik: "Örnek Çanta 3",
                        fiyat: "₺799.90"
                    },
                    {
                        id: 4,
                        resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
                        baslik: "Örnek Çanta 4",
                        fiyat: "₺699.90"
                    },
                    {
                        id: 5,
                        resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
                        baslik: "Örnek Çanta 5",
                        fiyat: "₺599.90"
                    },
                    {
                        id: 6,
                        resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
                        baslik: "Örnek Çanta 6",
                        fiyat: "₺499.90"
                    },
                    {
                        id: 7,
                        resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
                        baslik: "Örnek Çanta 7",
                        fiyat: "₺399.90"
                    },
                    {
                        id: 8,
                        resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
                        baslik: "Örnek Çanta 8",
                        fiyat: "₺299.90"
                    }
                ]);
            }
        };
        fetchProducts();
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
                    // ProductDetailModal'dan gelen objenin içindeki product'ı addToCart'a gönderiyoruz
                    console.log('Çantalar: Sepete eklenecek ürün:', itemToAdd); // Log eklendi
                    if (itemToAdd && itemToAdd.product) {
                        addToCart(itemToAdd); // Tam itemToAdd objesini gönderiyoruz
                        setShowDetailModal(false);
                        // İsteğe bağlı: Kullanıcıya bildirim göster
                        alert('Ürün sepete eklendi!');
                    } else {
                        console.error('Çantalar: Sepete eklenecek ürün bilgisi eksik veya hatalı.', itemToAdd);
                    }
                }}
                onViewProduct={(productId) => {
                    navigate(`/product/${productId}`);
                }}
            />
            <div className="ProductsRecommendation_products"><h2 className="baslik">ÇANTALAR</h2></div>
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
            <a className="link" href="/urunler?kategori=çantalar">Tümünü Gör</a>
        </div>
    );
}

export default Cantalar;