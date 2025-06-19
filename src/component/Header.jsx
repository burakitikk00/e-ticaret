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
import { useCart } from '../context/CartContext';
import CheckoutModal from './CheckoutModal';
import GuestOrLoginModal from './GuestOrLoginModal';

function Header() {
    const navigate = useNavigate();
    const [showBagMenu, setShowBagMenu] = useState(false);
    const [isSticky, setIsSticky] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showSidebarBagMenu, setShowSidebarBagMenu] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
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
    
    // Arama için yeni state'ler
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isGuestOrLoginOpen, setIsGuestOrLoginOpen] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/api/categories');
                if (response.data.success) {
                    // Yeni Gelenler ve Çok Satılanlar kategorilerini filtrele
                    const filteredCategories = response.data.data.filter(category => 
                        category.CategoriesName.toLowerCase() !== 'yeni gelenler' && 
                        category.CategoriesName.toLowerCase() !== 'çok satılanlar'
                    );
                    setCategories(filteredCategories);
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
        if (!registerUsername || registerUsername.length < 5) {
            setRegisterError('Kullanıcı adı en az 5 karakter olmalıdır.');
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

    // createCartItemKey fonksiyonunu ekleyelim
    const createCartItemKey = (item) => {
        const productId = item.product?.id || item.product?.ProductID;
        const v1 = item.selectedVaryasyon1 || '';
        const v2 = item.selectedVaryasyon2 || '';
        return `${productId}-${v1}-${v2}`;
    };

    // Ürün arama fonksiyonu
    const handleSearch = async (query) => {
        if (query.length < 3) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        try {
            setIsSearching(true);
            const response = await axios.get(`http://localhost:5000/api/products/search?q=${encodeURIComponent(query)}`);
            if (response.data.success) {
                setSearchResults(response.data.products.slice(0, 8)); // İlk 8 sonucu göster
                setShowSearchResults(true);
            }
        } catch (error) {
            console.error('Arama hatası:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Arama input değişikliği
    const handleSearchInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.length >= 3) {
            handleSearch(query);
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    };

    // Arama sonucuna tıklama
    const handleSearchResultClick = (product) => {
        setSearchQuery('');
        setShowSearchResults(false);
        setSearchResults([]);
        navigate(`/product/${product.id || product.ProductID}`);
    };

    // Arama dropdown'ını kapatma
    const handleSearchBlur = () => {
        setTimeout(() => {
            setShowSearchResults(false);
        }, 200);
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
                justifyContent: 'center',
                width: '100%',
                maxWidth: '100%',
                position: 'relative',
                padding: '8px 10px'
            }}>
                {/* Mobil menü butonu */}
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <FaBars />
                </button>

                <div 
                    className='flex-row' 
                    style={{ flex: '0 0 auto' , marginRight:'8px', cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                >
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
                    right: isCartOpen ? 0 : '-300px',
                    width: 300,
                    height: '97vh',
                    background: '#fff',
                    boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
                    zIndex: 2000,
                    transition: 'right 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 16,
                    visibility: isCartOpen ? 'visible' : 'hidden'
                }}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                        <h2 style={{margin:0, fontSize:18}}>Sepetim</h2>
                        <button onClick={() => setIsCartOpen(false)} style={{background:'none', border:'none', fontSize:20, cursor:'pointer'}}><FaTimes /></button>
                    </div>
                    <div style={{flex:1, overflowY:'auto'}}>
                        {cartItems.length === 0 ? (
                            <p style={{fontSize: 14}}>Sepetiniz boş.</p>
                        ) : (
                            cartItems.map((item, index) => {
                                const productData = item.product || item;
                                const itemKey = createCartItemKey(item);

                                if (!productData || (!productData.id && !productData.ProductID)) {
                                    console.error('Sepette eksik/hatalı ürün verisi:', item);
                                    return null; 
                                }

                                return (
                                    <div key={itemKey} style={{display:'flex', alignItems:'center', marginBottom:12, borderBottom:'1px solid #eee', paddingBottom:6}}>
                                        <img 
                                            src={productData.resim || productData.ImageURL}
                                            alt={productData.baslik || productData.ProductName || 'Ürün Görseli'}
                                            style={{width:50, height:50, objectFit:'cover', borderRadius:6, marginRight:10}}
                                        />
                                        <div style={{flex:1}}>
                                            <div style={{fontWeight:'bold', fontSize: 13}}>{productData.baslik || productData.ProductName || 'Ürün Adı'}</div>
                                            {item.selectedVaryasyon1 || item.selectedVaryasyon2 ? (
                                                <div style={{fontSize: 11, color: '#555', marginTop: '2px'}}>
                                                    {item.selectedVaryasyon1 && <span>{item.selectedVaryasyon1}</span>}
                                                    {item.selectedVaryasyon1 && item.selectedVaryasyon2 && <span> - </span>}
                                                    {item.selectedVaryasyon2 && <span>{item.selectedVaryasyon2}</span>}
                                                </div>
                                            ) : null}
                                            <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px'}}>
                                                <button 
                                                    onClick={() => {
                                                        if ((item.quantity || 0) > 1) {
                                                            updateQuantity(itemKey, (item.quantity || 0) - 1);
                                                        }
                                                    }}
                                                    style={{
                                                        background: (item.quantity || 0) <= 1 ? '#e0e0e0' : '#f0f0f0',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        cursor: (item.quantity || 0) <= 1 ? 'not-allowed' : 'pointer',
                                                        padding: '8px 10px',
                                                        opacity: (item.quantity || 0) <= 1 ? 0.5 : 1
                                                    }}
                                                    disabled={(item.quantity || 0) <= 1}
                                                >-</button>
                                                <span style={{color:'#888', fontSize:12}}>{item.quantity || 0}</span>
                                                <button 
                                                    onClick={() => updateQuantity(itemKey, (item.quantity || 0) + 1)}
                                                    style={{
                                                        background: '#f0f0f0',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        cursor: 'pointer',
                                                        padding: '8px 10px'
                                                    }}
                                                >+</button>
                                            </div>
                                        </div>
                                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                            <div style={{fontWeight:'bold', fontSize: 12}}>
                                                {typeof productData.fiyat === 'string' 
                                                    ? productData.fiyat 
                                                    : `₺${(productData.fiyat || productData.BasePrice || 0)?.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                                            </div>
                                            <button onClick={() => removeFromCart(itemKey)} style={{background:'none', border:'none', color:'#d00', fontSize:16, cursor:'pointer'}}><FaTimes /></button> 
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <div style={{borderTop:'1px solid #eee', paddingTop:12}}>
                        <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:16, marginBottom:10}}>
                            <span>Toplam:</span>
                            <span>₺{getTotalPrice().toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div>
                            <button style={{
                                width:'100%',
                                padding: '10px',
                                background:'#222',
                                color:'#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                            onClick={() => {
                                if(user) {
                                    setIsCheckoutOpen(true);
                                } else {
                                    setIsGuestOrLoginOpen(true);
                                }
                            }}
                            >
                                Alışverişi Tamamla
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sepet ve Menü dışına tıklayınca kapanma için overlay */}
                {(isCartOpen || isSidebarOpen) && (
                    <div 
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            zIndex: 1999,
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            setIsCartOpen(false);
                            setIsSidebarOpen(false);
                        }}
                    />
                )}

                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ position: 'relative' }}>
                        <input 
                            className='search-input' 
                            type="text" 
                            placeholder='Ürün arayın' 
                            value={searchQuery}
                            onChange={handleSearchInputChange} 
                            onBlur={handleSearchBlur} 
                        />
                        
                        {/* Arama Sonuçları Dropdown */}
                        {showSearchResults && (
                            <div className="search-results-dropdown">
                                {isSearching ? (
                                    <div className="search-loading">
                                        Aranıyor...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((product, index) => (
                                        <div 
                                            key={index}
                                            className="search-result-item"
                                            onClick={() => handleSearchResultClick(product)}
                                        >
                                            <img 
                                                src={product.resim || product.ImageURL} 
                                                alt={product.baslik || product.ProductName}
                                                className="search-result-image"
                                            />
                                            <div className="search-result-info">
                                                <div className="search-result-title">
                                                    {product.baslik || product.ProductName}
                                                </div>
                                                <div className="search-result-price">
                                                    {typeof product.fiyat === 'string' 
                                                        ? product.fiyat 
                                                        : `₺${(product.fiyat || product.BasePrice || 0)?.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : searchQuery.length >= 3 ? (
                                    <div className="search-no-results">
                                        Sonuç bulunamadı
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                    
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span 
                                onClick={() => navigate('/account')} 
                                style={{ 
                                    fontSize: '12px',
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
                                    gap: '3px',
                                    color: '#666',
                                    fontSize: '12px'
                                }}
                            >
                                <CiLogin style={{ fontSize: '16px' }} />
                                Çıkış
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
                                gap: '3px',
                                color: '#666',
                                fontSize: '12px'
                            }}
                        >
                            <CiLogin style={{ fontSize: '16px' }} />
                            Giriş
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
                        registerUsername={registerUsername}
                        setRegisterUsername={setRegisterUsername}
                    />

                    <div style={{ position: 'relative', marginLeft: '5px' }}>
                        <FaShoppingBag className='icons' style={{ cursor: 'pointer' }} onClick={() => setIsCartOpen(true)} />
                        {cartItems.length > 0 && (
                            <span style={{ 
                                position: 'absolute', 
                                top: -6, 
                                right: -6, 
                                background: '#d00', 
                                color: '#fff', 
                                borderRadius: '50%', 
                                fontSize: 10,
                                width: 18,
                                height: 18,
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }}>
                                {/* Toplam ürün adedini getTotalItems fonksiyonu hesaplıyor */}
                                {getTotalItems()}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            {/* Üye olmadan/giriş yap modalı */}
            <GuestOrLoginModal 
                isOpen={isGuestOrLoginOpen} 
                onClose={() => setIsGuestOrLoginOpen(false)}
                onSelect={(type) => {
                    setIsGuestOrLoginOpen(false);
                    setIsCartOpen(false);
                    if(type === 'login') {
                        setIsRegister(false); // Giriş ekranı açılsın
                        setShowLoginModal(true);
                    }
                    if(type === 'register') {
                        setIsRegister(true); // Üye ol ekranı açılsın
                        setShowLoginModal(true);
                    }
                }}
            />
            {/* Sipariş tamamlama modalı */}
            <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onOrderComplete={() => setIsCartOpen(false)} />
        </div>
    )
}

export default Header