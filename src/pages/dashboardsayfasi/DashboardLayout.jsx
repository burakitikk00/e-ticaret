import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../component/dashboard/Sidebar';
import UrunListeleme from './UrunListeleme';
import SatistakiUrunler from './SatistakiUrunler';
import '../../css/dashboard/DashboardLayout.css'; // Dashboard layout için özel CSS
import Siparisler from './Siparisler';
import VaryasyonAyarlar from './VaryasyonAyarlar';
import HesapGuvenligi from './HesapGuvenligi';
import HesapOzeti from './HesapOzeti';
import SiparisDetay from './SiparisDetay';

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout-container">
      {/* Sidebar solda sabit */}
      <Sidebar />
      {/* Sağda içerik alanı */}
      <div className="dashboard-layout-content">
       <Routes>
        <Route path="/urun-listeleme" element={<UrunListeleme />} />
        <Route path="/satistaki-urunler" element={<SatistakiUrunler />} />
        <Route path="/siparisler" element={<Siparisler />} />
        <Route path="/siparisler/:siparisNo" element={<SiparisDetay />} />
        <Route path="/VaryasyonAyarlar" element={<VaryasyonAyarlar />} />
        <Route path="/HesapGuvenligi" element={<HesapGuvenligi />} />
        <Route path="/HesapOzeti" element={<HesapOzeti />} />
       </Routes>
      </div>
    </div>
  );
};

export default DashboardLayout;
