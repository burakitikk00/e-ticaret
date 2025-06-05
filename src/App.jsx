import { useState } from 'react'
import './App.css'
import Pagecontainer from './container/pagecontainer'
import Header from './component/Header'
import Footer from './component/Footer'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Tumurunler from './pages/Tumurunler'
import ProductDetail from './pages/ProductDetail'
import Account from './pages/Account'
import DashboardLayout from './pages/dashboardsayfasi/DashboardLayout'
import UrunListeleme from './pages/dashboardsayfasi/UrunListeleme'
import SatistakiUrunler from './pages/dashboardsayfasi/SatistakiUrunler'
import Siparisler from './pages/dashboardsayfasi/Siparisler'
import VaryasyonAyarlar from './pages/dashboardsayfasi/VaryasyonAyarlar'
import HesapGuvenligi from './pages/dashboardsayfasi/HesapGuvenligi'
import HesapOzeti from './pages/dashboardsayfasi/HesapOzeti'
import Login from './pages/Login'
import ProtectedRoute from './component/ProtectedRoute'
import { UserProvider } from './context/UserContext'
import { CartProvider } from './context/CartContext'

// SiteLayout: Header ve Footer'ı saran layout
const SiteLayout = ({ children }) => (
  <>
    <Header />
    <Pagecontainer>
      {children}
    </Pagecontainer>
    <Footer />
  </>
)

function App() {
  return (
    <CartProvider>
      <UserProvider>
        <Routes>
          {/* Ana site için layout */}
          <Route
            path="/*"
            element={
              <SiteLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  {/* Tüm ürünler sayfası - kategori parametresi ile */}
                  <Route path="/urunler" element={<Tumurunler />} />
                  <Route path="/urunler/:kategori" element={<Tumurunler />} />
                  {/* Eski kategori sayfalarına gelen istekleri tüm ürünler sayfasına yönlendir */}
                  <Route path="/Ayakkabilar" element={<Navigate to="/urunler?kategori=ayakkabılar" replace />} />
                  <Route path="/Canta" element={<Navigate to="/urunler?kategori=çantalar" replace />} />
                  <Route path="/Gozlukler" element={<Navigate to="/urunler?kategori=gözlükler" replace />} />
                  <Route path="/CuzdanKartlik" element={<Navigate to="/urunler?kategori=cüzdan-kartlık" replace />} />
                  <Route path="/Sallar" element={<Navigate to="/urunler?kategori=şallar" replace />} />
                  {/* Diğer sayfalar */}
                  <Route path="/ProductDetail/:id" element={<ProductDetail />} />
                  <Route path="/Account" element={<Account />} />
                  <Route path="/Siparisler" element={<Siparisler />} />
                  <Route path="/HesapOzeti" element={<HesapOzeti />} />
                </Routes>
              </SiteLayout>
            }
          />
          {/* Login sayfası */}
          <Route path="/login" element={<Login />} />
          {/* Dashboard için ayrı layout */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/urun-listeleme"  
            element={<UrunListeleme />}
          />
          <Route
            path="/satistaki-urunler"
            element={<SatistakiUrunler />}
          />
          <Route
            path="/siparisler"
            element={<Siparisler />}
          />
          <Route
            path="/varyasyon-ayarlar"
            element={<VaryasyonAyarlar />}
          />
          <Route
            path="/HesapGuvenligi"
            element={<HesapGuvenligi />}
          />
          <Route
            path="/HesapOzeti"
            element={<HesapOzeti />}
          />
        </Routes>
      </UserProvider>
    </CartProvider>
  )
}

export default App



