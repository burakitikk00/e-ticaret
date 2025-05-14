import React, { useState } from 'react';
import '../css/style.css';

function Gozlukler() {
    // Ürünler state'i
    const [products, setProducts] = useState([
        {
            id: 1,
            resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            baslik: "Örnek Ürün Adı 1",
            fiyat: "₺999.90"
        },
        {
            id: 2,
            resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            baslik: "Örnek Ürün Adı 2",
            fiyat: "₺899.90"
        },
        {
            id: 3,
            resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            baslik: "Örnek Ürün Adı 3",
            fiyat: "₺799.90"
        },
        {
            id: 4,
            resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            baslik: "Örnek Ürün Adı 4",
            fiyat: "₺699.90"
        },
        {
            id: 5,
            resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            baslik: "Örnek Ürün Adı 5",
            fiyat: "₺599.90"
        },
        {
            id: 6,
            resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            baslik: "Örnek Ürün Adı 6",
            fiyat: "₺499.90"
        },
        {
            id: 7,
            resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            baslik: "Örnek Ürün Adı 7",
            fiyat: "₺499.90"
        },
        {
            id: 8,
            resim: "https://cdn.myikas.com/images/50e891e0-a788-4e78-acf2-35fa6377d32b/6c923911-9175-4b63-871a-c8cf0d0b0b20/10/13.webp",
            baslik: "Örnek Ürün Adı 8",
            fiyat: "₺499.90"
        }
    ]);
    // Filtre panelinin açık/kapalı olma durumu
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    // Filtre state'leri
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedLens, setSelectedLens] = useState('');
    const [priceRange, setPriceRange] = useState([0, 2000]);
    // Sıralama state'i
    const [sortOption, setSortOption] = useState('featured');
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    // Sayfa state'i
    const [currentPage, setCurrentPage] = useState(1);

    // Marka, renk ve cam tipi örnekleri
    const brands = ['Prada', 'Rayban', 'Gucci', 'Versace'];
    const colors = ['Siyah', 'Kahverengi', 'Gri', 'Mavi'];
    const lensTypes = ['Polarize', 'UV', 'Aynalı', 'Şeffaf'];

    // Sıralama seçenekleri
    const sortOptions = [
        { value: 'featured', label: 'Öne çıkan' },
        { value: 'price-asc', label: 'Fiyat artan' },
        { value: 'price-desc', label: 'Fiyat azalan' },
        { value: 'first', label: 'İlk Eklenen' },
        { value: 'last', label: 'Son Eklenen' },
    ];

    // Filtrelenmiş ve sıralanmış ürünler
    const filteredProducts = products.filter(product => {
        // Marka filtresi
        const brandMatch = selectedBrand ? product.marka === selectedBrand : true;
        // Renk filtresi
        const colorMatch = selectedColor ? product.renk === selectedColor : true;
        // Cam tipi filtresi
        const lensMatch = selectedLens ? product.camTipi === selectedLens : true;
        // Fiyat filtresi
        const price = parseFloat(product.fiyat.replace('₺', '').replace(',', '.'));
        const priceMatch = price >= priceRange[0] && price <= priceRange[1];
        return brandMatch && colorMatch && lensMatch && priceMatch;
    }).sort((a, b) => {
        if (sortOption === 'price-asc') {
            return parseFloat(a.fiyat.replace('₺', '').replace(',', '.')) - parseFloat(b.fiyat.replace('₺', '').replace(',', '.'));
        } else if (sortOption === 'price-desc') {
            return parseFloat(b.fiyat.replace('₺', '').replace(',', '.')) - parseFloat(a.fiyat.replace('₺', '').replace(',', '.'));
        } else {
            return 0;
        }
    });

    return (
        <div style={{position:'relative'}}>
            {/* Üstte breadcrumb ve başlık */}
            <div style={{marginBottom: '24px'}}>
                <div style={{fontSize: '15px', color: '#444', marginBottom: '8px'}}>ANASAYFA &gt; GÖZLÜK</div>
                <h2 className="baslik" style={{textAlign:'center', fontWeight:'bold', fontSize:'48px'}}>GÖZLÜK MODELLERİ</h2>
            </div>
            {/* Sıralama ve filtre butonları */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                <button onClick={() => setIsFilterOpen(true)} style={{fontWeight:'bold', fontSize:'18px', background:'none', border:'none', cursor:'pointer'}}>FİLTRE &#9660;</button>
                {/* Sıralama özel menüsü */}
                <div style={{position:'relative'}}>
                    <button
                        onClick={() => setSortMenuOpen(!sortMenuOpen)}
                        style={{fontWeight:'bold', fontSize:'18px', background:'none', border:'none', cursor:'pointer'}}
                    >
                        Sırala &#9660;
                    </button>
                    {sortMenuOpen && (
                        <div style={{position:'absolute', right:0, top:'110%', background:'#fff', border:'1px solid #bbb', borderRadius:'14px', boxShadow:'0 2px 8px rgba(0,0,0,0.07)', minWidth:'200px', zIndex:1000, padding:'8px 0'}}>
                            {sortOptions.map(opt => (
                                <div
                                    key={opt.value}
                                    onClick={() => { setSortOption(opt.value); setSortMenuOpen(false); }}
                                    style={{
                                        padding:'10px 18px',
                                        cursor:'pointer',
                                        fontWeight: sortOption === opt.value ? 'bold' : 'normal',
                                        color: sortOption === opt.value ? '#0a0a0a' : '#222',
                                        background: sortOption === opt.value ? '#f5f5f5' : 'transparent',
                                        borderBottom: '1px solid #eee',
                                        textDecoration: opt.value === 'last' ? 'underline' : 'none',
                                        borderRadius: opt.value === 'featured' ? '14px 14px 0 0' : opt.value === 'last' ? '0 0 14px 14px' : '0'
                                    }}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* Soldan açılan filtre paneli */}
            {isFilterOpen && (
                <div style={{position:'fixed', top:0, left:0, width:'320px', height:'100vh', background:'#fff', boxShadow:'2px 0 12px rgba(0,0,0,0.1)', zIndex:3000, padding:'32px 24px', transition:'left 0.3s'}}>
                    <button onClick={() => setIsFilterOpen(false)} style={{position:'absolute', top:12, right:12, fontSize:'22px', background:'none', border:'none', cursor:'pointer'}}>&times;</button>
                    <h3 style={{marginBottom:'18px'}}>Filtrele</h3>
                    {/* Fiyat filtresi */}
                    <div style={{marginBottom:'18px'}}>
                        <label style={{fontWeight:'bold'}}>Fiyat Aralığı</label>
                        <div style={{display:'flex', gap:'8px', marginTop:'8px'}}>
                            <input type="number" value={priceRange[0]} min={0} max={priceRange[1]} onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])} style={{width:'60px'}} />
                            <span>-</span>
                            <input type="number" value={priceRange[1]} min={priceRange[0]} max={20000} onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])} style={{width:'60px'}} />
                        </div>
                    </div>
                    {/* Marka filtresi */}
                    <div style={{marginBottom:'18px'}}>
                        <label style={{fontWeight:'bold'}}>Marka</label>
                        <div style={{marginTop:'8px'}}>
                            {brands.map(brand => (
                                <div key={brand}>
                                    <input type="radio" id={brand} name="marka" value={brand} checked={selectedBrand === brand} onChange={() => setSelectedBrand(brand)} />
                                    <label htmlFor={brand} style={{marginLeft:'6px'}}>{brand}</label>
                                </div>
                            ))}
                            <div>
                                <input type="radio" id="tumMarka" name="marka" value="" checked={selectedBrand === ''} onChange={() => setSelectedBrand('')} />
                                <label htmlFor="tumMarka" style={{marginLeft:'6px'}}>Tümü</label>
                            </div>
                        </div>
                    </div>
                    {/* Renk filtresi */}
                    <div style={{marginBottom:'18px'}}>
                        <label style={{fontWeight:'bold'}}>Renk</label>
                        <div style={{marginTop:'8px'}}>
                            {colors.map(color => (
                                <div key={color}>
                                    <input type="radio" id={color} name="renk" value={color} checked={selectedColor === color} onChange={() => setSelectedColor(color)} />
                                    <label htmlFor={color} style={{marginLeft:'6px'}}>{color}</label>
                                </div>
                            ))}
                            <div>
                                <input type="radio" id="tumRenk" name="renk" value="" checked={selectedColor === ''} onChange={() => setSelectedColor('')} />
                                <label htmlFor="tumRenk" style={{marginLeft:'6px'}}>Tümü</label>
                            </div>
                        </div>
                    </div>
                    {/* Cam tipi filtresi */}
                    <div style={{marginBottom:'18px'}}>
                        <label style={{fontWeight:'bold'}}>Cam Tipi</label>
                        <div style={{marginTop:'8px'}}>
                            {lensTypes.map(lens => (
                                <div key={lens}>
                                    <input type="radio" id={lens} name="camtipi" value={lens} checked={selectedLens === lens} onChange={() => setSelectedLens(lens)} />
                                    <label htmlFor={lens} style={{marginLeft:'6px'}}>{lens}</label>
                                </div>
                            ))}
                            <div>
                                <input type="radio" id="tumLens" name="camtipi" value="" checked={selectedLens === ''} onChange={() => setSelectedLens('')} />
                                <label htmlFor="tumLens" style={{marginLeft:'6px'}}>Tümü</label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Ürün grid'i */}
            <div className="products-recommendation-wrapper">
                <div className="products-grid">
                    {Array.from({ length: Math.ceil(filteredProducts.length / 21) }).map((_, pageIndex) => (
                        <div key={pageIndex} className="products-page" style={{ display: currentPage === pageIndex + 1 ? 'grid' : 'none', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                            {filteredProducts.slice(pageIndex * 21, (pageIndex + 1) * 21).map((product, index) => (
                                <div key={index} className="product-card">
                                    <div className="product-card-wrapper">
                                        <div className="product-card-image">
                                            <img src={product.resim} alt={product.baslik} />
                                            <div className="hover-detay">
                                                <button type="submit" className="sepete-ekle-btn">SEPETE EKLE</button>
                                                <div className="urun-incele">
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

export default Gozlukler;