import React, { useState } from 'react';
import '../css/LoginModal.css';

function LoginModal({ 
    showLoginModal, 
    setShowLoginModal, 
    isRegister, 
    setIsRegister,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    registerEmail,
    setRegisterEmail,
    registerPassword,
    setRegisterPassword,
    registerPassword2,
    setRegisterPassword2,
    loginError,
    setLoginError,
    registerError,
    setRegisterError,
    registerSuccess,
    handleLogin,
    handleRegister,
    loginType,
    setLoginType,
    loginUsername,
    setLoginUsername
}) {
    const [registerUsername, setRegisterUsername] = useState('');

    return (
        showLoginModal && (
            <div id="login-modal-overlay" onClick={() => {
                setShowLoginModal(false);
                setLoginError('');
                setRegisterError('');
                setRegisterSuccess('');
            }}>
                <div id="login-modal-container" onClick={(e) => e.stopPropagation()}>
                    <button 
                        id="login-modal-close" 
                        onClick={() => {
                            setShowLoginModal(false);
                            setLoginError('');
                            setRegisterError('');
                            setRegisterSuccess('');
                        }}
                    >
                        &times;
                    </button>
                    <h2 id="login-modal-title">
                        {isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
                    </h2>
                    
                    {!isRegister ? (
                        <form onSubmit={handleLogin} id="login-form">
                            {/* Giriş tipi seçimi */}
                            <div className="login-type-selector">
                                <button 
                                    type="button"
                                    className={loginType === 'email' ? 'active' : ''}
                                    onClick={() => {
                                        setLoginType('email');
                                        setLoginError('');
                                    }}
                                >
                                    E-posta ile Giriş
                                </button>
                                <button 
                                    type="button"
                                    className={loginType === 'username' ? 'active' : ''}
                                    onClick={() => {
                                        setLoginType('username');
                                        setLoginError('');
                                    }}
                                >
                                    Kullanıcı Adı ile Giriş
                                </button>
                            </div>

                            {/* Giriş formu */}
                            {loginType === 'email' ? (
                                <input 
                                    type="text" 
                                    placeholder="E-posta" 
                                    value={loginEmail} 
                                    onChange={e => {
                                        setLoginEmail(e.target.value);
                                        setLoginError('');
                                    }}
                                    className="login-input"
                                />
                            ) : (
                                <input 
                                    type="text" 
                                    placeholder="Kullanıcı Adı" 
                                    value={loginUsername} 
                                    onChange={e => {
                                        setLoginUsername(e.target.value);
                                        setLoginError('');
                                    }}
                                    className="login-input"
                                />
                            )}
                            <input 
                                type="password" 
                                placeholder="Şifre" 
                                value={loginPassword} 
                                onChange={e => {
                                    setLoginPassword(e.target.value);
                                    setLoginError('');
                                }}
                                className="login-input"
                            />
                            {loginError && <div className="login-error">{loginError}</div>}
                            <button type="submit" className="login-submit-button">
                                Giriş Yap
                            </button>
                            <div className="login-switch-text">
                                <span>Hesabınız yok mu? </span>
                                <span 
                                    className="login-switch-link"
                                    onClick={() => {
                                        setIsRegister(true);
                                        setLoginError('');
                                    }}
                                >
                                    Kayıt Ol
                                </span>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} id="register-form">
                            <input 
                                type="text" 
                                placeholder="Kullanıcı Adı" 
                                value={registerUsername} 
                                onChange={e => setRegisterUsername(e.target.value)} 
                                className="login-input"
                                required
                                minLength={3}
                                maxLength={20}
                                pattern="[a-zA-Z0-9_]+"
                                title="Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir"
                            />
                            <input 
                                type="text" 
                                placeholder="E-posta" 
                                value={registerEmail} 
                                onChange={e => setRegisterEmail(e.target.value)} 
                                className="login-input"
                                required
                            />
                            <input 
                                type="password" 
                                placeholder="Şifre" 
                                value={registerPassword} 
                                onChange={e => setRegisterPassword(e.target.value)} 
                                className="login-input"
                                required
                                minLength={6}
                            />
                            <input 
                                type="password" 
                                placeholder="Şifre Tekrar" 
                                value={registerPassword2} 
                                onChange={e => setRegisterPassword2(e.target.value)} 
                                className="login-input"
                                required
                            />
                            {registerError && <div className="login-error">{registerError}</div>}
                            {registerSuccess && <div className="login-success">{registerSuccess}</div>}
                            <button type="submit" className="login-submit-button">
                                Kayıt Ol
                            </button>
                            <div className="login-switch-text">
                                <span>Zaten hesabınız var mı? </span>
                                <span 
                                    className="login-switch-link"
                                    onClick={() => {
                                        setIsRegister(false);
                                        setRegisterError('');
                                    }}
                                >
                                    Giriş Yap
                                </span>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        )
    );
}

export default LoginModal; 