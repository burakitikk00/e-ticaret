import React from 'react'

function Ikilikesfet1() {
    return (
        <div>
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
                                            src="./src/Images/ayakkabı_kesfet.png"
                                            class="kesfet-resim"
                                            loading="lazy"
                                        />
                                    </div>
                                    <a href="/gozluk" class="kesfet-link">
                                        <div class="kesfet-metin">
                                            <p class="alt-baslik">Keşfet</p>
                                            <p class="ana-baslik">ayakkabı Koleksiyonu</p>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            {/* Sağ Keşfet Kartı - Çanta */}
                            <div class="kesfet-karti">
                                <div class="kesfet-karti-icerik">
                                    <div class="resim-alani">
                                        <img
                                            alt="Şal Koleksiyonu"
                                            src="./src/Images/sal_kesfet.png"
                                            class="kesfet-resim"
                                            loading="lazy"
                                        />
                                    </div>
                                    <a href="/şallar" class="kesfet-link">
                                        <div class="kesfet-metin">
                                            <p class="alt-baslik">Keşfet</p>
                                            <p class="ana-baslik">şal Koleksiyonu</p>
                                        </div>
                                    </a>
                                </div>
                            </div>

                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default Ikilikesfet1