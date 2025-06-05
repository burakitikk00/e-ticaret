import React, { createContext, useContext, useState, useEffect } from 'react';

// Context oluşturma
const CartContext = createContext();

// Cart Provider bileşeni
export const CartProvider = ({ children }) => {
    // localStorage'dan sepet verilerini al veya boş array olarak başlat
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Sepet değiştiğinde localStorage'ı güncelle
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Helper fonksiyon: Ürün ve varyasyonlara göre benzersiz anahtar oluşturur
    const createCartItemKey = (item) => {
        const productId = item.product?.id || item.product?.ProductID;
        const v1 = item.selectedVaryasyon1 || '';
        const v2 = item.selectedVaryasyon2 || '';
        return `${productId}-${v1}-${v2}`;
    };

    // Sepete ürün ekleme fonksiyonu
    const addToCart = (itemToAdd, quantity = 1) => {
        console.log('addToCart fonksiyonu çağrıldı. Gelen veri:', itemToAdd);
        setCartItems(prevItems => {
            console.log('Mevcut sepet öğeleri (prevItems):', prevItems);

            // Gelen objenin product özelliğine sahip olup olmadığını ve geçerli bir ID'sinin (id veya ProductID) olup olmadığını kontrol et
            const productIdentifier = itemToAdd.product?.id || itemToAdd.product?.ProductID;
            if (!itemToAdd || !itemToAdd.product || !productIdentifier) {
                 console.error('addToCart HATA: Sepete eklenecek ürün bilgisi eksik veya hatalı.', itemToAdd);
                return prevItems; // Geçersiz ürün bilgisi varsa state'i değiştirmeden çık
            }

            // Gelen ürün için benzersiz anahtar oluştur
            const newItemKey = createCartItemKey(itemToAdd);
            console.log('Yeni ürün anahtarı (newItemKey):', newItemKey);

            // Sepette aynı anahtara sahip ürünü ara
            const existingItemIndex = prevItems.findIndex(cartItem => createCartItemKey(cartItem) === newItemKey);
            console.log('Sepette eşleşen ürün indexi (existingItemIndex):', existingItemIndex);

            if (existingItemIndex > -1) {
                // Ürün sepette varsa miktarını güncelle
                const newItems = [...prevItems]; // Mevcut array'in kopyasını oluştur
                newItems[existingItemIndex] = { // Güncellenen item için yeni obje oluştur
                    ...newItems[existingItemIndex],
                    quantity: (newItems[existingItemIndex].quantity || 0) + quantity // quantity undefined ise 0 kabul et
                };
                console.log('addToCart BAŞARILI: Ürün miktarı güncellendi:', newItems[existingItemIndex]);
                return newItems; // Yeni array'i döndür
            } else {
                // Ürün sepette yoksa yeni ürünü ekle
                const newItem = { ...itemToAdd, quantity: quantity || 1, key: newItemKey }; // Yeni item objesi oluştur ve key ekle
                console.log('addToCart BAŞARILI: Yeni ürün sepete eklendi:', newItem);
                return [...prevItems, newItem]; // Mevcut array'e yeni item ekleyip yeni array döndür
            }
        });
    };

    // Sepetten ürün çıkarma fonksiyonu
    // Artık ürün ID yerine benzersiz anahtarı alacak
    const removeFromCart = (itemKeyToRemove) => {
        console.log('removeFromCart çağrıldı. Silinecek anahtar:', itemKeyToRemove);
        setCartItems(prevItems => {
            const newItems = prevItems.filter(cartItem => createCartItemKey(cartItem) !== itemKeyToRemove);
            console.log('removeFromCart BAŞARILI. Yeni sepet:', newItems);
            return newItems;
        });
    };

    // Ürün miktarını güncelleme fonksiyonu
    // Artık ürün ID yerine benzersiz anahtarı ve yeni miktarı alacak
    const updateQuantity = (itemKeyToUpdate, newQuantity) => {
        console.log('updateQuantity çağrıldı. Güncellenecek anahtar:', itemKeyToUpdate, 'Yeni miktar:', newQuantity);
        if (newQuantity < 1) {
            // Miktar 1'den az ise ürünü sil
            removeFromCart(itemKeyToUpdate);
            return;
        }

        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(cartItem => createCartItemKey(cartItem) === itemKeyToUpdate);

            if (existingItemIndex > -1) {
                const newItems = [...prevItems]; // Mevcut array'in kopyasını oluştur
                newItems[existingItemIndex] = { // Güncellenen item için yeni obje oluştur
                    ...newItems[existingItemIndex],
                    quantity: newQuantity
                };
                console.log('updateQuantity BAŞARILI. Güncellenen öğe:', newItems[existingItemIndex]);
                return newItems; // Yeni array'i döndür
            } else {
                console.error('updateQuantity HATA: Güncellenecek ürün sepette bulunamadı.', itemKeyToUpdate);
                return prevItems; // Ürün bulunamazsa state'i değiştirmeden çık
            }
        });
    };

    // Sepetteki toplam ürün sayısını hesaplama (Bu fonksiyon zaten miktarları topluyor, değişmedi)
    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + (item.quantity || 0), 0); // quantity undefined olabilir
    };

    // Sepetteki toplam tutarı hesaplama
    const getTotalPrice = () => {
        console.log('getTotalPrice çağrıldı. Sepet öğeleri:', cartItems);
        return cartItems.reduce((total, item) => {
            // Ürün bilgisine item.product üzerinden erişiyoruz
            const productData = item.product; 
            
            // productData veya fiyat bilgisi yoksa bu öğeyi atla (veya fiyatı 0 kabul et)
            if (!productData || (!productData.fiyat && productData.BasePrice === undefined)) {
                 console.warn('getTotalPrice UYARI: Fiyat bilgisi eksik olan ürün:', item);
                return total; // veya return total + 0;
            }

            // Fiyatı al (tercihen fiyat, yoksa BasePrice)
            const priceValue = productData.fiyat !== undefined ? productData.fiyat : productData.BasePrice; // undefined kontrolü eklendi
            
            // Fiyat string'den sayıya çevirme işlemini güvenli hale getiriyoruz
            let price = 0;
            try {
                if (typeof priceValue === 'string') {
                    // ₺ işaretini, noktaları kaldır, virgülü noktaya çevir
                    price = parseFloat(priceValue.replace('₺', '').replace(/\./g, '').replace(',', '.'));
                } else if (typeof priceValue === 'number') {
                    price = priceValue;
                }
            } catch (error) {
                console.error('getTotalPrice HATA: Fiyat dönüştürme hatası:', error, 'Fiyat değeri:', priceValue);
                price = 0;
            }
            
            // Eğer price NaN ise 0 olarak kabul et
            if (isNaN(price)) {
                 console.warn('getTotalPrice UYARI: Dönüştürme sonrası fiyat NaN çıktı:', priceValue);
                price = 0;
            }
            
            // Item miktarını da güveli al (undefined olabilir)
            const quantity = item.quantity || 0;

            console.log(`Ürün ID: ${productData.id || productData.ProductID}, Fiyat: ${price}, Miktar: ${quantity}, Toplam katkı: ${price * quantity}`);

            return total + (price * quantity);
        }, 0);
    };

    // Sepeti temizleme fonksiyonu (Değişmedi)
    const clearCart = () => {
        console.log('clearCart çağrıldı.');
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            getTotalItems,
            getTotalPrice,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart hook must be used within a CartProvider');
    }
    return context;
}; 