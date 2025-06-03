import axios from 'axios';

// Axios instance oluştur
const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000', // Backend sunucu adresi
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - her istekte token'ı ekle
axiosInstance.interceptors.request.use(
    (config) => {
        // LocalStorage'dan token'ı al
        const token = localStorage.getItem('token');
        
        // Token varsa header'a ekle
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - hata durumlarını yönet
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token geçersiz veya süresi dolmuş
            localStorage.removeItem('token');
            window.location.href = '/login'; // Login sayfasına yönlendir
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 