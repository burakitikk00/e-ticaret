import React from 'react'
import '../css/Footer.css'
function Footer() {
    return (

        <div className="footer-container">
            <footer className="footer">
                <div className="footer-wrapper">
                    <div className="footer-top">
                        <div className="footer-menu">
                            <nav>
                                <div className="menu-section">
                                    <p className="section-title">KATEGORİLER</p>
                                    <ul>
                                        <li><a href="/search">TÜM ÜRÜNLER</a></li>
                                        <li><a href="/kadin-ayakkabilari">KADIN AYAKKABILARI</a></li>
                                        <li><a href="/sallar-bereler">ŞALLAR</a></li>
                                        <li><a href="/cantalar">ÇANTALAR</a></li>
                                        <li><a href="/cuzdan">CÜZDAN & KARTLIK</a></li>
                                        <li><a href="/gozluk">GÖZLÜK</a></li>
                                    </ul>
                                </div>

                                <div className="menu-section">
                                    <p className="section-title">HESABIM</p>
                                    <ul>
                                        <li><a href="/cart">Sepetim</a></li>
                                        <li><a href="/account/orders">Siparişlerim</a></li>
                                        <li><a href="/pages/order-tracking">Sipariş Takibi</a></li>
                                        <li><a href="/account">Hesabım</a></li>
                                        <li><a href="/pages/odeme-bildirimi">Ödeme Bildirimi</a></li>
                                        <li><a href="/account/login">Giriş Yap</a></li>
                                        <li><a href="/account/register">Kayıt Ol</a></li>
                                    </ul>
                                </div>

                                <div className="menu-section">
                                    <p className="section-title">KURUMSAL</p>
                                    <ul>
                                        <li><a href="/pages/hakkimizda">Hakkımızda</a></li>
                                        <li><a href="/pages/contact-us">İletişim</a></li>
                                        <li><a href="/pages/faq#0">Sıkça Sorulan Sorular</a></li>
                                    </ul>
                                </div>

                                <div className="menu-section">
                                    <p className="section-title">SÖZLEŞMELER</p>
                                    <ul>
                                        <li><a href="/pages/iade-yoktur-degisim-sartlari">İade Yoktur Değişim Şartları</a></li>
                                        <li><a href="/pages/gizlilik-politikasi">Gizlilik Politikası</a></li>
                                        <li><a href="/pages/kullanici-sozlesmesi">Kullanıcı Sözleşmesi</a></li>
                                        <li><a href="/pages/hizmet-sartlari">Hizmet Şartları</a></li>
                                    </ul>
                                </div>
                            </nav>
                        </div>

                        <div className="subscription">
                            <div className="subscription-content">
                                <p>Kampanya ve indirimlerden güncel olarak haberdar olun</p>
                                <form>
                                    <div className="input-wrapper">
                                        <input type="email" placeholder="E POSTA" autoComplete="on" />
                                    </div>
                                    <button type="submit">TAMAM</button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <div className="bottom-content">

                            <div className="rich-text">

                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>

    )
}

export default Footer



