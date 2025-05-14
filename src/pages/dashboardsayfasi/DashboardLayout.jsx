import Sidebar from '../../component/dashboard/Sidebar';
import UrunListeleme from './UrunListeleme';
import '../../css/dashboard/DashboardLayout.css'; // Dashboard layout için özel CSS

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout-container">
      {/* Sidebar solda sabit */}
      <Sidebar />
      {/* Sağda içerik alanı */}
      <div className="dashboard-layout-content">
        <UrunListeleme />
      </div>
    </div>
  );
};

export default DashboardLayout;
// Açıklama: Tüm layout stilleri ayrı CSS dosyasına taşındı, component sadeleşti.