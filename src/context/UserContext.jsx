import React, { createContext, useState, useContext, useEffect } from 'react';

// Context oluşturma
const UserContext = createContext();

// BACKEND ENTEGRASYSONU İÇİN NOTLAR:
// 1. API_URL değişkeni oluşturulacak (örn: const API_URL = 'http://localhost:3001/api')
// 2. Token yönetimi için interceptor eklenecek
// 3. API isteklerinde hata yönetimi geliştirilecek
// 4. Refresh token mekanizması eklenecek
// 5. Şifre hashleme ve güvenlik önlemleri eklenecek

// Geçici test verileri
const TEST_USERS = [
    {
        id: 1,
        email: 'test@test.com',
        password: '123456', // Gerçek uygulamada şifreler hash'lenmiş olacak
        name: 'Test Kullanıcı',
        phone: '5551234567',
        address: 'Test Adres'
    }
];

// Context Provider bileşeni
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sayfa yenilendiğinde localStorage'dan kullanıcı bilgilerini kontrol et
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Giriş işlemi
    const login = async (loginData) => {
        try {
            console.log('Login API çağrısı yapılıyor...', { 
                loginType: loginData.loginType,
                email: loginData.email,
                username: loginData.username 
            });
            
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: loginData.email,
                    username: loginData.username,
                    password: loginData.password,
                    loginType: loginData.loginType
                })
            });

            const data = await response.json();
            console.log('Login API yanıtı:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Giriş işlemi başarısız oldu');
            }

            if (data.success && data.token && data.user) {
                // Kullanıcı bilgilerini ve token'ı kaydet
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                return { success: true, token: data.token, user: data.user };
            } else {
                throw new Error('Geçersiz API yanıtı');
            }
        } catch (error) {
            console.error('Login API hatası:', error);
            return {
                success: false,
                error: error.message || 'Giriş yapılırken bir hata oluştu'
            };
        }
    };

    // Kayıt işlemi
    const register = async (email, password, username) => {
        try {
            console.log('Register API çağrısı yapılıyor...', { email, username });
            
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, username })
            });

            const data = await response.json();
            console.log('Register API yanıtı:', data);

            if (!response.ok) {
                // Kullanıcı adı veya email zaten kullanımda hatası için özel mesaj
                if (data.message?.includes('kullanımda')) {
                    throw new Error(data.message);
                }
                throw new Error(data.message || 'Kayıt işlemi başarısız oldu');
            }

            return data;
        } catch (error) {
            console.error('Register API hatası:', error);
            return {
                success: false,
                message: error.message || 'Kayıt olurken bir hata oluştu'
            };
        }
    };

    // Çıkış işlemi
    const logout = () => {
        // BACKEND ENTEGRASYSONU:
        // 1. API_URL + '/auth/logout' endpoint'ine POST isteği atılacak
        // 2. Token blacklist'e eklenecek
        // 3. Tüm oturumlar sonlandırılacak
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // Backend entegrasyonunda eklenecek
    };

    // Kullanıcı bilgilerini güncelleme
    const updateUserInfo = async (userData) => {
        try {
            // BACKEND ENTEGRASYSONU:
            // 1. API_URL + '/users/:id' endpoint'ine PUT isteği atılacak
            // 2. Token kontrolü eklenecek
            // 3. Validation kontrolleri eklenecek
            // 4. Dosya yükleme desteği eklenecek (profil fotoğrafı vb.)
            // 5. Audit log eklenecek

            // Geçici test güncelleme
            if (user) {
                const updatedUser = { ...user, ...userData };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                return { success: true };
            }
            return { success: false, error: 'Kullanıcı bulunamadı' };
        } catch (error) {
            // BACKEND ENTEGRASYSONU:
            // 1. API hata kodlarına göre özel mesajlar eklenecek
            // 2. Validation hataları için özel yönetim eklenecek
            return { success: false, error: 'Bilgiler güncellenirken bir hata oluştu' };
        }
    };

    // Şifre değiştirme (Backend entegrasyonunda eklenecek)
    const changePassword = async (currentPassword, newPassword) => {
        // BACKEND ENTEGRASYSONU:
        // 1. API_URL + '/users/:id/password' endpoint'ine PUT isteği atılacak
        // 2. Mevcut şifre kontrolü eklenecek
        // 3. Şifre politikası kontrolü eklenecek
        // 4. Güvenlik logları eklenecek
        return { success: true }; // Geçici test yanıtı
    };

    return (
        <UserContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            updateUserInfo,
            changePassword // Backend entegrasyonunda aktif edilecek
        }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}; 