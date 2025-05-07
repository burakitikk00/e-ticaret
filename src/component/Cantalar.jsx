import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import '../css/style.css'
function Cantalar() {
    const [products, setProducts] = useState([
        {
            id: 1,
            resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            baslik: "Örnek Ürün Adı 1",
            fiyat: "₺999.90"
        },
        {
            id: 2,
            resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            baslik: "Örnek Ürün Adı 2",
            fiyat: "₺899.90"
        },
        {
            id: 3,
            resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            baslik: "Örnek Ürün Adı 3",
            fiyat: "₺799.90"
        },
        {
            id: 4,
            resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            baslik: "Örnek Ürün Adı 4",
            fiyat: "₺699.90"
        },
        {
            id: 5,
            resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            baslik: "Örnek Ürün Adı 5",
            fiyat: "₺599.90"
        },
        {
            id: 6,
            resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            baslik: "Örnek Ürün Adı 6",
            fiyat: "₺499.90"
        },
        {
            id: 7,
            resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            baslik: "Örnek Ürün Adı 7",
            fiyat: "₺499.90"
        },
        {
            id: 8,
            resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            baslik: "Örnek Ürün Adı 8",
            fiyat: "₺499.90"
        }
    ]);

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        prevArrow: (
            <button className="slick-arrow slick-prev" aria-label="Previous">
                <div className="arrow-prev">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </button>
        ),
        nextArrow: (
            <button className="slick-arrow slick-next" aria-label="Next">
                <div className="arrow-next">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </button>
        ),
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
            <div class="ProductsRecommendation_products"><h2 class="baslik">ÇANTALAR</h2></div>
            <Slider {...settings} className="products-recommendation-slider">
                {products.map((product, index) => (
                    <div key={index} className="product-recommendation-slide">
                        <div className="product-card">
                            <div className="product-card-wrapper">
                                <div className="product-card-image">
                                    <img src={product.resim} alt={product.baslik} />
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
                            <a className="urun-baslik" href="#">{product.baslik}</a>
                            <span className="urun-fiyat">{product.fiyat}</span>
                        </div>
                    </div>
                ))}
            </Slider>
            <a class="link" href="/yeni-gelenler">Tümünü Gör</a>
        </div>
    );
}

export default Cantalar;