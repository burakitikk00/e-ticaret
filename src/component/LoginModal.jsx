import React from 'react';
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
    registerError,
    registerSuccess,
    handleLogin,
    handleRegister 
}) {
    return (
        showLoginModal && (
            <div id="login-modal-overlay">
                <div id="login-modal-container">
                    <button 
                        id="login-modal-close" 
                        onClick={() => setShowLoginModal(false)}
                    >
                        &times;
                    </button>
                    <h2 id="login-modal-title">
                        {isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
                    </h2>
                    
                    {!isRegister ? (
                        <form onSubmit={handleLogin} id="login-form">
                            <input 
                                type="email" 
                                placeholder="E-posta" 
                                value={loginEmail} 
                                onChange={e => setLoginEmail(e.target.value)} 
                                className="login-input"
                            />
                            <input 
                                type="password" 
                                placeholder="Şifre" 
                                value={loginPassword} 
                                onChange={e => setLoginPassword(e.target.value)} 
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
                                type="email" 
                                placeholder="E-posta" 
                                value={registerEmail} 
                                onChange={e => setRegisterEmail(e.target.value)} 
                                className="login-input"
                            />
                            <input 
                                type="password" 
                                placeholder="Şifre" 
                                value={registerPassword} 
                                onChange={e => setRegisterPassword(e.target.value)} 
                                className="login-input"
                            />
                            <input 
                                type="password" 
                                placeholder="Şifre Tekrar" 
                                value={registerPassword2} 
                                onChange={e => setRegisterPassword2(e.target.value)} 
                                className="login-input"
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