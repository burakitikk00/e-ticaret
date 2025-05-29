import React from 'react'
import '../css/Ikilikesfet.css'
function Ikilikesfet() {
    return (

        <div>
            {/* İkili Keşfet Bölümü */}
            <div id="ikili-kesfet">
                <section className="ikili-kesfet-bolumu">
                    <div className="ikili-kesfet-kapsayici">

                        {/* Sol Keşfet Kartı - Gözlük */}
                        <div className="kesfet-karti">
                            <div className="kesfet-karti-icerik">
                                <div className="resim-alani">
                                    <img
                                        alt="Gözlük Koleksiyonu"
                                        src="https://cdn.myikas.com/images/theme-images/b1998df7-4871-4c03-ac95-8d19026aa503/image_3840.webp"
                                        className="kesfet-resim"
                                        loading="lazy"
                                    />
                                </div>
                                <a href="/Gozlukler" className="kesfet-link">
                                    <div className="kesfet-metin">
                                        <p className="alt-baslik">Keşfet</p>
                                        <p className="ana-baslik">Gözlük Koleksiyonu</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Sağ Keşfet Kartı - Çanta */}
                        <div className="kesfet-karti">
                            <div className="kesfet-karti-icerik">
                                <div className="resim-alani">
                                    <img
                                        alt="Çanta Koleksiyonu"
                                        src="https://cdn.myikas.com/images/theme-images/e5bb8751-11c2-4af7-9c5f-0e6a186fe728/image_3840.webp"
                                        className="kesfet-resim"
                                        loading="lazy"
                                    />
                                </div>
                                <a href="/Canta" className="kesfet-link">
                                    <div className="kesfet-metin">
                                        <p className="alt-baslik">Keşfet</p>
                                        <p className="ana-baslik">Çanta Koleksiyonu</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                    </div>
                </section>
            </div>
        </div>

    )
}


export default Ikilikesfet