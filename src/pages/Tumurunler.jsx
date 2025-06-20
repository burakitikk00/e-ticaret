import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/style.css';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import ProductDetailModal from '../component/ProductDetailModal';
import { useCart } from '../context/CartContext';

function Tumurunler() {
    const location = useLocation();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { kategori } = useParams(); // URL'den kategori parametresini al
    // URL'den query parametresini al
    const params = new URLSearchParams(location.search);
    const queryKategori = params.get('kategori'); // örn: "Çantalar"
    
    // Öncelik sırası: 1. URL'den gelen kategori, 2. Query'den gelen kategori
    const kategoriParam = kategori || queryKategori;
    // Ürünler state'i - örnek verileri kaldırıp boş array ile başlat
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true); // Yükleme durumu için state
    const [error, setError] = useState(null); // Hata durumu için state
    // State'ler
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState([0, 2000]);
    const [sortOption, setSortOption] = useState('featured');
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    // Açılır menü state'leri
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
    const [priceMenuOpen, setPriceMenuOpen] = useState(false);

    // Modal için state'ler
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [modalProduct, setModalProduct] = useState(null);

    // Kategori state'i
    const [categories, setCategories] = useState([]);

    // Varyasyonlar için state'ler
    const [variations, setVariations] = useState([]);
    const [selectedVariations, setSelectedVariations] = useState({}); // { variationId: selectedOption }
    const [variationMenusOpen, setVariationMenusOpen] = useState({}); // { variationId: boolean }

    // Her ürünün varyasyon kombinasyonlarını tutacak state
    const [productVariations, setProductVariations] = useState({}); // { [productId]: [ { Varyasyon1, Options1, varyasyon2, Options2 } ] }

    // Ürünleri API'den çek
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                console.log('Ürünler yükleniyor... Kategori:', kategoriParam);
                
                // API endpoint'ini kategori parametresine göre ayarla
                const endpoint = kategoriParam 
                    ? `http://localhost:5000/api/products?kategori=${encodeURIComponent(kategoriParam)}`
                    : 'http://localhost:5000/api/products';
                
                const response = await axios.get(endpoint);
                console.log('API yanıtı:', response.data);
                
                if (response.data.success) {
                    // API'den gelen ürünleri dönüştür
                    // Sadece aktif ürünleri göster (Status true/1 olanlar)
                    const formattedProducts = response.data.products
                        .filter(product => product.Status === true || product.Status === 1) // Pasif ürünleri gizle
                        .map(product => {
                            console.log('İşlenen ürün:', product);
                            
                            // Opsiyonları parse et
                            const opsiyonlar = product.Opsiyonlar ? product.Opsiyonlar.split(', ') : [];
                            const opsiyonFiyatlari = product.OpsiyonFiyatlari ? product.OpsiyonFiyatlari.split(', ').map(Number) : [];
                            
                            return {
                                id: product.ProductID,
                                resim: product.ImageURL ? product.ImageURL : "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
                                baslik: product.ProductName,
                                fiyat: `${product.BasePrice} ${product.Currency}`,
                                aciklama: product.Description,
                                stok: product.Stock,
                                kargoTipi: product.ShippingType,
                                kargoUcreti: product.ShippingCost,
                                urunTipi: product.ProductType,
                                dil: product.Language,
                                indirimli: product.IsDiscounted,
                                opsiyonlar: opsiyonlar,
                                opsiyonFiyatlari: opsiyonFiyatlari,
                                CategoriesName: product.CategoriesName
                            };
                        });
                    console.log('Dönüştürülmüş ürünler:', formattedProducts);
                    setProducts(formattedProducts);

                    // Her ürün için varyasyon kombinasyonlarını çek
                    formattedProducts.forEach(async (product) => {
                        try {
                            const res = await axios.get(`http://localhost:5000/api/urunvaryasyonbilgi/${product.id}`);
                            setProductVariations(prev => ({
                                ...prev,
                                [product.id]: res.data // [{ Varyasyon1, Options1, varyasyon2, Options2 }]
                            }));
                        } catch (err) {
                            setProductVariations(prev => ({ ...prev, [product.id]: [] }));
                        }
                    });
                } else {
                    console.error('API başarısız yanıt:', response.data);
                    setError('Ürünler yüklenirken bir hata oluştu');
                }
            } catch (error) {
                console.error('Ürünler yüklenirken hata:', error);
                setError('Ürünler yüklenirken bir hata oluştu: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [kategoriParam]); // kategoriParam değiştiğinde ürünleri yeniden çek

    // Ürünler state'ini kontrol et
    useEffect(() => {
        console.log('Güncel ürünler state:', products);
    }, [products]);

    // Kategorileri veritabanından çekme
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/categories');
                if (response.data.success) {
                    setCategories(response.data.data);
                }
            } catch (error) {
                console.error('Kategoriler yüklenirken hata:', error);
            }
        };

        fetchCategories();
    }, []);

    // Varyasyonları API'den çekme
    useEffect(() => {
        const fetchVariations = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/variations');
                console.log('Varyasyonlar API yanıtı:', response.data);
                setVariations(response.data);
            } catch (error) {
                console.error('Varyasyonlar yüklenirken hata:', error);
                setVariations([]);
            }
        };

        fetchVariations();
    }, []);

    // Sıralama seçenekleri
    const sortOptions = [
        { value: 'price-asc', label: 'Fiyat artan' },
        { value: 'price-desc', label: 'Fiyat azalan' },
        { value: 'first', label: 'İlk Eklenen' },
        { value: 'last', label: 'Son Eklenen' },
    ];

    // Varyasyon menüsünü aç/kapat
    const toggleVariationMenu = (variationId) => {
        setVariationMenusOpen(prev => ({
            ...prev,
            [variationId]: !prev[variationId]
        }));
    };

    // Varyasyon seçeneği seç
    const handleVariationSelect = (variationId, option) => {
        setSelectedVariations(prev => ({
            ...prev,
            [variationId]: prev[variationId] === option ? '' : option
        }));
    };

    // Filtreleme fonksiyonu - tüm filtreleri uygula
    const filteredProducts = products.filter(product => {
        // URL'den gelen kategori filtresi
        const urlCategoryMatch = kategoriParam ? product.CategoriesName === kategoriParam : true;
        
        // Seçilen kategori filtresi
        const selectedCategoryMatch = selectedCategory ? product.CategoriesName === selectedCategory : true;
        
        // Fiyat filtresi
        const price = parseFloat(product.fiyat.split(' ')[0]);
        const priceMatch = price >= priceRange[0] && price <= priceRange[1];
        
        // Varyasyon filtreleri (yeni)
        const kombinasyonlar = productVariations[product.id] || [];
        // Eğer hiç varyasyon seçilmemişse, ürünü göster
        if (Object.values(selectedVariations).every(val => !val)) return true;
        // Seçili varyasyonlara uyan bir kombinasyon var mı?
        const match = kombinasyonlar.some(komb => {
            return Object.entries(selectedVariations).every(([variationId, selectedOption]) => {
                if (!selectedOption) return true;
                // Varyasyon adını bul
                const variation = variations.find(v => v.VariationID.toString() === variationId.toString());
                if (!variation) return true;
                // Kombinasyonda bu varyasyonun seçeneği var mı?
                // Varyasyon1 veya varyasyon2'ye bak
                if (komb.Varyasyon1 === variation.ad && komb.Options1 === selectedOption) return true;
                if (komb.varyasyon2 === variation.ad && komb.Options2 === selectedOption) return true;
                return false;
            });
        });
        return urlCategoryMatch && selectedCategoryMatch && priceMatch && match;
    });

    // Sıralama işlemi
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        const priceA = parseFloat(a.fiyat.split(' ')[0]);
        const priceB = parseFloat(b.fiyat.split(' ')[0]);
        
        switch (sortOption) {
            case 'price-asc':
                return priceA - priceB;
            case 'price-desc':
                return priceB - priceA;
            case 'first':
                return a.id - b.id;
            case 'last':
                return b.id - a.id;
            default: // 'featured'
                return 0; // Varsayılan sıralama
        }
    });

    console.log('Filtrelenmiş ve sıralanmış ürünler:', sortedProducts);

    // Ürün grid'ini render eden kısmı kontrol et
    console.log('Render öncesi filteredProducts:', filteredProducts);

    // Yükleme durumunda gösterilecek içerik
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ fontSize: '18px', color: '#666' }}>Ürünler yükleniyor...</div>
            </div>
        );
    }

    // Hata durumunda gösterilecek içerik
    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ fontSize: '18px', color: '#ff0000' }}>{error}</div>
            </div>
        );
    }

    return (
        <div style={{position:'relative'}}>
            {/* Product Detail Modalını çağır */}
            <ProductDetailModal
                product={modalProduct} // Gösterilecek ürün bilgisi
                isVisible={showDetailModal} // Modalın görünürlüğü
                onClose={() => setShowDetailModal(false)} // Modalı kapatma fonksiyonu
                onAddToCart={(itemToAdd) => {
                    console.log('Tüm Ürünler: Sepete eklenecek ürün:', itemToAdd);
                    if (itemToAdd && itemToAdd.product) {
                        addToCart(itemToAdd);
                        setShowDetailModal(false);
                        alert('Ürün sepete eklendi!');
                    } else {
                        console.error('Tüm Ürünler: Sepete eklenecek ürün bilgisi eksik veya hatalı.', itemToAdd);
                    }
                }} // Sepete ekleme fonksiyonu
                onViewProduct={(productId) => {
                    navigate(`/product/${productId}`); // Ürün detay sayfasına yönlendirme
                }} // Ürün detay sayfasına gitme fonksiyonu
            />

            <div style={{marginBottom: '24px'}}>
                <div style={{fontSize: '15px', color: '#444', marginBottom: '8px'}}>
                    ANASAYFA &gt; {(selectedCategory || kategoriParam) ? (selectedCategory || kategoriParam).toUpperCase() : "TÜM ÜRÜNLER"}
                </div>
                <h2 className="baslik" style={{textAlign:'center', fontWeight:'bold', fontSize:'48px'}}>
                    {(selectedCategory || kategoriParam) ? (selectedCategory || kategoriParam).toUpperCase() : "TÜM ÜRÜNLER"}
                </h2>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                <button onClick={() => setIsFilterOpen(true)} style={{fontWeight:'bold', fontSize:'18px', background:'none', border:'none', cursor:'pointer'}}>
                    FİLTRE {isFilterOpen ? '▲' : '▼'}
                </button>
                <div style={{position:'relative'}}>
                    <button onClick={() => setSortMenuOpen(!sortMenuOpen)} style={{fontWeight:'bold', fontSize:'18px', background:'none', border:'none', cursor:'pointer'}}>
                        Sırala {sortMenuOpen ? '▲' : '▼'}
                    </button>
                    {sortMenuOpen && (
                        <div style={{position:'absolute', right:0, top:'110%', background:'#fff', border:'1px solid #bbb', borderRadius:'14px', boxShadow:'0 2px 8px rgba(0,0,0,0.07)', minWidth:'200px', zIndex:1000}}>
                            {sortOptions.map(opt => (
                                <div key={opt.value} onClick={() => { setSortOption(opt.value); setSortMenuOpen(false); }} style={{padding:'10px 18px', cursor:'pointer'}}>
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* Sol taraftan açılan filtre paneli */}
            {isFilterOpen && (
                <div style={{
                    position:'fixed',
                    top:0,
                    left:0,
                    width:'320px',
                    height:'100vh',
                    background:'#fff',
                    boxShadow:'2px 0 12px rgba(0,0,0,0.1)',
                    zIndex:3000,
                    padding:'32px 24px',
                    transition:'left 0.3s'
                }}>
                    <button onClick={() => setIsFilterOpen(false)} style={{position:'absolute', top:12, right:12, fontSize:'22px', background:'none', border:'none', cursor:'pointer'}}>&times;</button>
                    <h3 style={{marginBottom:'24px'}}>Filtrele</h3>
                    {/* Fiyat Filtresi */}
                    <div style={{marginBottom:'20px'}}>
                        <button 
                            onClick={() => setPriceMenuOpen(!priceMenuOpen)}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '10px',
                                background: 'none',
                                border: 'none',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            Fiyat {priceMenuOpen ? '▲' : '▼'}
                        </button>
                        {priceMenuOpen && (
                            <div style={{padding: '10px'}}>
                                <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                                    <input 
                                        type="number" 
                                        value={priceRange[0]} 
                                        onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                                        style={{width:'100px', padding:'5px',borderRadius:'15px',textAlign:'center'}}/>
                                    <span>-</span>
                                    <input 
                                        type="number" 
                                        value={priceRange[1]} 
                                        onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                                        style={{width:'100px', padding:'5px',borderRadius:'15px',textAlign:'center'}}/>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Kategori Filtresi - Sadece tüm ürünler sayfasında göster */}
                    {!kategoriParam && (
                        <div style={{marginBottom:'20px'}}>
                            <button 
                                onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '10px',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                Kategori {categoryMenuOpen ? '▲' : '▼'}
                            </button>
                            {categoryMenuOpen && (
                                <div style={{padding: '10px'}}>
                                    {categories.map(category => (
                                        <div key={category.CategoryID} style={{marginBottom: '8px'}}>
                                            <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                <input 
                                                    type="radio" 
                                                    name="kategori" 
                                                    value={category.CategoriesName}
                                                    checked={selectedCategory === category.CategoriesName}
                                                    onChange={() => setSelectedCategory(category.CategoriesName)}
                                                />
                                                {category.CategoriesName}
                                            </label>
                                        </div>
                                    ))}
                                    <div>
                                        <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                            <input 
                                                type="radio" 
                                                name="kategori" 
                                                value=""
                                                checked={selectedCategory === ''}
                                                onChange={() => setSelectedCategory('')}
                                            />
                                            Tümü
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Dinamik Varyasyon Filtreleri */}
                    {variations.map(variation => (
                        <div key={variation.VariationID} style={{marginBottom:'20px'}}>
                            <button 
                                onClick={() => toggleVariationMenu(variation.VariationID)}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '10px',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                {variation.ad} {variationMenusOpen[variation.VariationID] ? '▲' : '▼'}
                            </button>
                            {variationMenusOpen[variation.VariationID] && (
                                <div style={{padding: '10px'}}>
                                    {variation.secenekler.map(option => (
                                        <div key={option} style={{marginBottom: '8px'}}>
                                            <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                <input 
                                                    type="radio" 
                                                    name={`variation-${variation.VariationID}`} 
                                                    value={option}
                                                    checked={selectedVariations[variation.VariationID] === option}
                                                    onChange={() => handleVariationSelect(variation.VariationID, option)}
                                                />
                                                {option}
                                            </label>
                                        </div>
                                    ))}
                                    <div>
                                        <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                            <input 
                                                type="radio" 
                                                name={`variation-${variation.VariationID}`} 
                                                value=""
                                                checked={selectedVariations[variation.VariationID] === ''}
                                                onChange={() => handleVariationSelect(variation.VariationID, '')}
                                            />
                                            Tümü
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {/* Ürün grid'i */}
            <div className="products-recommendation-wrapper">
                <div className="products-grid">
                    {Array.from({ length: Math.ceil(sortedProducts.length / 40) }).map((_, pageIndex) => (
                        <div key={pageIndex} className="products-page">
                            {sortedProducts.slice(pageIndex * 40, (pageIndex + 1) * 40).map((product, index) => (
                                <div key={product.id} className="product-card" style={{ width: '100%', margin: 0 }}>
                                    <div className="product-card-wrapper">
                                        <div className="product-card-image" style={{ cursor: 'pointer' }}>
                                            <img 
                                                src={product.resim.startsWith('http') ? product.resim : `http://localhost:5000${product.resim}`} 
                                                 alt={product.baslik} 
                                            />
                                            <div className="hover-detay">
                                                <button
                                                    type="submit"
                                                    className="sepete-ekle-btn"
                                                    onClick={e => { e.stopPropagation(); setModalProduct(product); setShowDetailModal(true); }}
                                                >
                                                    SEPETE EKLE
                                                </button>
                                                <div 
                                                    className="urun-incele" 
                                                    style={{ cursor: 'pointer' }} 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        // Ürün ID'si ile ProductDetail sayfasına yönlendirme
                                                        if (product && product.id) {
                                                            navigate(`/product/${product.id}`);
                                                        } else {
                                                            console.error('Ürün ID bulunamadı:', product);
                                                        }
                                                    }}
                                                >
                                                    <span>ÜRÜNÜ İNCELE</span>
                                                    <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M1 5.5H11M11 5.5L6 0.5M11 5.5L6 10.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="urun-bilgi">
                                            <a className="urun-baslik" href="#">{product.baslik}</a>
                                            <span className="urun-fiyat">{product.fiyat}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Tumurunler;