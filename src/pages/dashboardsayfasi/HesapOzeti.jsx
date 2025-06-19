import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Select, Table } from "antd";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import moment from "moment";
import axiosInstance from '../../utils/axiosConfig'; // Backend istekleri için axiosInstance ekle

// Tarih filtre seçenekleri
const dateOptions = [
  { label: "Son 7 Gün", value: "last7days" },
  { label: "Geçen Hafta", value: "lastweek" },
  { label: "Son 30 Gün", value: "last30days" },
  { label: "Geçen Ay", value: "lastmonth" },
];

// Örnek satış verileri ve örnek en çok satan ürünler kaldırıldı

const HesapOzeti = () => {
  // Seçili tarih filtresi (grafik için)
  const [selectedRange, setSelectedRange] = useState("last7days");

  // Dinamik veriler için state'ler
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    openOrders: 0,
    last30DaysSales: 0,
    last30DaysRefunds: 0,
    chartData: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(false);

  // Tarih aralığına göre backend'den verileri çek
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Tüm siparişleri çek (istatistikler için)
        const allOrdersRes = await axiosInstance.get('/api/orders/all');
        const allOrders = allOrdersRes.data.orders || [];
        // 2. Son 30 gün siparişlerini çek
        const endDate = moment().endOf('day').toISOString();
        const startDate = moment().subtract(29, 'days').startOf('day').toISOString();
        const last30Res = await axiosInstance.get('/api/orders/by-date', {
          params: { startDate, endDate }
        });
        const last30Orders = last30Res.data.orders || [];
        // 3. En çok satan ürünleri çek (son 30 gün için)
        const topProductsRes = await axiosInstance.get('/api/orders/top-products', {
          params: { startDate, endDate, limit: 5 }
        });
        const topProducts = (topProductsRes.data.products || []).map(p => ({ name: p.ProductName, count: p.count }));
        // 4. Grafik verisi için seçili aralığa göre siparişleri çek
        let chartStart, chartEnd, chartStep, chartFormat;
        if (selectedRange === 'last7days' || selectedRange === 'lastweek') {
          chartStart = moment().subtract(6, 'days').startOf('day');
          chartEnd = moment().endOf('day');
          chartStep = 'days';
          chartFormat = 'DD MMM';
        } else if (selectedRange === 'last30days' || selectedRange === 'lastmonth') {
          chartStart = moment().subtract(29, 'days').startOf('day');
          chartEnd = moment().endOf('day');
          chartStep = 'days';
          chartFormat = 'DD MMM';
        } else {
          chartStart = moment().subtract(11, 'months').startOf('month');
          chartEnd = moment().endOf('month');
          chartStep = 'months';
          chartFormat = 'MMM YYYY';
        }
        const chartRes = await axiosInstance.get('/api/orders/by-date', {
          params: { startDate: chartStart.toISOString(), endDate: chartEnd.toISOString() }
        });
        const chartOrders = chartRes.data.orders || [];
        // 5. Toplam satış ve sipariş hesapla
        const totalSales = allOrders.reduce((acc, cur) => acc + Number(cur.TotalAmount || 0), 0);
        const totalOrders = allOrders.length;
        // 6. Açık sipariş sayısı (OrderStatus "Hazırlanıyor", "Kargoda", "Onaylandı" gibi olanlar)
        const openOrders = allOrders.filter(o => ["Hazırlanıyor", "Kargoda", "Onaylandı"].includes(o.OrderStatus)).length;
        // 7. Son 30 gün satış ve iade tutarı
        const last30DaysSales = last30Orders.filter(o => o.OrderStatus !== "İade Edildi").reduce((acc, cur) => acc + Number(cur.TotalAmount || 0), 0);
        const last30DaysRefunds = last30Orders.filter(o => o.OrderStatus === "İade Edildi").reduce((acc, cur) => acc + Number(cur.TotalAmount || 0), 0);
        // 8. Grafik datası oluştur
        let chartData = [];
        if (chartStep === 'days') {
          for (let i = 0; i <= chartEnd.diff(chartStart, 'days'); i++) {
            const day = moment(chartStart).add(i, 'days');
            const dayOrders = chartOrders.filter(o => moment(o.OrderDate).isSame(day, 'day'));
            chartData.push({ date: day.format(chartFormat), sales: dayOrders.reduce((acc, cur) => acc + Number(cur.TotalAmount || 0), 0) });
          }
        } else {
          for (let i = 0; i <= chartEnd.diff(chartStart, 'months'); i++) {
            const month = moment(chartStart).add(i, 'months');
            const monthOrders = chartOrders.filter(o => moment(o.OrderDate).isSame(month, 'month'));
            chartData.push({ date: month.format(chartFormat), sales: monthOrders.reduce((acc, cur) => acc + Number(cur.TotalAmount || 0), 0) });
          }
        }
        setSummary({
          totalSales,
          totalOrders,
          openOrders,
          last30DaysSales,
          last30DaysRefunds,
          chartData,
          topProducts,
        });
      } catch (err) {
        // Hata olursa sıfırla
        setSummary({
          totalSales: 0,
          totalOrders: 0,
          openOrders: 0,
          last30DaysSales: 0,
          last30DaysRefunds: 0,
          chartData: [],
          topProducts: [],
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedRange]);

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16}>
        {/* Toplam Satış */}
        <Col span={6}>
          <Card>
            <Statistic title="Bugüne Kadarki Toplam Satış" value={summary.totalSales} suffix="TL" />
          </Card>
        </Col>
        {/* Toplam Sipariş */}
        <Col span={6}>
          <Card>
            <Statistic title="Toplam Sipariş" value={summary.totalOrders} />
          </Card>
        </Col>
        {/* Açık Sipariş */}
        <Col span={6}>
          <Card>
            <Statistic title="Açık Sipariş" value={summary.openOrders} />
          </Card>
        </Col>
        {/* Son 30 Gün Satış ve İade */}
        <Col span={6}>
          <Card>
            <Statistic title="Son 30 Gün Satış" value={summary.last30DaysSales} suffix="TL" />
            <Statistic title="Son 30 Gün İade" value={summary.last30DaysRefunds} suffix="TL" valueStyle={{ color: "red" }} />
          </Card>
        </Col>
      </Row>

      {/* Tarih aralığı seçici ve grafik alanı */}
      <Card style={{ marginTop: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h3>Satış Hacmi</h3>
          </Col>
          <Col>
            <Select
              options={dateOptions}
              value={selectedRange}
              onChange={setSelectedRange}
              style={{ width: 180 }}
            />
          </Col>
        </Row>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={summary.chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#1890ff" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* En çok satan ürünler tablosu */}
      <Card style={{ marginTop: 24 }}>
        <h3>En Çok Satan Ürünler</h3>
        <Table
          dataSource={summary.topProducts}
          columns={[
            { title: "Ürün Adı", dataIndex: "name", key: "name" },
            { title: "Satış Adedi", dataIndex: "count", key: "count" },
          ]}
          pagination={false}
          rowKey="name"
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default HesapOzeti;