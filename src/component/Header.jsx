import React, { useState, useEffect } from 'react'
import '../css/Header.css'
import { FaShoppingBag } from "react-icons/fa";
import { CiLogin } from "react-icons/ci";
import { FaBars } from "react-icons/fa";

function Header() {
    const [showBagMenu, setShowBagMenu] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showSidebarBagMenu, setShowSidebarBagMenu] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: isSticky ? 'fixed' : 'relative',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            transform: isSticky ? 'translateY(0)' : 'none',
            width: '100%'

        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                maxWidth: '100%',
                position: 'relative',
                padding: '10px'
            }}>
                {/* Mobil menü butonu */}
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <FaBars />
                </button>

                <div className='flex-row' style={{ flex: '0 0 auto' }}>
                    <img className="logo" src="./src/Images/logo.jpg" alt="logo" />
                    <p className='logo-text'>Lina Çanta</p>
                </div>

                {/* Masaüstü navigasyon */}
                <nav className={`nav-menu desktop-menu ${isSidebarOpen ? 'active' : ''}`}>
                    <ul>
                        <li><a href="#" className="menu-item">TÜM ÜRÜNLER</a></li>
                        <li className="dropdown"
                            onMouseEnter={() => setShowBagMenu(true)}
                            onMouseLeave={() => setShowBagMenu(false)}>
                            <a href="#" className="menu-item">ÇANTALAR</a>
                            {showBagMenu && (
                                <div className="dropdown-container">
                                    <ul className="dropdown-menu">

                                        <li>
                                            <a href="#" className="dropdown-item">
                                                <img src="./src/Images/omuz_cantası.png" alt="Omuz Çantası" className="dropdown-image" />
                                                <span>Omuz Çantaları</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="dropdown-item">
                                                <img src="./src/Images/sırt_cantası.png" alt="Sırt Çantası" className="dropdown-image" />
                                                <span>Sırt Çantaları</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="dropdown-item">
                                                <img src="./src/Images/postacı_cantası.png" alt="Postacı Çantası" className="dropdown-image" />
                                                <span>Postacı Çantaları</span>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </li>
                        <li><a href="#" className="menu-item">GÖZLÜKLER</a></li>
                        <li><a href="#" className="menu-item">CÜZDAN & KARTLIK</a></li>
                        <li><a href="#" className="menu-item">ŞALLAR</a></li>
                        <li><a href="#" className="menu-item">KADIN AYAKKABILAR</a></li>
                    </ul>
                </nav>

                {/* Mobil sidebar */}
                <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
                    <button className="close-sidebar" onClick={toggleSidebar}>×</button>
                    <div className="sidebar-content">
                        <ul>
                            <li>
                                <a href="#" className="menu-item">
                                    <span>TÜM ÜRÜNLER</span>
                                    <img src="./src/Images/Tüm_ürünler.jpg" alt="Tüm Ürünler" className="sidebar-image" />
                                </a>
                            </li>
                            <li className="dropdown"
                                onClick={() => setShowSidebarBagMenu(!showSidebarBagMenu)}>
                                <a href="#" className="menu-item">
                                    <span>ÇANTALAR</span>
                                    <img src="./src/Images/Çantalar.png" alt="Çantalar" className="sidebar-image" />
                                </a>
                                {showSidebarBagMenu && (
                                    <ul className="sidebar-submenu">

                                        <li>
                                            <a href="#" className="dropdown-item">
                                                <img src="./src/Images/omuz_cantası.png" alt="Omuz Çantası" className="dropdown-image" />
                                                <span>Omuz Çantaları</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="dropdown-item">
                                                <img src="./src/Images/sırt_cantası.png" alt="Sırt Çantası" className="dropdown-image" />
                                                <span>Sırt Çantaları</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="dropdown-item">
                                                <img src="./src/Images/postacı_cantası.png" alt="Postacı Çantası" className="dropdown-image" />
                                                <span>Postacı Çantaları</span>
                                            </a>
                                        </li>
                                    </ul>
                                )}
                            </li>
                            <li>
                                <a href="#" className="menu-item">
                                    <span>GÖZLÜKLER</span>
                                    <img src="./src/Images/gözlükler.png" alt="Gözlükler" className="sidebar-image" />
                                </a>
                            </li>
                            <li>

                                <a href="#" className="menu-item">
                                    <span>AYAKKABI MODELLERİ</span>
                                    <img src="./src/Images/ayakkabı.png" alt="Şal Modelleri" className="sidebar-image" />
                                </a>
                            </li>
                            <li>

                                <a href="#" className="menu-item">
                                    <span>CÜZDAN & KARTLIK </span>
                                    <img src="./src/Images/cüzdan_kartlik.png" alt="Şal Modelleri" className="sidebar-image" />
                                </a>
                            </li>
                            <li>

                                <a href="#" className="menu-item">
                                    <span>ŞAL MODELLERİ</span>
                                    <img src="./src/Images/şallar.png" alt="Şal Modelleri" className="sidebar-image" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>


                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
                    <input className='search-input' type="text" placeholder='Ürün arayın ' />
                    <CiLogin className='icons' />
                    <FaShoppingBag className='icons' />
                </div>
            </div>
        </div>
    )
}

export default Header
