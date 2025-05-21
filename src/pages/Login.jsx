import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sayfa yüklendiğinde authentication kontrolü yap
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        try {
          const userData = JSON.parse(user);
          if (userData.userType === 'admin') {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
          }
        } catch (error) {
          console.error('User data parse error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    };

    checkAuth();
  }, [navigate, location]);

  // Giriş işlemini kontrol eden fonksiyon
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          password // Şifreyi düz metin olarak gönder
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Token'ı localStorage'a kaydet
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Yönlendirme
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(data.message || 'Giriş başarısız!');
      }
    } catch (err) {
      setError('Sunucu bağlantı hatası!');
      console.error('Giriş hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-page" className="login-container">
      <div className="login-box">
        <h2>Dashboard Girişi</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Kullanıcı Adı:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Şifre:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 