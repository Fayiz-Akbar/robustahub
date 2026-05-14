import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const SemuaKopi = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // State untuk Filter & Sort
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('terbaru');
  const [selectedCategories, setSelectedCategories] = useState({
    ROBUSTA: true,
    ARABIKA: true,
    HOUSE_BLEND: true
  });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // State Pagination (12 item per halaman = 3 kolom x 4 baris)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const result = await response.json();
        // Hanya ambil kopi yang isActive (tidak disembunyikan petani)
        setProducts(result.data.filter(p => p.isActive !== false));
      }
    } catch (error) {
      console.error("Gagal mengambil produk:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handler Filter Kategori
  const handleCategoryChange = (cat) => {
    setSelectedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    setCurrentPage(1); // Reset ke halaman 1 tiap filter berubah
  };

  // LOGIKA FILTER & SORTING
  let filteredProducts = products.filter(product => {
    // Filter Kategori
    if (!selectedCategories[product.category]) return false;
    
    // Filter Pencarian Nama
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Filter Harga Minimum
    if (priceRange.min && product.price < parseInt(priceRange.min)) return false;
    
    // Filter Harga Maksimum
    if (priceRange.max && product.price > parseInt(priceRange.max)) return false;

    return true;
  });

  // Sorting
  if (sortBy === 'terbaru') {
    filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === 'termurah') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'termahal') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  // LOGIKA PAGINATION
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleAddToCart = (e, product) => {
    e.preventDefault(); // Mencegah pindah halaman saat klik keranjang
    alert(`Fitur tambah ke keranjang untuk ${product.name} akan segera hadir!`);
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-[#1A1D20]">
      <Navbar />

      <main className="max-w-[1300px] mx-auto px-[5%] py-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[14px] text-[#6C757D] mb-6">
          <Link to="/katalog" className="hover:text-[#A86431] transition-colors no-underline text-inherit">Beranda</Link>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
          <span className="text-[#1A1D20] font-semibold">Semua Kopi</span>
        </div>

        {/* Page Header & Sort */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-[28px] font-bold m-0 text-[#3A2210]">
            {searchQuery ? `Hasil pencarian: "${searchQuery}"` : 'Jelajahi Semua Kopi'}
          </h1>
          <div className="flex items-center gap-3 font-semibold text-[14px]">
            Urutkan:
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border border-[#EFEFEF] rounded-lg outline-none cursor-pointer bg-white"
            >
              <option value="terbaru">Terbaru</option>
              <option value="termurah">Harga Terendah</option>
              <option value="termahal">Harga Tertinggi</option>
            </select>
          </div>
        </div>

        {/* Tombol Filter Mobile */}
        <button 
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden w-full bg-white border border-[#EFEFEF] p-3 rounded-lg font-semibold flex items-center justify-center gap-2 mb-6 cursor-pointer"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          Filter Produk
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 items-start">
          
          {/* SIDEBAR FILTER */}
          <aside className={`bg-white rounded-2xl border border-[#EFEFEF] p-6 lg:sticky lg:top-[100px] 
            ${isMobileFilterOpen ? 'fixed inset-0 z-[200] rounded-none overflow-y-auto block' : 'hidden lg:block'}`}>
            
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-[#EFEFEF] font-bold text-[16px]">
              Filter Pencarian
              <button 
                onClick={() => {
                  setSelectedCategories({ ROBUSTA: true, ARABIKA: true, HOUSE_BLEND: true });
                  setPriceRange({ min: '', max: '' });
                  setSearchQuery('');
                  navigate('/semua-kopi'); // hapus query di URL
                }} 
                className="text-[13px] text-[#A86431] bg-transparent border-none cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Filter Kategori */}
            <div className="mb-6">
              <div className="text-[14px] font-bold text-[#1A1D20] mb-3">Kategori Kopi</div>
              <label className="flex items-center gap-2.5 text-[14px] text-[#6C757D] mb-2.5 cursor-pointer">
                <input type="checkbox" checked={selectedCategories.ROBUSTA} onChange={() => handleCategoryChange('ROBUSTA')} className="accent-[#A86431] w-4 h-4 cursor-pointer" /> Robusta
              </label>
              <label className="flex items-center gap-2.5 text-[14px] text-[#6C757D] mb-2.5 cursor-pointer">
                <input type="checkbox" checked={selectedCategories.ARABIKA} onChange={() => handleCategoryChange('ARABIKA')} className="accent-[#A86431] w-4 h-4 cursor-pointer" /> Arabika
              </label>
              <label className="flex items-center gap-2.5 text-[14px] text-[#6C757D] mb-2.5 cursor-pointer">
                <input type="checkbox" checked={selectedCategories.HOUSE_BLEND} onChange={() => handleCategoryChange('HOUSE_BLEND')} className="accent-[#A86431] w-4 h-4 cursor-pointer" /> House Blend
              </label>
            </div>

            {/* Filter Harga */}
            <div className="mb-6">
              <div className="text-[14px] font-bold text-[#1A1D20] mb-3">Rentang Harga (Per Kg)</div>
              <div className="flex items-center gap-2">
                <input type="number" value={priceRange.min} onChange={(e) => {setPriceRange({...priceRange, min: e.target.value}); setCurrentPage(1);}} placeholder="Min Rp" className="w-full p-2 border border-[#EFEFEF] rounded-lg text-[13px] outline-none focus:border-[#A86431]" />
                <span className="text-[#6C757D]">-</span>
                <input type="number" value={priceRange.max} onChange={(e) => {setPriceRange({...priceRange, max: e.target.value}); setCurrentPage(1);}} placeholder="Max Rp" className="w-full p-2 border border-[#EFEFEF] rounded-lg text-[13px] outline-none focus:border-[#A86431]" />
              </div>
            </div>

            <button onClick={() => setIsMobileFilterOpen(false)} className="lg:hidden w-full bg-[#3A2210] text-white p-3 rounded-lg font-bold mt-4">
              Terapkan Filter
            </button>
          </aside>

          {/* MAIN CATALOG */}
          <div>
            {isLoading ? (
              <div className="text-center py-20 text-[#A86431] font-bold">Memuat produk kopi...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-[#EFEFEF]">
                <h3 className="text-lg font-bold text-[#1A1D20]">Kopi tidak ditemukan</h3>
                <p className="text-[#6C757D]">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
              </div>
            ) : (
              <>
                {/* 3 KOLOM DI LAYAR LEBAR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProducts.map((product) => {
                    let finalImageUrl = "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=400&q=80";
                    if (product.imageUrl) {
                      try {
                        const parsedImage = JSON.parse(product.imageUrl);
                        finalImageUrl = Array.isArray(parsedImage) ? `http://localhost:5000${parsedImage[0]}` : `http://localhost:5000${product.imageUrl}`;
                      } catch (e) { finalImageUrl = `http://localhost:5000${product.imageUrl}`; }
                    }

                    return (
                      <Link to={`/produk/${product.id}`} key={product.id} className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col no-underline text-inherit group">
                        <div className="h-[200px] overflow-hidden relative">
                          <img src={finalImageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=400&q=80'}/>
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-[#3A2210] text-[11px] font-bold px-2 py-1 rounded-md uppercase">
                            {product.category}
                          </div>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <div className="text-[12px] text-[#A86431] font-bold mb-2 flex items-center gap-1">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                            {product.petani?.name || 'Petani Lokal'}
                          </div>
                          <h3 className="text-[16px] font-bold text-[#1A1D20] m-0 mb-4 leading-snug">{product.name}</h3>
                          
                          <div className="mt-auto pt-4 border-t border-[#EFEFEF] flex justify-between items-center">
                            <div>
                              <div className="text-[18px] font-bold text-[#3A2210]">Rp {product.price.toLocaleString('id-ID')}</div>
                              <div className="text-[12px] text-[#6C757D]">Per Kg • Stok: {product.stock}kg</div>
                            </div>
                            <button onClick={(e) => handleAddToCart(e, product)} className="w-9 h-9 rounded-full bg-[#FDF9F5] text-[#A86431] border-none flex items-center justify-center cursor-pointer group-hover:bg-[#A86431] group-hover:text-white transition-colors">
                              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#EFEFEF] bg-white text-[#6C757D] disabled:opacity-40 hover:bg-[#F8F9FA] transition-colors cursor-pointer">
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-lg font-bold transition-colors cursor-pointer border ${currentPage === page ? 'bg-[#3A2210] text-white border-[#3A2210]' : 'bg-white text-[#6C757D] border-[#EFEFEF] hover:bg-[#F8F9FA]'}`}>
                        {page}
                      </button>
                    ))}

                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#EFEFEF] bg-white text-[#6C757D] disabled:opacity-40 hover:bg-[#F8F9FA] transition-colors cursor-pointer">
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default SemuaKopi;