import { useState } from 'react'
import './App.css'
import Pagecontainer from './container/pagecontainer'
import Header from './component/header'

import Yenigelenler from './component/yenigelenler'
import Ikilikesfet from "./component/Ikilikesfet";
import Cantalar from "./component/Cantalar";
import Ikilikesfet1 from './component/Ikilikesfet1'
import Footer from './component/Footer'
import Marque from './component/Marque'
import Slider from 'react-slick'
import CokSatilan from './component/CokSatilan'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'
import Tumurunler from './pages/Tumurunler'
import Ayakkabilar from './pages/Ayakkabilar'
import Gozlukler from './pages/Gozlukler'
import CuzdanKartlik from './pages/CuzdanKartlik'
import ProductDetail from './pages/ProductDetail'
function App() {

  return (
    <>
      <div>
        <Header />
        <Pagecontainer>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/Tum_urunler' element={<Tumurunler />} />
            <Route path='/Ayakkabilar' element={<Ayakkabilar />} />
            <Route path='/Gozlukler' element={<Gozlukler />} />
            <Route path='/CuzdanKartlik' element={<CuzdanKartlik />} />
            <Route path='/ProductDetail' element={<ProductDetail />} />
          </Routes>
        </Pagecontainer>
        <Footer />



      </div>




    </>
  )
}

export default App
