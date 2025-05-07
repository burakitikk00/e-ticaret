import React from 'react'
import '../css/Ikilikesfet.css'
function Ikilikesfet() {
    return (

        <div>
            {/* İkili Keşfet Bölümü */}
            <div id="ikili-kesfet">
                <section class="ikili-kesfet-bolumu">
                    <div class="ikili-kesfet-kapsayici">

                        {/* Sol Keşfet Kartı - Gözlük */}
                        <div class="kesfet-karti">
                            <div class="kesfet-karti-icerik">
                                <div class="resim-alani">
                                    <img
                                        alt="Gözlük Koleksiyonu"
                                        src="https://cdn.myikas.com/images/theme-images/b1998df7-4871-4c03-ac95-8d19026aa503/image_3840.webp"
                                        class="kesfet-resim"
                                        loading="lazy"
                                    />
                                </div>
                                <a href="/gozluk" class="kesfet-link">
                                    <div class="kesfet-metin">
                                        <p class="alt-baslik">Keşfet</p>
                                        <p class="ana-baslik">Gözlük Koleksiyonu</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Sağ Keşfet Kartı - Çanta */}
                        <div class="kesfet-karti">
                            <div class="kesfet-karti-icerik">
                                <div class="resim-alani">
                                    <img
                                        alt="Çanta Koleksiyonu"
                                        src="https://cdn.myikas.com/images/theme-images/e5bb8751-11c2-4af7-9c5f-0e6a186fe728/image_3840.webp"
                                        class="kesfet-resim"
                                        loading="lazy"
                                    />
                                </div>
                                <a href="/cantalar" class="kesfet-link">
                                    <div class="kesfet-metin">
                                        <p class="alt-baslik">Keşfet</p>
                                        <p class="ana-baslik">Çanta Koleksiyonu</p>
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