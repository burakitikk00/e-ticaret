import React, { useState, useEffect } from 'react'
import '../css/Header.css'
import { FaShoppingBag, FaTimes } from "react-icons/fa";
import { CiLogin } from "react-icons/ci";
import { FaBars } from "react-icons/fa";
import LoginModal from './LoginModal';
import { useUser } from '../context/UserContext';
import UserMenu from './UserMenu';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
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
    const { user, login, register, logout } = useUser();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginType, setLoginType] = useState('email');
    const [registerUsername, setRegisterUsername] = useState('');

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

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/api/categories');
                if (response.data.success) {
                    setCategories(response.data.data);
                } else {
                    setError('Kategoriler yüklenirken bir hata oluştu');
                }
            } catch (error) {
                console.error('Kategoriler yüklenirken hata:', error);
                setError('Kategoriler yüklenirken bir hata oluştu: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
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
        console.log('=== GİRİŞ İŞLEMİ BAŞLADI ===');
        
        // Giriş tipine göre kontrol
        if (loginType === 'email' && !loginEmail) {
            setLoginError('E-posta giriniz.');
            return;
        }
        
        if (loginType === 'username' && !loginUsername) {
            setLoginError('Kullanıcı adı giriniz.');
            return;
        }
        
        if (!loginPassword) {
            setLoginError('Şifre giriniz.');
            return;
        }

        const loginData = {
            email: loginType === 'email' ? loginEmail : '',
            username: loginType === 'username' ? loginUsername : '',
            password: loginPassword,
            loginType: loginType
        };
        
        try {
            console.log('Login API çağrısı yapılıyor...');
            const result = await login(loginData);
            console.log('Login API yanıtı:', {
                success: result.success,
                error: result.error,
                hasToken: !!result.token
            });
            
            if (result.success) {
                console.log('✅ Giriş başarılı! Token alındı');
                setLoginError('');
                setShowLoginModal(false);
                // Form alanlarını temizle
                setLoginEmail('');
                setLoginUsername('');
                setLoginPassword('');
                // Account sayfasına yönlendir
                navigate('/account');
            } else {
                console.error('❌ Giriş başarısız:', {
                    error: result.error,
                    status: result.status
                });
                setLoginError(result.error || 'Giriş yapılırken bir hata oluştu');
            }
        } catch (error) {
            console.error('❌ Login API hatası:', {
                message: error.message,
                stack: error.stack,
                response: error.response?.data
            });
            setLoginError('Giriş yapılırken beklenmeyen bir hata oluştu: ' + error.message);
        }
        
        console.log('=== GİRİŞ İŞLEMİ TAMAMLANDI ===');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        console.log('=== KAYIT İŞLEMİ BAŞLADI ===');
        console.log('Kayıt bilgileri:', { 
            username: registerUsername,
            email: registerEmail,
            passwordLength: registerPassword?.length || 0,
            password2Length: registerPassword2?.length || 0
        });

        // Kullanıcı adı kontrolü
        if (!registerUsername || registerUsername.length < 3) {
            setRegisterError('Kullanıcı adı en az 3 karakter olmalıdır.');
            return;
        }

        // Kullanıcı adı formatı kontrolü
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(registerUsername)) {
            setRegisterError('Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.');
            return;
        }

        // E-posta kontrolü (sadece @ işareti kontrolü)
        if (!registerEmail.includes('@')) {
            setRegisterError('Geçerli bir e-posta adresi giriniz.');
            return;
        }

        // Şifre uzunluğu kontrolü
        if (registerPassword.length < 6) {
            setRegisterError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        if (!registerEmail || !registerPassword || !registerPassword2) {
            setRegisterError('Tüm alanları doldurunuz.');
            return;
        }

        if (registerPassword !== registerPassword2) {
            setRegisterError('Şifreler eşleşmiyor.');
            return;
        }

        try {
            console.log('Register API çağrısı yapılıyor...');
            const result = await register(registerEmail, registerPassword, registerUsername);
            console.log('Register API yanıtı (tam):', JSON.stringify(result, null, 2));

            if (!result) {
                throw new Error('API yanıtı alınamadı');
            }

            if (result.success && result.userId && result.user) {
                console.log('✅ Kayıt başarılı!', {
                    userId: result.userId,
                    user: result.user
                });
                
                setRegisterError('');
                setRegisterSuccess('Kayıt başarılı! Giriş yapabilirsiniz.');
                
                // Form alanlarını temizle
                setRegisterEmail('');
                setRegisterUsername('');
                setRegisterPassword('');
                setRegisterPassword2('');
                
                // Başarılı kayıt sonrası giriş formuna geç
                setTimeout(() => {
                    setIsRegister(false);
                    setRegisterSuccess('');
                    setLoginEmail(registerEmail);
                    setLoginPassword('');
                }, 1500);
            } else {
                const errorMessage = result.message || 'Kayıt işlemi tamamlanamadı';
                console.error('❌ Kayıt başarısız:', {
                    success: result.success,
                    message: errorMessage,
                    userId: result.userId,
                    user: result.user
                });
                setRegisterError(errorMessage);
            }
        } catch (error) {
            console.error('❌ Register API hatası:', error);
            setRegisterError(error.message || 'Kayıt işlemi sırasında bir hata oluştu');
        }
        console.log('=== KAYIT İŞLEMİ TAMAMLANDI ===');
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

                <div className='flex-row' style={{ flex: '0 0 auto' , marginRight:'10px' }}>
                    <img className="logo" src="./src/Images/logo.jpg" alt="logo" />
                    <p className='logo-text'>Lina Çanta</p>
                </div>

                {/* Masaüstü navigasyon */}
                <nav className={`nav-menu desktop-menu ${isSidebarOpen ? 'active' : ''}`}>
                    <ul>
                        <li key="all-products-desktop">
                            <a href="/urunler" className="menu-item">TÜM ÜRÜNLER</a>
                        </li>
                        {loading ? (
                            <li key="loading-desktop">Yükleniyor...</li>
                        ) : error ? (
                            <li key="error-desktop">Hata: {error}</li>
                        ) : (
                            categories.map((category, index) => (
                                <li key={`category-${category.CategoryID}-${index}`}>
                                    <a 
                                        href={`/urunler?kategori=${encodeURIComponent(category.CategoriesName.toLowerCase())}`} 
                                        className="menu-item"
                                    >
                                        {category.CategoriesName.toUpperCase()}
                                    </a>
                                </li>
                            ))
                        )}
                    </ul>
                </nav>

                {/* Mobil sidebar */}
                <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
                    <button className="close-sidebar" onClick={toggleSidebar}>×</button>
                    <div className="sidebar-content">
                        <ul>
                            <li key="all-products-mobile">
                                <a href="/urunler" className="menu-item">
                                    <span>TÜM ÜRÜNLER</span>
                                </a>
                            </li>
                            {loading ? (
                                <li key="loading-mobile">Yükleniyor...</li>
                            ) : error ? (
                                <li key="error-mobile">Hata: {error}</li>
                            ) : (
                                categories.map((category, index) => (
                                    <li key={`category-mobile-${category.CategoryID}-${index}`}>
                                        <a 
                                            href={`/urunler?kategori=${encodeURIComponent(category.CategoriesName.toLowerCase())}`} 
                                            className="menu-item"
                                        >
                                            <span>{category.CategoriesName.toUpperCase()}</span>
                                        </a>
                                    </li>
                                ))
                            )}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span 
                                onClick={() => navigate('/account')} 
                                style={{ 
                                    fontSize: '14px', 
                                    color: '#666',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    ':hover': {
                                        color: '#333'
                                    }
                                }}
                            >
                                {user.username}
                            </span>
                            <button 
                                onClick={() => {
                                    logout();
                                    setShowLoginModal(false);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    color: '#666',
                                    fontSize: '14px'
                                }}
                            >
                                <CiLogin style={{ fontSize: '20px' }} />
                                Çıkış Yap
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setShowLoginModal(true)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                color: '#666',
                                fontSize: '14px'
                            }}
                        >
                            <CiLogin style={{ fontSize: '20px' }} />
                            Giriş Yap
                        </button>
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
                        setLoginError={setLoginError}
                        registerError={registerError}
                        setRegisterError={setRegisterError}
                        registerSuccess={registerSuccess}
                        handleLogin={handleLogin}
                        handleRegister={handleRegister}
                        loginType={loginType}
                        setLoginType={setLoginType}
                        loginUsername={loginUsername}
                        setLoginUsername={setLoginUsername}
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