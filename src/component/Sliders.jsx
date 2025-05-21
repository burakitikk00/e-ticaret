import React from 'react';
import Slider from 'react-slick';
import '../css/Slider.css';

const Sliders = () => {
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

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />
    };

    const images = [
        {
            mobile: "https://cdn.myikas.com/images/theme-images/5e837046-d139-49d0-bbd1-25ebd5fe5106/image_3840.webp",
            desktop: "https://cdn.myikas.com/images/theme-images/5e837046-d139-49d0-bbd1-25ebd5fe5106/image_3840.webp"
        },
        {
            mobile: "https://cdn.myikas.com/images/theme-images/03bd9a57-adc4-4e22-9604-9f59b9b6e627/image_3840.webp",
            desktop: "https://cdn.myikas.com/images/theme-images/03bd9a57-adc4-4e22-9604-9f59b9b6e627/image_3840.webp"
        }
    ];

    return (
        <div >
            <section className="slider multiple">
                <div className="slider-wrapper full-width">
                    <Slider {...settings}>
                        {images.map((image, index) => (
                            <div key={index}>
                                <div className="slider-item">
                                    <div className="item-holder">
                                        <div className="image-holder">
                                            <picture>
                                                <source
                                                    media="(min-width: 768px)"
                                                    srcSet={image.desktop}
                                                />
                                                <img
                                                    src={image.mobile}
                                                    alt="Slider image"
                                                    className="slider-image"
                                                />
                                            </picture>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </section>
        </div>
    );
};
export default Sliders;