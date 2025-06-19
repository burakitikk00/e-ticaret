const { createOrder, getOrderById, getOrdersByUserId, getAllOrders } = require('../models/Order');
const { addOrderItem, getOrderItemsByOrderId } = require('../models/OrderItem');

// Sipariş oluşturma controller'ı
// Tüm sipariş ve ürün bilgilerini alır, veritabanına kaydeder
exports.createOrderWithItems = async (req, res) => {
    try {
        // Sipariş ve ürün bilgilerini body'den al
        const { order, items } = req.body;
        // Önce siparişi kaydet
        const newOrder = await createOrder(order);
        // Sipariş ürünlerini kaydet
        const orderItems = [];
        for (const item of items) {
            const orderItem = await addOrderItem({ ...item, OrderID: newOrder.OrderID });
            orderItems.push(orderItem);
        }
        res.status(201).json({ success: true, order: newOrder, items: orderItems });
    } catch (err) {
        // Hata oluştuğunda hem konsola tam hatayı yaz, hem de response'a detaylı hata mesajı dön
        console.error('Sipariş oluşturma hatası:', err); // Konsola tam hata
        res.status(500).json({ success: false, error: err.message, detail: err }); // Hata detayını da dön
    }
};

// Kullanıcıya ait siparişleri getirir (ürünlerle birlikte)
exports.getOrdersByUser = async (req, res) => {
    try {
        // JWT'den gelen kullanıcı ID'si
        const userId = req.user.userId;
        const orders = await getOrdersByUserId(userId);
        // Her siparişin ürünlerini getir
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const items = await getOrderItemsByOrderId(order.OrderID);
                return {
                    ...order,
                    items
                };
            })
        );
        res.status(200).json({ success: true, orders: ordersWithItems });
    } catch (err) {
        console.error('Siparişleri getirme hatası:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Admin için: Tüm siparişleri ve ürünlerini getirir
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await getAllOrders();
        // Her siparişin ürünlerini getir
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const items = await getOrderItemsByOrderId(order.OrderID);
                return {
                    ...order,
                    items
                };
            })
        );
        res.status(200).json({ success: true, orders: ordersWithItems });
    } catch (err) {
        console.error('Tüm siparişleri getirme hatası:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Sipariş durumunu güncelle (örn: Teslim Edildi)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        if (!orderId || !status) {
            return res.status(400).json({ success: false, error: 'Eksik parametre' });
        }
        const updated = await require('../models/Order').updateOrderStatus(orderId, status);
        if (updated) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Sipariş bulunamadı' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}; 