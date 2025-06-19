// Siparişlerim sayfası: Siparişlerin listesi ve durum çubuğu
import React from "react";
import axiosInstance from '../utils/axiosConfig'; // API istekleri için axiosInstance'ı ekle

// Sipariş durumu aşamaları
const STATUS_STEPS = [
  "Sipariş Alındı",
  "Kargoya Verildi", 
  "Yolda",
  "Teslim Edildi"
];

// Örnek sipariş verisi (Bunu ileride API'den çekebilirsin)
const orders = [
  {
    id: "ORD123456",
    date: "2024-06-01",
    status: "Yolda",
    total: 1250.99,
    items: [
      {
        id: 1,
        name: "Siyah Deri Ceket",
        image: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
        price: 899.99
      },
      {
        id: 2, 
        name: "Kot Pantolon",
        image: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
        price: 350.99
      },
      {
        id: 3, 
        name: "Kot Padntolon",
        image: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
        price: 350.99
      },
      {
        id: 4, 
        name: "Kot Padntolon",
        image: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
        price: 350.99
      },
      {
        id: 4, 
        name: "Kot Padntolon",
        image: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
        price: 350.99
      }, {
        id: 1,
        name: "Siyah Deri Ceket",
        image: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
        price: 899.99
      },
      {
        id: 2, 
        name: "Kot Pantolon",
        image: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
        price: 350.99
      },
      {
        id: 3, 
        name: "Kot Padntolon",
        image: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
        price: 350.99
      },
      {
        id: 4, 
        name: "Kot Padntolon",
        image: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
        price: 350.99
      }
      
    ]
  },
  {
    id: "ORD654321", 
    date: "2024-05-28",
    status: "Teslim Edildi",
    total: 450.50,
    items: [
      {
        id: 3,
        name: "Beyaz T-shirt",
        image: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
        price: 450.50
      }
    ]
  }
];

// Siparişin hangi aşamada olduğunu bulmak için yardımcı fonksiyon
const getStatusIndex = (status) => {
  // Eğer durum STATUS_STEPS içinde yoksa (örn: Hazırlanıyor), 0 döndür (ilk adım)
  const idx = STATUS_STEPS.indexOf(status);
  if (idx === -1) {
    // Özel durumlar için burada eşleştirme yapabilirsin
    if (status === "Hazırlanıyor") return 0; // Sadece ilk adım yeşil
    return -1;
  }
  return idx;
};

