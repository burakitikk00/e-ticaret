import React from 'react'

function Ikilikesfet1() {
    return (
        <div>
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
                                            src="./src/Images/ayakkabı_kesfet.png"
                                            className="kesfet-resim"
                                            loading="lazy"
                                        />
                                    </div>
                                    <a href="/Ayakkabilar" className="kesfet-link">
                                        <div className="kesfet-metin">
                                            <p className="alt-baslik">Keşfet</p>
                                            <p className="ana-baslik">ayakkabı Koleksiyonu</p>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            {/* Sağ Keşfet Kartı - Çanta */}
                            <div className="kesfet-karti">
                                <div className="kesfet-karti-icerik">
                                    <div className="resim-alani">
                                        <img
                                            alt="Şal Koleksiyonu"
                                            src="./src/Images/sal_kesfet.png"
                                            className="kesfet-resim"
                                            loading="lazy"
                                        />
                                    </div>
                                    <a href="/Sallar" className="kesfet-link">
                                        <div className="kesfet-metin">
                                            <p className="alt-baslik">Keşfet</p>
                                            <p className="ana-baslik">şal Koleksiyonu</p>
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