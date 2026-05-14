import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

const KatalogKopi = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) throw new Error('Gagal mengambil data dari server');
        
        const result = await response.json();
        // Hanya tampilkan produk yang aktif
        const activeProducts = result.data.filter(p => p.isActive !== false);
        setProducts(activeProducts); 
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // MENGAMBIL 2 PRODUK TERLARIS (Diurutkan berdasarkan yang stoknya paling banyak berkurang/paling diminati)
  // *Jika backend belum support 'sold', kita ambil 2 data pertama sebagai showcase
  const topProducts = products.slice(0, 2); 
  
  // Batasi kopi yang tampil di grid bawah maksimal 8 item saja
  const displayProducts = products.slice(0, 8); 

  const isSearching = searchQuery.length > 0;

  // Fungsi helper pembaca URL Gambar
  const getImageUrl = (imageUrl) => {
    let finalImageUrl = "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=800&q=80";
    if (imageUrl) {
      try {
        const parsedImage = JSON.parse(imageUrl);
        finalImageUrl = Array.isArray(parsedImage) ? `http://localhost:5000${parsedImage[0]}` : `http://localhost:5000${imageUrl}`;
      } catch (e) { finalImageUrl = `http://localhost:5000${imageUrl}`; }
    }
    return finalImageUrl;
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-[#1A1D20]">
      <Navbar />

      {/* HERO BANNER PREMIUM */}
      {!isSearching && (
        <div className="relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1600&q=80')" }}
          ></div>
          {/* Gradient Overlay untuk kemewahan */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#3A2210]/95 via-[#3A2210]/80 to-transparent"></div>
          
          <div className="relative pt-[100px] lg:pt-[140px] px-[5%] pb-[100px] lg:pb-[140px] max-w-[1300px] mx-auto text-left flex flex-col justify-center min-h-[40vh]">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#A86431]/20 text-[#FDF9F5] border border-[#A86431]/30 font-semibold text-[13px] tracking-widest uppercase mb-6 backdrop-blur-sm w-fit">
              100% Panen Lokal
            </span>
            <h1 className="text-[40px] md:text-[56px] lg:text-[64px] m-0 mb-6 tracking-tight leading-[1.1] font-bold text-white max-w-[800px]">
              Biji Kopi Asli <br/><span className="text-[#A86431]">Langsung dari Kebun</span>
            </h1>
            <p className="text-[16px] md:text-[20px] text-gray-200 max-w-[600px] m-0 leading-relaxed font-light">
              Platform B2B terpercaya. Temukan biji kopi Robusta & Arabika kualitas spesiality dari petani Lampung untuk kebutuhan Coffee Shop Anda dengan harga grosir terbaik.
            </p>
          </div>
        </div>
      )}

      <main className="pb-[80px]">
        
        {isLoading && <div className="text-center py-32 text-xl font-bold text-[#A86431]">Memanen data kopi terbaik... ☕</div>}
        {error && <div className="text-center py-20 text-red-500 font-semibold">Ups! Terjadi kesalahan: {error}</div>}

        {!isLoading && !error && (
          <>
            {/* TAMPILAN JIKA SEDANG MENCARI (SEARCH) */}
            {isSearching ? (
              <section className="max-w-[1300px] mx-auto px-[5%] pt-12">
                <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EFEFEF] pb-6">
                  <div>
                    <h2 className="text-[28px] font-bold text-[#3A2210] m-0">Hasil Pencarian: "{searchQuery}"</h2>
                    <p className="text-gray-500 mt-2 m-0 font-medium">Ditemukan {filteredProducts.length} varian kopi</p>
                  </div>
                  <Link to={`/semua-kopi?search=${searchQuery}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#EFEFEF] rounded-lg text-[#3A2210] font-bold hover:bg-[#F8F9FA] hover:text-[#A86431] transition-all no-underline shadow-sm">
                    Gunakan Filter Detail <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[30px]">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-[#6C757D] text-[18px] bg-white border-2 border-dashed border-[#EFEFEF] rounded-2xl">
                      Waduh, kopi "{searchQuery}" tidak ditemukan di kebun mana pun.
                    </div>
                  ) : (
                    filteredProducts.slice(0,8).map((item) => <ProductCard key={item.id} product={item} />)
                  )}
                </div>
              </section>
            ) : (

              /* TAMPILAN NORMAL (HOME) */
              <>
                {/* 1. SEGMEN 2 PRODUK TERLARIS (KARTU BESAR PREMIUM) */}
                {topProducts.length > 0 && (
                  <section className="bg-white py-[80px] border-b border-[#EFEFEF]">
                    <div className="max-w-[1300px] mx-auto px-[5%]">
                      
                      <div className="flex flex-col items-center text-center mb-12">
                        <span className="text-[#A86431] font-bold tracking-widest uppercase text-[12px] mb-2 flex items-center gap-2">
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> 
                          Banyak Diminati
                        </span>
                        <h2 className="text-[32px] md:text-[36px] font-bold text-[#3A2210] m-0">Produk Terlaris Bulan Ini</h2>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {topProducts.map((product) => (
                          <Link to={`/produk/${product.id}`} key={`top-${product.id}`} className="flex flex-col md:flex-row bg-[#FDF9F5] border border-[#EFEFEF] rounded-[24px] overflow-hidden hover:shadow-[0_20px_40px_rgba(168,100,49,0.08)] hover:-translate-y-1 transition-all duration-300 no-underline text-inherit group relative">
                            
                            {/* Label Best Seller */}
                            <div className="absolute top-4 left-4 z-10 bg-[#EF4444] text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                              <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                              Terlaris
                            </div>

                            {/* Gambar Kiri */}
                            <div className="md:w-[45%] h-[250px] md:h-auto overflow-hidden relative">
                              <img 
                                src={getImageUrl(product.imageUrl)} 
                                alt={product.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                              />
                            </div>

                            {/* Konten Kanan */}
                            <div className="md:w-[55%] p-6 md:p-8 flex flex-col justify-center bg-white relative z-0">
                              <div className="text-[13px] text-[#A86431] font-bold mb-3 flex items-center gap-1.5">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                {product.petani?.name || 'Petani Lokal Lampung'}
                              </div>
                              
                              <h3 className="text-[22px] font-bold text-[#1A1D20] m-0 mb-3 leading-snug group-hover:text-[#A86431] transition-colors">{product.name}</h3>
                              
                              <p className="text-[14px] text-[#6C757D] m-0 mb-6 line-clamp-2 leading-relaxed">
                                {product.description || `Biji kopi ${product.category.toLowerCase()} pilihan dengan kualitas terbaik untuk kebutuhan coffee shop Anda.`}
                              </p>

                              <div className="mt-auto flex justify-between items-end">
                                <div>
                                  <div className="text-[13px] text-[#6C757D] font-medium mb-1">Harga Grosir</div>
                                  <div className="text-[24px] font-bold text-[#3A2210]">Rp {product.price.toLocaleString('id-ID')} <span className="text-[14px] font-normal text-[#6C757D]">/Kg</span></div>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-[#3A2210] text-white flex items-center justify-center group-hover:bg-[#A86431] transition-colors shadow-md">
                                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </div>
                              </div>
                            </div>

                          </Link>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* 2. SEGMEN SEMUA PRODUK (GRID NORMAL MAKSIMAL 8) */}
                <section className="max-w-[1300px] mx-auto px-[5%] pt-[80px]">
                  
                  <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-10 gap-4">
                    <div>
                      <h2 className="text-[28px] md:text-[32px] font-bold text-[#3A2210] m-0 mb-2">Kopi Pilihan RobustaHub</h2>
                      <p className="text-[16px] text-[#6C757D] m-0">Jelajahi koleksi lengkap biji kopi segar dari tangan petani.</p>
                    </div>
                    
                    <Link to="/semua-kopi" className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-white border border-[#EFEFEF] rounded-full text-[#1A1D20] font-bold hover:border-[#A86431] hover:text-[#A86431] transition-all no-underline shadow-sm group">
                      Lihat Semua Kopi 
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="group-hover:translate-x-1 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {displayProducts.length === 0 ? (
                      <div className="col-span-full text-center py-20 text-[#6C757D] bg-white rounded-2xl border border-[#EFEFEF]">Belum ada katalog kopi tersedia saat ini.</div>
                    ) : (
                      displayProducts.map((item) => <ProductCard key={item.id} product={item} />)
                    )}
                  </div>
                  
                  {/* Tombol Lihat Semua versi Mobile */}
                  {products.length > 8 && (
                    <div className="mt-10 text-center sm:hidden">
                      <Link to="/semua-kopi" className="inline-flex items-center justify-center gap-2 w-full py-4 bg-[#3A2210] text-white font-bold rounded-xl no-underline shadow-[0_8px_20px_rgba(58,34,16,0.15)]">
                        Jelajahi Semua Katalog <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                      </Link>
                    </div>
                  )}

                </section>
              </>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default KatalogKopi;