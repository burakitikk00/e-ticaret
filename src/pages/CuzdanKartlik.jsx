import React, { useState } from 'react';
import '../css/style.css';

function CuzdanKartlik() {
    // Ürünler state'i
    const [products, setProducts] = useState([
        // ... ürünler ...
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
    // State'ler
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedMaterial, setSelectedMaterial] = useState('');
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [sortOption, setSortOption] = useState('featured');
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    // Açılır menü state'leri
    const [typeMenuOpen, setTypeMenuOpen] = useState(false);
    const [colorMenuOpen, setColorMenuOpen] = useState(false);
    const [materialMenuOpen, setMaterialMenuOpen] = useState(false);
    const [priceMenuOpen, setPriceMenuOpen] = useState(false);

    // Tip, renk ve materyal örnekleri
    const types = ['Kartlık', 'Cüzdan'];
    const colors = ['Siyah', 'Kahverengi', 'Bej', 'Beyaz', 'Mavi'];
    const materials = ['Deri', 'Suni Deri', 'Kanvas', 'Naylon'];

    // Sıralama seçenekleri
    const sortOptions = [
        { value: 'featured', label: 'Öne çıkan' },
        { value: 'price-asc', label: 'Fiyat artan' },
        { value: 'price-desc', label: 'Fiyat azalan' },
        { value: 'first', label: 'İlk Eklenen' },
        { value: 'last', label: 'Son Eklenen' },
    ];

    // Filtreleme fonksiyonu
    const filteredProducts = products.filter(product => {
        const typeMatch = selectedType ? product.tip === selectedType : true;
        const colorMatch = selectedColor ? product.renk === selectedColor : true;
        const materialMatch = selectedMaterial ? product.materyal === selectedMaterial : true;
        const price = parseFloat(product.fiyat.replace('₺', '').replace(',', '.'));
        const priceMatch = price >= priceRange[0] && price <= priceRange[1];
        return typeMatch && colorMatch && materialMatch && priceMatch;
    }).sort((a, b) => {
        if (sortOption === 'price-asc') {
            return parseFloat(a.fiyat.replace('₺', '').replace(',', '.')) - parseFloat(b.fiyat.replace('₺', '').replace(',', '.'));
        } else if (sortOption === 'price-desc') {
            return parseFloat(b.fiyat.replace('₺', '').replace(',', '.')) - parseFloat(a.fiyat.replace('₺', '').replace(',', '.'));
        }
        return 0;
    });

    return (
        <div style={{position:'relative'}}>
            <div style={{marginBottom: '24px'}}>
                <div style={{fontSize: '15px', color: '#444', marginBottom: '8px'}}>ANASAYFA &gt; CÜZDAN & KARTLIK</div>
                <h2 className="baslik" style={{textAlign:'center', fontWeight:'bold', fontSize:'48px'}}>CÜZDAN & KARTLIK</h2>
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
                                        style={{width:'100px', padding:'5px'}}/>
                                    <span>-</span>
                                    <input 
                                        type="number" 
                                        value={priceRange[1]} 
                                        onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                                        style={{width:'100px', padding:'5px'}}/>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Tip Filtresi */}
                    <div style={{marginBottom:'20px'}}>
                        <button 
                            onClick={() => setTypeMenuOpen(!typeMenuOpen)}
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
                            Tip {typeMenuOpen ? '▲' : '▼'}
                        </button>
                        {typeMenuOpen && (
                            <div style={{padding: '10px'}}>
                                {types.map(type => (
                                    <div key={type} style={{marginBottom: '8px'}}>
                                        <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                            <input 
                                                type="radio" 
                                                name="tip" 
                                                value={type}
                                                checked={selectedType === type}
                                                onChange={() => setSelectedType(type)}
                                            />
                                            {type}
                                        </label>
                                    </div>
                                ))}
                                <div>
                                    <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <input 
                                            type="radio" 
                                            name="tip" 
                                            value=""
                                            checked={selectedType === ''}
                                            onChange={() => setSelectedType('')}
                                        />
                                        Tümü
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Renk Filtresi */}
                    <div style={{marginBottom:'20px'}}>
                        <button 
                            onClick={() => setColorMenuOpen(!colorMenuOpen)}
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
                            Renk {colorMenuOpen ? '▲' : '▼'}
                        </button>
                        {colorMenuOpen && (
                            <div style={{padding: '10px'}}>
                                {colors.map(color => (
                                    <div key={color} style={{marginBottom: '8px'}}>
                                        <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                            <input 
                                                type="radio" 
                                                name="renk" 
                                                value={color}
                                                checked={selectedColor === color}
                                                onChange={() => setSelectedColor(color)}
                                            />
                                            {color}
                                        </label>
                                    </div>
                                ))}
                                <div>
                                    <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <input 
                                            type="radio" 
                                            name="renk" 
                                            value=""
                                            checked={selectedColor === ''}
                                            onChange={() => setSelectedColor('')}
                                        />
                                        Tümü
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Materyal Filtresi */}
                    <div style={{marginBottom:'20px'}}>
                        <button 
                            onClick={() => setMaterialMenuOpen(!materialMenuOpen)}
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
                            Materyal {materialMenuOpen ? '▲' : '▼'}
                        </button>
                        {materialMenuOpen && (
                            <div style={{padding: '10px'}}>
                                {materials.map(mat => (
                                    <div key={mat} style={{marginBottom: '8px'}}>
                                        <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                            <input 
                                                type="radio" 
                                                name="materyal" 
                                                value={mat}
                                                checked={selectedMaterial === mat}
                                                onChange={() => setSelectedMaterial(mat)}
                                            />
                                            {mat}
                                        </label>
                                    </div>
                                ))}
                                <div>
                                    <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <input 
                                            type="radio" 
                                            name="materyal" 
                                            value=""
                                            checked={selectedMaterial === ''}
                                            onChange={() => setSelectedMaterial('')}
                                        />
                                        Tümü
                                    </label>
                                </div>
                            </div>
                        )}
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

export default CuzdanKartlik;