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
    const login = async (email, password) => {
        try {
            // BACKEND ENTEGRASYSONU:
            // 1. API_URL + '/auth/login' endpoint'ine POST isteği atılacak
            // 2. Token yönetimi eklenecek
            // 3. Hata durumları detaylandırılacak
            // 4. Rate limiting eklenecek
            // 5. Güvenlik önlemleri artırılacak

            // Geçici test kontrolü
            const testUser = TEST_USERS.find(u => u.email === email && u.password === password);
            
            if (testUser) {
                const userData = {
                    id: testUser.id,
                    email: testUser.email,
                    name: testUser.name,
                    phone: testUser.phone,
                    address: testUser.address
                };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true };
            } else {
                return { success: false, error: 'E-posta veya şifre hatalı' };
            }
        } catch (error) {
            // BACKEND ENTEGRASYSONU:
            // 1. API hata kodlarına göre özel mesajlar eklenecek
            // 2. Network hataları için özel yönetim eklenecek
            return { success: false, error: 'Giriş yapılırken bir hata oluştu' };
        }
    };

    // Kayıt işlemi
    const register = async (email, password, name) => {
        try {
            // BACKEND ENTEGRASYSONU:
            // 1. API_URL + '/auth/register' endpoint'ine POST isteği atılacak
            // 2. Email doğrulama sistemi eklenecek
            // 3. Şifre politikası kontrolü eklenecek
            // 4. Kullanıcı adı benzersizlik kontrolü eklenecek
            // 5. Captcha veya benzeri güvenlik önlemleri eklenecek

            // Geçici test kontrolü
            if (TEST_USERS.some(u => u.email === email)) {
                return { success: false, error: 'Bu e-posta adresi zaten kayıtlı' };
            }

            // Test için başarılı kayıt simülasyonu
            return { success: true };
        } catch (error) {
            // BACKEND ENTEGRASYSONU:
            // 1. API hata kodlarına göre özel mesajlar eklenecek
            // 2. Validation hataları için özel yönetim eklenecek
            return { success: false, error: 'Kayıt olurken bir hata oluştu' };
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