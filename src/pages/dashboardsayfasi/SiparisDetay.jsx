import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from '../../utils/axiosConfig'; // API'den veri çekmek için

// Sipariş detaylarını sekmeli gösterecek sayfa
const SiparisDetay = () => {
  const { siparisNo } = useParams(); // URL'den sipariş numarasını al
  const navigate = useNavigate();
  const [siparis, setSiparis] = useState(null); // Sipariş detay state'i
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Sekme state'i
  const [aktifSekme, setAktifSekme] = useState("GENEL");

  // Siparişi backend'den çek
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        // Tüm siparişleri çekip ilgili siparişi bul
        const res = await axiosInstance.get('/api/orders/all');
        if (res.data.success) {
          const found = res.data.orders.find(s => String(s.OrderID) === String(siparisNo));
          if (found) {
            setSiparis(found);
          } else {
            setError('Sipariş bulunamadı.');
          }
        } else {
          setError('Siparişler alınamadı.');
        }
      } catch (err) {
        setError('Sipariş alınırken hata oluştu.');
      }
      setLoading(false);
    };
    fetchOrder();
  }, [siparisNo]);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;
  if (!siparis) return <div>Sipariş bulunamadı.</div>;

  return (
    <div className="dashboard-siparis-detay-sayfa">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>#{siparis.OrderID}</h2>
        <div style={{ fontSize: 24, fontWeight: "bold" }}>{Number(siparis.TotalAmount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
      </div>
      {/* Sekmeler */}
      <div className="dashboard-siparis-sekmeler">
        {["GENEL", "SEPET", "ÖDEME"].map(sekme => (
          <button
            key={sekme}
            className={aktifSekme === sekme ? "aktif" : ""}
            onClick={() => setAktifSekme(sekme)}
          >
            {sekme}
          </button>
        ))}
      </div>
      <div className="dashboard-siparis-sekme-icerik">
        {aktifSekme === "GENEL" && (
          <div>
            <div><b>Durum:</b> {siparis.OrderStatus}</div>
            <div><b>Sipariş Tarihi:</b> {new Date(siparis.OrderDate).toLocaleString('tr-TR')}</div>
            <div><b>Müşteri:</b> {siparis.Eposta || '-'}</div>
            <div><b>Adres:</b> {siparis.AdresID || '-'}</div>
            <div><b>Telefon:</b> {siparis.Telefon || '-'}</div>
            <div><b>E-posta:</b> {siparis.Eposta || '-'}</div>
            <div><b>Müşteri Notu:</b> {siparis.CustomerNote || '-'}</div>
            <div><b>Kargo Bedeli:</b> {siparis.KargoBedeli ? Number(siparis.KargoBedeli).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '0 TL'}</div>
          </div>
        )}
        {aktifSekme === "SEPET" && (
          <div>
            {/* Siparişteki tüm ürünleri listele */}
            {siparis.items && siparis.items.length > 0 ? (
              siparis.items.map((item) => (
                <div key={item.OrderItemID} style={{display:'flex',alignItems:'center',gap:24,marginBottom:16}}>
                  {/* Ürün resmi */}
                  <img src={item.ImageURL || 'https://via.placeholder.com/80x80?text=YOK'} alt="Ürün" style={{width:80,height:80,borderRadius:12,objectFit:'cover',border:'1px solid #eee'}} />
                  {/* Ürün bilgileri */}
                  <div style={{flex:1}}>
                    <div style={{fontWeight:'bold',fontSize:18,marginBottom:4}}>{item.ProductName}</div>
                    <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:4}}>
                      <span>Birim Fiyat: <b>{Number(item.UnitPrice).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</b></span>
                      <span>Adet: <b>{item.Quantity}</b></span>
                      <span>Toplam: <b>{Number(item.UnitPrice * item.Quantity).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</b></span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div>Sepet boş.</div>
            )}
          </div>
        )}
        {aktifSekme === "ÖDEME" && (
          <div>
            {/* Ödeme yöntemi ve toplamlar */}
            <div><b>Ödeme Yöntemi:</b> {siparis.PaymentStatus || "Kredi Kartı"}</div>
            <div><b>Ara Toplam:</b> {Number(siparis.TotalAmount - (siparis.KargoBedeli || 0)).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
            <div><b>Kargo Bedeli:</b> {siparis.KargoBedeli ? Number(siparis.KargoBedeli).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '0 TL'}</div>
            <div style={{fontWeight:'bold',marginTop:8}}><b>Genel Toplam:</b> {Number(siparis.TotalAmount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
          </div>
        )}
      </div>
      <button onClick={() => navigate(-1)} style={{ marginTop: 24, background:'rgb(255, 0, 141)', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'6px', cursor:'pointer' }}>Geri Dön</button>
    </div>
  );
};

export default SiparisDetay; 