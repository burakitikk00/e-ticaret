import React, { useState } from "react";
import { Card, Row, Col, Statistic, Select, Table } from "antd";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import moment from "moment";

// Tarih filtre seçenekleri
const dateOptions = [
  { label: "Son 7 Gün", value: "last7days" },
  { label: "Geçen Hafta", value: "lastweek" },
  { label: "Son 30 Gün", value: "last30days" },
  { label: "Geçen Ay", value: "lastmonth" },
];

// Örnek satış verileri (grafik için)
const salesData = {
  last7days: [
    { date: "13 May", sales: 3200 },
    { date: "14 May", sales: 4100 },
    { date: "15 May", sales: 3800 },
    { date: "16 May", sales: 2900 },
    { date: "17 May", sales: 4500 },
    { date: "18 May", sales: 4700 },
    { date: "19 May", sales: 3900 },
  ],
  lastweek: [
    { date: "6 May", sales: 2100 },
    { date: "7 May", sales: 2500 },
    { date: "8 May", sales: 3000 },
    { date: "9 May", sales: 3400 },
    { date: "10 May", sales: 4100 },
    { date: "11 May", sales: 3700 },
    { date: "12 May", sales: 3200 },
  ],
  last30days: Array.from({ length: 30 }, (_, i) => ({
    date: moment().subtract(29 - i, 'days').format('DD MMM'),
    sales: Math.floor(Math.random() * 5000) + 2000,
  })),
  lastmonth: Array.from({ length: 30 }, (_, i) => ({
    date: moment().subtract(29 - i, 'days').format('DD MMM'),
    sales: Math.floor(Math.random() * 5000) + 2000,
  })),
  last12months: Array.from({ length: 12 }, (_, i) => ({
    date: moment().subtract(11 - i, 'months').format('MMM YYYY'),
    sales: Math.floor(Math.random() * 100000) + 20000,
  })),
};

// En çok satan ürünler (örnek veri)    
const topProducts = [
  { name: "Mini vakko", count: 154 },
  { name: "Speddy...", count: 68 },
  { name: "Mini vakko", count: 33 },
  { name: "Speddy...", count: 25 },
  { name: "Mini vakko", count: 22 },
];

const HesapOzeti = () => {
  // Seçili tarih filtresi (grafik için)
  const [selectedRange, setSelectedRange] = useState("last7days");

  // Grafik verisini seçili aralığa göre alıyoruz
  const chartData = salesData[selectedRange];

  // Son 30 gün satış ve iade örnek verisi
  const last30DaysSales = salesData.last30days.reduce((acc, cur) => acc + cur.sales, 0); // Son 30 gün toplam satış
  const last30DaysRefunds = 7074.94; // Son 30 gün iade tutarı (örnek)

  // Toplam ve açık sipariş örnek verisi
  const totalOrders = 374;
  const openOrders = 2;

  // Toplam satış örnek verisi
  const totalSales = 363731.01; // TL

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16}>
        {/* Toplam Satış */}
        <Col span={6}>
          <Card>
            <Statistic title="Bugüne Kadarki Toplam Satış" value={totalSales} suffix="TL" />
          </Card>
        </Col>
        {/* Toplam Sipariş */}
        <Col span={6}>
          <Card>
            <Statistic title="Toplam Sipariş" value={totalOrders} />
          </Card>
        </Col>
        {/* Açık Sipariş */}
        <Col span={6}>
          <Card>
            <Statistic title="Açık Sipariş" value={openOrders} />
          </Card>
        </Col>
        {/* Son 30 Gün Satış ve İade */}
        <Col span={6}>
          <Card>
            <Statistic title="Son 30 Gün Satış" value={last30DaysSales} suffix="TL" />
            <Statistic title="Son 30 Gün İade" value={last30DaysRefunds} suffix="TL" valueStyle={{ color: "red" }} />
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
          <LineChart data={chartData}>
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
          dataSource={topProducts}
          columns={[
            { title: "Ürün Adı", dataIndex: "name", key: "name" },
            { title: "Satış Adedi", dataIndex: "count", key: "count" },
          ]}
          pagination={false}
          rowKey="name"
        />
      </Card>
    </div>
  );
};

export default HesapOzeti;