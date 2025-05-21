import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../css/UserMenu.css';

function UserMenu() {
    const { user, logout } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Menü dışına tıklandığında kapanması için
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/');
    };

    const handleAccountClick = () => {
        setIsOpen(false);
        navigate('/account');
    };

    if (!user) return null;

    return (
        <div className="user-menu-container" ref={menuRef}>
            <button 
                className="user-menu-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                {user.name}
            </button>
            
            {isOpen && (
                <div className="user-menu-dropdown">
                    <button 
                        className="user-menu-item"
                        onClick={handleAccountClick}
                    >
                        Hesap Bilgileri
                    </button>
                    <button 
                        className="user-menu-item"
                        onClick={handleLogout}
                    >
                        Çıkış Yap
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserMenu; 