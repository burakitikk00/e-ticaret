import React, { useState, useEffect } from 'react'
import '../css/Header.css'
import { FaShoppingBag, FaTimes } from "react-icons/fa";
import { CiLogin } from "react-icons/ci";
import { FaBars } from "react-icons/fa";
import LoginModal from './LoginModal';
import { useUser } from '../context/UserContext';
import UserMenu from './UserMenu';

function Header() {
    const [showBagMenu, setShowBagMenu] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showSidebarBagMenu, setShowSidebarBagMenu] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: "Örnek Ürünsdsdasd",
            price: 199.99,
            image: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            quantity: 1
        },
        {
            id: 2,
            name: "Örnek Ürünsadsad",
            price: 199.99,
            image: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            quantity: 2
        }
    ]);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerPassword2, setRegisterPassword2] = useState('');
    const [loginError, setLoginError] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [registerSuccess, setRegisterSuccess] = useState('');
    const { user, login, register } = useUser();

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

    const removeFromCart = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (loginEmail && loginPassword) {
            const result = await login(loginEmail, loginPassword);
            if (result.success) {
                setLoginError('');
                setShowLoginModal(false);
            } else {
                setLoginError(result.error);
            }
        } else {
            setLoginError('E-posta ve şifre giriniz.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!registerEmail || !registerPassword || !registerPassword2) {
            setRegisterError('Tüm alanları doldurunuz.');
            setRegisterSuccess('');
            return;
        }
        if (registerPassword !== registerPassword2) {
            setRegisterError('Şifreler eşleşmiyor.');
            setRegisterSuccess('');
            return;
        }

        const result = await register(registerEmail, registerPassword, registerEmail.split('@')[0]);
        if (result.success) {
            setRegisterError('');
            setRegisterSuccess('Kayıt başarılı! Giriş yapabilirsiniz.');
            setTimeout(() => {
                setIsRegister(false);
                setRegisterSuccess('');
            }, 1500);
        } else {
            setRegisterError(result.error);
            setRegisterSuccess('');
        }
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
                        <li><a href="/Tum_urunler" className="menu-item">TÜM ÜRÜNLER</a></li>
                        <li className="dropdown"
                            onMouseEnter={() => setShowBagMenu(true)}
                            onMouseLeave={() => setShowBagMenu(false)}>
                            <a href="/Canta" className="menu-item">ÇANTALAR</a>
                            {showBagMenu && (
                                <div className="dropdown-container">
                                    <ul className="dropdown-menu">
                                        <li>
                                            <a href="/Canta" className="dropdown-item">
                                                <img src="./src/Images/omuz_cantası.png" alt="Omuz Çantası" className="dropdown-image" />
                                                <span>Omuz Çantaları</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/Canta" className="dropdown-item">
                                                <img src="./src/Images/sırt_cantası.png" alt="Sırt Çantası" className="dropdown-image" />
                                                <span>Sırt Çantaları</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/Canta" className="dropdown-item">
                                                <img src="./src/Images/postacı_cantası.png" alt="Postacı Çantası" className="dropdown-image" />
                                                <span>Postacı Çantaları</span>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </li>
                        <li><a href="/Gozlukler" className="menu-item">GÖZLÜKLER</a></li>
                        <li><a href="/CuzdanKartlik" className="menu-item">CÜZDAN & KARTLIK</a></li>
                        <li><a href="/Sallar" className="menu-item">ŞALLAR</a></li>
                        <li><a href="/Ayakkabilar" className="menu-item">KADIN AYAKKABILAR</a></li>
                    </ul>
                </nav>

                {/* Mobil sidebar */}
                <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
                    <button className="close-sidebar" onClick={toggleSidebar}>×</button>
                    <div className="sidebar-content">
                        <ul>
                            <li>
                                <a href="/Tum_urunler" className="menu-item">
                                    <span>TÜM ÜRÜNLER</span>
                                    <img src="./src/Images/Tüm_ürünler.jpg" alt="Tüm Ürünler" className="sidebar-image" />
                                </a>
                            </li>
                            <li className="dropdown"
                                onClick={() => setShowSidebarBagMenu(!showSidebarBagMenu)}>
                                <a href="/Canta" className="menu-item">
                                    <span>ÇANTALAR</span>
                                    <img src="./src/Images/Çantalar.png" alt="Çantalar" className="sidebar-image" />
                                </a>
                                {showSidebarBagMenu && (
                                    <ul className="sidebar-submenu">
                                        <li>
                                            <a href="/Canta" className="dropdown-item">
                                                <img src="./src/Images/omuz_cantası.png" alt="Omuz Çantası" className="dropdown-image" />
                                                <span>Omuz Çantaları</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/Canta" className="dropdown-item">
                                                <img src="./src/Images/sırt_cantası.png" alt="Sırt Çantası" className="dropdown-image" />
                                                <span>Sırt Çantaları</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/Canta" className="dropdown-item">
                                                <img src="./src/Images/postacı_cantası.png" alt="Postacı Çantası" className="dropdown-image" />
                                                <span>Postacı Çantaları</span>
                                            </a>
                                        </li>
                                    </ul>
                                )}
                            </li>
                            <li>
                                <a href="/Gozlukler" className="menu-item">
                                    <span>GÖZLÜKLER</span>
                                    <img src="./src/Images/gözlükler.png" alt="Gözlükler" className="sidebar-image" />
                                </a>
                            </li>
                            <li>
                                <a href="/Ayakkabilar" className="menu-item">
                                    <span>AYAKKABI MODELLERİ</span>
                                    <img src="./src/Images/ayakkabı.png" alt="Şal Modelleri" className="sidebar-image" />
                                </a>
                            </li>
                            <li>
                                <a href="/CuzdanKartlik" className="menu-item">
                                    <span>CÜZDAN & KARTLIK </span>
                                    <img src="./src/Images/cüzdan_kartlik.png" alt="Şal Modelleri" className="sidebar-image" />
                                </a>
                            </li>
                            <li>
                                <a href="/Sallar" className="menu-item">
                                    <span>ŞAL MODELLERİ</span>
                                    <img src="./src/Images/şallar.png" alt="Şal Modelleri" className="sidebar-image" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Sepet Paneli */}
                <div style={{
                    position: 'fixed',
                    top: 0,
                    right: isCartOpen ? 0 : '-400px',
                    width: 400,
                    height: '93vh', // Changed to 90vh
                    background: '#fff',
                    boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
                    zIndex: 2000,
                    transition: 'right 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 24,
                    visibility: isCartOpen ? 'visible' : 'hidden',
                    marginBottom: '10vh' // Added 10vh margin at bottom
                }}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                        <h2 style={{margin:0, fontSize:22}}>Sepetim</h2>
                        <button onClick={() => setIsCartOpen(false)} style={{background:'none', border:'none', fontSize:24, cursor:'pointer'}}><FaTimes /></button>
                    </div>
                    <div style={{flex:1, overflowY:'auto'}}>
                        {cartItems.length === 0 ? (
                            <p>Sepetiniz boş.</p>
                        ) : (
                            cartItems.map(item => (
                                <div key={item.id} style={{display:'flex', alignItems:'center', marginBottom:16, borderBottom:'1px solid #eee', paddingBottom:8}}>
                                    <img src={item.image} alt={item.name} style={{width:60, height:60, objectFit:'cover', borderRadius:8, marginRight:12}} />
                                    <div style={{flex:1}}>
                                        <div style={{fontWeight:'bold'}}>{item.name}</div>
                                        <div style={{color:'#888', fontSize:14}}>Adet: {item.quantity}</div>
                                    </div>
                                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                        <div style={{fontWeight:'bold'}}>{item.price.toLocaleString('tr-TR', {style:'currency', currency:'TRY'})}</div>
                                        <button onClick={() => removeFromCart(item.id)} style={{background:'none', border:'none', color:'#d00', fontSize:20, cursor:'pointer'}}><FaTimes /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div style={{borderTop:'1px solid #eee', paddingTop:16}}>
                        <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:18, marginBottom:12}}>
                            <span>Toplam:</span>
                            <span>{total.toLocaleString('tr-TR', {style:'currency', currency:'TRY'})}</span>
                        </div>
                        <div>
                            <button style={{
                                width:'100%',
                                background:'#222',
                                color:'#fff'
                            }}>
                                Alışverişi Tamamla
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
                    <input className='search-input' type="text" placeholder='Ürün arayın ' />
                    
                    {user ? (
                        <UserMenu />
                    ) : (
                        <CiLogin 
                            className='icons' 
                            style={{ 
                                position: 'relative', 
                                marginLeft: '10px', 
                                marginRight: '10px', 
                                cursor: 'pointer' 
                            }} 
                            onClick={() => setShowLoginModal(true)} 
                        />
                    )}
                    
                    <LoginModal 
                        showLoginModal={showLoginModal}
                        setShowLoginModal={setShowLoginModal}
                        isRegister={isRegister}
                        setIsRegister={setIsRegister}
                        loginEmail={loginEmail}
                        setLoginEmail={setLoginEmail}
                        loginPassword={loginPassword}
                        setLoginPassword={setLoginPassword}
                        registerEmail={registerEmail}
                        setRegisterEmail={setRegisterEmail}
                        registerPassword={registerPassword}
                        setRegisterPassword={setRegisterPassword}
                        registerPassword2={registerPassword2}
                        setRegisterPassword2={setRegisterPassword2}
                        loginError={loginError}
                        registerError={registerError}
                        registerSuccess={registerSuccess}
                        handleLogin={handleLogin}
                        handleRegister={handleRegister}
                    />

                    <div style={{ position: 'relative', marginLeft: '10px', marginRight: '20px' }}>
                        <FaShoppingBag className='icons' style={{ cursor: 'pointer' }} onClick={() => setIsCartOpen(true)} />
                        {cartItems.length > 0 && (
                            <span style={{ position: 'absolute', top: -6, right: -6, background: '#d00', color: '#fff', borderRadius: '50%', fontSize: 12, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartItems.length}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header