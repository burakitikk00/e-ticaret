import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const userData = JSON.parse(user);
      setIsAuthenticated(userData.userType === 'admin');
    } catch (error) {
      console.error('User data parse error:', error);
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) {
    return null; // Yükleniyor durumu
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 