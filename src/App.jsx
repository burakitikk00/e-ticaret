import { useState } from 'react'
import './App.css'
import Pagecontainer from './container/pagecontainer'
import Header from './component/Header'
import Footer from './component/Footer'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Tumurunler from './pages/Tumurunler'
import Ayakkabilar from './pages/Ayakkabilar'
import Gozlukler from './pages/Gozlukler'
import CuzdanKartlik from './pages/CuzdanKartlik'
import ProductDetail from './pages/ProductDetail'
import Canta from './pages/Canta'
import Sallar from './pages/Sallar'
import Account from './pages/Account'
import DashboardLayout from './pages/dashboardsayfasi/DashboardLayout'
import UrunListeleme from './pages/dashboardsayfasi/UrunListeleme'

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
    <Routes>
      {/* Ana site için layout */}
      <Route
        path="/*"
        element={
          <SiteLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Tum_urunler" element={<Tumurunler />} />
              <Route path="/Ayakkabilar" element={<Ayakkabilar />} />
              <Route path="/Gozlukler" element={<Gozlukler />} />
              <Route path="/Canta" element={<Canta />} />
              <Route path="/Sallar" element={<Sallar />} />
              <Route path="/CuzdanKartlik" element={<CuzdanKartlik />} />
              <Route path="/ProductDetail" element={<ProductDetail />} />
              <Route path="/Tumurunler" element={<Tumurunler />} />
              <Route path="/Account" element={<Account />} />
            </Routes>
          </SiteLayout>
        }
      />
      {/* Dashboard için ayrı layout */}
      <Route
        path="/dashboard/*"
        element={<DashboardLayout />}
      />
      <Route 
        path="/urun-listeleme"  
        element={<UrunListeleme />}
      />
    </Routes>
  )
}

export default App



