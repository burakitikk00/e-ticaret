import React from 'react';
import Slider from 'react-slick';
import '../css/Slider.css';

import sliderIndirim from '../Images/Slider1.jpg';
import slider2 from '../Images/Slider2.jpg';
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
            mobile: sliderIndirim,
            desktop: sliderIndirim
        },
        {
            mobile: slider2,
            desktop: slider2
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