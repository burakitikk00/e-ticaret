import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { initialSiparisler } from "./Siparisler";

// Sipariş detaylarını sekmeli gösterecek sayfa
const SiparisDetay = () => {
  const { siparisNo } = useParams(); // URL'den sipariş numarasını al
  const navigate = useNavigate();
  // Siparişi bul
  const siparis = initialSiparisler.find(s => s.no === siparisNo);
  // Sekme state'i
  const [aktifSekme, setAktifSekme] = useState("GENEL");

  if (!siparis) {
    return <div>Sipariş bulunamadı.</div>;
  }

  return (
    <div className="dashboard-siparis-detay-sayfa">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>#{siparis.no}</h2>
        <div style={{ fontSize: 24, fontWeight: "bold" }}>{siparis.tutar}</div>
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
            <div><b>Durum:</b> {siparis.durum}</div>
            <div><b>Sipariş Tarihi:</b> {siparis.tarih}</div>
            <div><b>Müşteri:</b> {siparis.musteri}</div>
            <div><b>Adres:</b> {siparis.adres}</div>
            <div><b>Telefon:</b> {siparis.telefon}</div>
            <div><b>E-posta:</b> {siparis.email}</div>
            <div><b>Müşteri Notu:</b> {siparis.musteriNotu}</div>
          </div>
        )}
        {aktifSekme === "SEPET" && (
          <div style={{display:'flex',alignItems:'center',gap:24}}>
            {/* Ürün resmi */}
            <img src={siparis.resim || 'https://via.placeholder.com/80x80?text=YOK'} alt="Ürün" style={{width:80,height:80,borderRadius:12,objectFit:'cover',border:'1px solid #eee'}} />
            {/* Ürün bilgileri */}
            <div style={{flex:1}}>
              <div style={{fontWeight:'bold',fontSize:18,marginBottom:4}}>{siparis.urun}</div>
              <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:4}}>
                <span>Birim Fiyat: <b>{siparis.birimFiyat || siparis.tutar}</b></span>
                <span>Adet: <b>{siparis.adet || 1}</b></span>
                <span>Toplam: <b>{siparis.toplamFiyat || siparis.tutar}</b></span>
              </div>
              {/* Opsiyon ve kombinasyon bilgisi */}
              {siparis.opsiyon && (
                <div style={{marginBottom:2}}>
                  <span>Seçilen Opsiyon: <b>{siparis.opsiyon}</b></span>
                </div>
              )}
              {siparis.kombinasyon && (
                <div>
                  <span>Kombinasyon: <b>{siparis.kombinasyon}</b></span>
                </div>
              )}
            </div>
          </div>
        )}
        {aktifSekme === "ÖDEME" && (
          <div>
            {/* Ödeme yöntemi */}
            <div><b>Ödeme Yöntemi:</b> {siparis.odemeYontemi || "Kredi Kartı"}</div>
            {/* Ara toplam */}
            <div><b>Ara Toplam:</b> {siparis.araToplam || siparis.toplamFiyat || siparis.tutar}</div>
            {/* Kargo bedeli */}
            <div><b>Kargo Bedeli:</b> {siparis.kargoBedeli || "0 TL"}</div>
            {/* Genel toplam */}
            <div style={{fontWeight:'bold',marginTop:8}}><b>Genel Toplam:</b> {siparis.genelToplam || siparis.tutar}</div>
          </div>
        )}
      </div>
      <button onClick={() => navigate(-1)} style={{ marginTop: 24 }}>Geri Dön</button>
    </div>
  );
};

export default SiparisDetay; 