const Siparislerim = () => {
  // Ekran genişliğini takip etmek için state
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  // Modal için state'ler
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  // Siparişler için state
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  // Siparişleri backend'den çek
  React.useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get('/api/orders/my');
        if (res.data.success) {
          setOrders(res.data.orders);
        } else {
          setError('Siparişler alınamadı.');
        }
      } catch (err) {
        setError('Siparişler alınırken hata oluştu.');
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  // Ekran boyutu değiştiğinde windowWidth'i güncelle
  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modal'ı açma fonksiyonu
  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Modal'ı kapatma fonksiyonu
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="siparislerim-container">
      <h2>SİPARİŞLERİM</h2>
      {/* Yükleniyor veya hata mesajı */}
      {loading && <div>Yükleniyor...</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      {orders.map((order) => (
        <div key={order.OrderID} className="siparis-card" onClick={() => openModal(order)} style={{cursor: 'pointer'}}>
          <div style={{
            display: 'flex', 
            gap: '24px',
            flexDirection: windowWidth <= 768 ? 'column' : 'row'
          }}>
            {/* Sol taraf - Sipariş bilgileri ve ilerleme çubuğu */}
            <div style={{flex: 1}}>
              <div className="siparis-info">
                <strong>Sipariş ID:</strong> {order.OrderID} <br />
                <strong>Sipariş Tarihi:</strong> {new Date(order.OrderDate).toLocaleDateString('tr-TR')} <br />
                <strong>Durum:</strong> {order.OrderStatus}
              </div>
              
              {/* İlerleme çubuğu - sadece geniş ekranlarda göster */}
              {windowWidth > 768 && (
                <div className="progress-bar-wrapper">
                  <div className="progress-bar">
                    {STATUS_STEPS.map((step, idx) => {
                      // Siparişin mevcut aşamasına kadar olan adımlar yeşil olacak
                      const isActive = idx <= getStatusIndex(order.OrderStatus);
                      return (
                        <React.Fragment key={step}>
                          <div className="progress-step-container">
                            <div 
                              className={`progress-step ${isActive ? "active" : ""}`}
                              style={{
                                background: isActive ? '#4caf50' : '#ccc', // Aktifse yeşil, değilse gri
                                transition: 'background 0.3s'
                              }}
                            />
                            <span className="progress-label" style={{color: isActive ? '#388e3c' : '#888'}}>{step}</span>
                          </div>
                          {idx < STATUS_STEPS.length - 1 && (
                            <span 
                              className="progress-arrow"
                              style={{color: isActive ? '#4caf50' : '#ccc', fontWeight: 'bold', fontSize: 18}}
                            >
                              →
                            </span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sağ taraf - Ürün görselleri ve toplam fiyat */}
            <div style={{
              width: windowWidth <= 768 ? '100%' : '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: windowWidth <= 768 ? 'flex-start' : 'flex-end'
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '12px',
                position: 'relative',
                height: '60px',
                width: '100%'
              }}>
                {/* Sadece ilk 3 ürünü göster */}
                {order.items.slice(0, 3).map((item, index) => (
                  <img 
                    key={item.OrderItemID}
                    src={item.ImageURL}
                    alt={item.ProductName}
                    style={{
                      width: windowWidth <= 480 ? '40px' : '50px',
                      height: windowWidth <= 480 ? '40px' : '50px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      position: 'absolute',
                      left: `${index * (windowWidth <= 480 ? 15 : 20)}px`,
                      zIndex: 3 - index
                    }}
                  />
                ))}
                {/* 3'ten fazla ürün varsa badge göster */}
                {order.items.length > 3 && (
                  <div style={{
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    zIndex: 4,
                    transform: 'translate(-50%, -50%)'
                  }}>
                    +{order.items.length - 3}
                  </div>
                )}
              </div>
              <div style={{
                textAlign: windowWidth <= 768 ? 'left' : 'right',
                fontWeight: 'bold',
                fontSize: windowWidth <= 480 ? '14px' : '16px',
                color: '#222',
                width: '100%'
              }}>
                {order.TotalAmount.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY'
                })}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Sipariş Detay Modalı */}
      {isModalOpen && selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 3001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            minWidth: 340,
            maxWidth: 600,
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
            position: 'relative'
          }}>
            <button 
              onClick={closeModal} 
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                fontSize: 22,
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>
            <h2 style={{textAlign: 'center', marginBottom: 24}}>Sipariş Detayı</h2>
            <div style={{marginBottom: 20}}>
              <p><strong>Sipariş No:</strong> {selectedOrder.OrderID}</p>
              <p><strong>Sipariş Tarihi:</strong> {new Date(selectedOrder.OrderDate).toLocaleDateString('tr-TR')}</p>
              <p><strong>Durum:</strong> {selectedOrder.OrderStatus}</p>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 15, marginBottom: 20}}>
              {selectedOrder.items.map((item) => (
                <div key={item.OrderItemID} style={{
                  display: 'flex',
                  gap: 15,
                  padding: 15,
                  background: '#f9f9f9',
                  borderRadius: 8
                }}>
                  <img 
                    src={item.ImageURL} 
                    alt={item.ProductName} 
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 6
                    }}
                  />
                  <div style={{flex: 1}}>
                    <h4 style={{margin: '0 0 8px 0', fontSize: 16, color: '#333'}}>{item.ProductName}</h4>
                    <p style={{margin: '4px 0', fontSize: 14, color: '#666'}}>Adet: {item.Quantity}</p>
                    <p style={{margin: '4px 0', fontSize: 14, color: '#666'}}>
                      Fiyat: {item.UnitPrice.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 20,
              paddingTop: 15,
              borderTop: '1px solid #eee',
              textAlign: 'right',
              fontSize: 18,
              color: '#333',
              fontWeight: 'bold'
            }}>
              <strong>Toplam Tutar:</strong> {selectedOrder.TotalAmount.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY'
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Siparislerim;