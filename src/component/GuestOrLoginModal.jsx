import React from 'react';
import '../css/CheckoutModal.css'; // Aynı modal css kullanılabilir

function GuestOrLoginModal({ isOpen, onClose, onSelect }) {
    if (!isOpen) return null;
    return (
        <div className="checkout-modal-overlay">
            <div className="checkout-modal" style={{maxWidth: 400, minWidth: 320, padding: '32px 24px'}}>
                <button className="close-btn" onClick={onClose}>×</button>
                <h2 style={{textAlign:'center', marginBottom:24}}>Devam Etmek İçin Seçim Yapın</h2>
                <div style={{display:'flex', flexDirection:'column', gap:16}}>
                    <button className="siparisi-tamamla-btn"  onClick={() => onSelect('guest')}>
                        Üye Olmadan Devam Et
                    </button>
                    <button className="siparisi-tamamla-btn" style={{background:'#fff', color:'#000', border:'2px solid #000'}} onClick={() => onSelect('login')}>
                        Giriş Yap
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GuestOrLoginModal; 