import React, { useState } from 'react';
import '../../css/Sidebar.css' // Stil dosyasını ayrıca oluşturacağız
import { FaHome, FaBoxOpen, FaTags, FaStore, FaUser, FaChevronDown, FaChevronRight, FaCogs, FaImage, FaThList, FaBoxes, FaTruck, FaPercent, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

// Menüde kullanılacak başlıklar ve alt menüler
const menu = [
  {
    title: 'Hesap Özeti',
    icon: <FaHome />, // Ana sayfa ikonu
  },
  {
    title: 'Ürünler',
    icon: <FaTags />, // Etiket ikonu
    subMenu: [
      { title: 'Ürün Listeleme', path: '/urun-listeleme' }, // Ürün listeleme sayfasına yönlendirme için path eklendi
      { title: 'Satıştaki Ürünler' }, 
    ],
  },
  {
    title: 'Siparişler',
    icon: <FaBoxOpen />, // Kutu ikonu
  },
  {
    title: 'İndirimler', // Yeni eklenen indirimler menüsü
    icon: <FaPercent />, // Yüzde ikonu
    subMenu: [
      { title: 'Aktif İndirimler' },
      { title: 'İndirim Kuponları' },
    ],
  },
  {
    title: 'Dükkan Yönetimi',
    icon: <FaStore />, // Mağaza ikonu
    subMenu: [
      { title: 'Dükkan Seçenekleri', icon: <FaCogs /> },
      { title: 'Logo & Banner', icon: <FaImage /> },
      { title: 'Kategori Ayarları', icon: <FaThList /> },
      { title: 'Varyasyon Ayarları', icon: <FaBoxes /> },
      { title: 'Kargo Ayarları', icon: <FaTruck /> },
    ],
  },
  {
    title: 'Hesap Yönetimi',
    icon: <FaUser />, // Kullanıcı ikonu
    subMenu: [
      { title: 'Hesap Bilgileri' },
      { title: 'Hesap Güvenliği' },
    ],
  },
];

const Sidebar = () => {
  // Açık olan menüleri tutmak için state
  const [openMenus, setOpenMenus] = useState({});
  // Mobilde sidebar açma/kapatma için state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Menüye tıklanınca alt menüyü aç/kapat
  const handleMenuClick = (index) => {
    setOpenMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Çıkış butonuna tıklanınca çalışacak fonksiyon (şimdilik alert)
  const handleLogout = () => {
    alert('Çıkış yapıldı!');
    // Buraya gerçek çıkış işlemini ekleyebilirsin
  };

  return (
    <>
      {/* Hamburger butonu sadece mobilde görünür */}
      <button
        className="sidebar-hamburger"
        onClick={() => setDrawerOpen(true)}
        aria-label="Menüyü Aç"
      >
        <FaBars size={24} />
      </button>
      {/* Sidebar kutusu */}
      <div className={`sidebarDashboard${drawerOpen ? ' open' : ''}`}>
        {/* Kapatma butonu sadece mobilde görünür */}
        <button
          className="sidebar-close"
          onClick={() => setDrawerOpen(false)}
          aria-label="Menüyü Kapat"
        >
          <FaTimes size={24} />
        </button>
        {/* Shopier logosu ve çıkış butonu */}
        <div className="sidebar-logo-row">
          <span style={{ color: 'rgb(255 0 141)', fontWeight: 'bold', fontSize: 28 }}>Lina Butik</span>
          <button className="sidebar-logout-btn" onClick={handleLogout} title="Çıkış Yap">
            <FaSignOutAlt size={20} />
          </button>
        </div>
        <ul className="sidebar-menu">
          {menu.map((item, idx) => (
            <li key={item.title}>
              <div
                className={`sidebar-menu-item${item.subMenu ? ' has-sub' : ''}`}
                onClick={() => item.subMenu && handleMenuClick(idx)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-title">{item.title}</span>
                {/* Alt menü varsa ok ikonu */}
                {item.subMenu && (
                  <span className="sidebar-chevron">
                    {openMenus[idx] ? <FaChevronDown /> : <FaChevronRight />}
                  </span>
                )}
              </div>
              {/* Alt menü */}
              {item.subMenu && openMenus[idx] && (
                <ul className="sidebar-submenu">
                  {item.subMenu.map((sub, subIdx) => (
                    <li key={sub.title} className="sidebar-submenu-item">
                      {/* Alt menüde ikon varsa göster */}
                      {sub.icon && <span className="sidebar-icon">{sub.icon}</span>}
                      <span className="sidebar-title">{sub.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Arka plan karartma */}
      {drawerOpen && <div className="sidebar-backdrop" onClick={() => setDrawerOpen(false)} />}
    </>
  );
};

export default Sidebar;
// Açıklama: Logonun olduğu üst kısma, en sağda konumlanan bir çıkış butonu eklendi. Butona tıklanınca şimdilik alert çalışıyor, gerçek çıkış işlemi eklenebilir. 