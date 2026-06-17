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
        const activeProducts = result.data.filter(p => p.isActive !== false);

        // Sorting produk berdasarkan yang PALING BANYAK TERJUAL
        activeProducts.sort((a, b) => (b.sold || 0) - (a.sold || 0));

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

  // Ambil 2 produk terlaris (sudah di-sort di atas berdasarkan 'sold')
  const topProducts = products.slice(0, 2);
  // Ambil sisa produk untuk grid bawah
  const displayProducts = products.slice(0, 8);

  const isSearching = searchQuery.length > 0;

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
        <>
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1600&q=80')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#3A2210]/95 via-[#3A2210]/80 to-transparent"></div>

            <div className="relative pt-[80px] lg:pt-[120px] px-[5%] pb-[80px] lg:pb-[120px] max-w-[1300px] mx-auto text-left flex flex-col justify-center min-h-[35vh]">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#A86431]/20 text-[#FDF9F5] border border-[#A86431]/30 font-semibold text-[13px] tracking-widest uppercase mb-6 backdrop-blur-sm w-fit">
                100% Panen Lokal
              </span>
              <h1 className="text-[36px] md:text-[56px] lg:text-[64px] m-0 mb-4 tracking-tight leading-[1.1] font-bold text-white max-w-[800px]">
                Biji Kopi Asli <br className="hidden sm:block" /><span className="text-[#A86431]">Langsung dari Kebun</span>
              </h1>
              <p className="text-[15px] md:text-[18px] text-gray-200 max-w-[600px] m-0 leading-relaxed font-light">
                Platform B2B terpercaya. Temukan biji kopi Robusta & Arabika untuk kebutuhan Coffee Shop Anda dengan harga grosir terbaik.
              </p>
            </div>
          </div>

          {/* ======================================================= */}
          {/* MENU KATEGORI ICONS (CUSTOM COFFEE SVGS) */}
          {/* ======================================================= */}
          <section className="bg-white border-b border-[#EFEFEF] py-6 shadow-[0_4px_10px_rgba(0,0,0,0.02)] relative z-10 -mt-4 rounded-t-3xl sm:rounded-none sm:mt-0">
            <div className="max-w-[1300px] mx-auto px-[5%]">
              <div className="flex justify-start sm:justify-center gap-6 sm:gap-16 overflow-x-auto hide-scrollbar pb-2 pt-2">

                {/* Kategori 1: Robusta (Icon Biji Kopi) */}
                <Link to="/semua-kopi?search=robusta" className="flex flex-col items-center gap-3 group no-underline min-w-[80px]">
                  <div className="w-14 h-14 sm:w-[68px] sm:h-[68px] rounded-2xl bg-white border border-[#EFEFEF] shadow-sm flex items-center justify-center text-[#A86431] group-hover:border-[#A86431] group-hover:shadow-[0_8px_20px_rgba(168,100,49,0.15)] transition-all duration-300 group-hover:-translate-y-1">
                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      {/* Biji kopi dengan garis tengah 'S' */}
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6.5c1.5 2.5 1.5 8.5-1 11"></path>
                    </svg>
                  </div>
                  <span className="text-[12px] sm:text-[14px] font-bold text-[#1A1D20] group-hover:text-[#A86431] transition-colors">Robusta</span>
                </Link>

                {/* Kategori 2: Arabika (Icon Cangkir Kopi Panas) */}
                <Link to="/semua-kopi?search=arabika" className="flex flex-col items-center gap-3 group no-underline min-w-[80px]">
                  <div className="w-14 h-14 sm:w-[68px] sm:h-[68px] rounded-2xl bg-white border border-[#EFEFEF] shadow-sm flex items-center justify-center text-[#10B981] group-hover:border-[#10B981] group-hover:shadow-[0_8px_20px_rgba(16,185,129,0.15)] transition-all duration-300 group-hover:-translate-y-1">
                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      {/* Mug & Asap */}
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 1v3M10 1v3M14 1v3"></path>
                    </svg>
                  </div>
                  <span className="text-[12px] sm:text-[14px] font-bold text-[#1A1D20] group-hover:text-[#10B981] transition-colors">Arabika</span>
                </Link>

                {/* Kategori 3: House Blend (Icon Kemasan/Bungkus Kopi) */}
                <Link to="/semua-kopi?search=blend" className="flex flex-col items-center gap-3 group no-underline min-w-[80px]">
                  <div className="w-14 h-14 sm:w-[68px] sm:h-[68px] rounded-2xl bg-white border border-[#EFEFEF] shadow-sm flex items-center justify-center text-[#3B82F6] group-hover:border-[#3B82F6] group-hover:shadow-[0_8px_20px_rgba(59,130,246,0.15)] transition-all duration-300 group-hover:-translate-y-1">
                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      {/* Paper Bag Kopi */}
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4V2h10v2M5 8h14l-1.5 14h-11L5 8z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a2 2 0 100 4 2 2 0 000-4z"></path>
                    </svg>
                  </div>
                  <span className="text-[12px] sm:text-[14px] font-bold text-[#1A1D20] group-hover:text-[#3B82F6] transition-colors">House Blend</span>
                </Link>

              </div>
            </div>
          </section>
        </>
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
                    <h2 className="text-[24px] md:text-[28px] font-bold text-[#3A2210] m-0">Hasil Pencarian: "{searchQuery}"</h2>
                    <p className="text-gray-500 mt-2 m-0 font-medium">Ditemukan {filteredProducts.length} varian kopi</p>
                  </div>
                  <Link to={`/semua-kopi?search=${searchQuery}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#EFEFEF] rounded-lg text-[#3A2210] font-bold hover:bg-[#F8F9FA] hover:text-[#A86431] transition-all no-underline shadow-sm w-full sm:w-auto justify-center">
                    Gunakan Filter Detail <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                  </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-[30px]">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-[#6C757D] text-[16px] md:text-[18px] bg-white border-2 border-dashed border-[#EFEFEF] rounded-2xl">
                      Waduh, kopi "{searchQuery}" tidak ditemukan di kebun mana pun.
                    </div>
                  ) : (
                    filteredProducts.slice(0, 8).map((item) => <ProductCard key={item.id} product={item} />)
                  )}
                </div>
              </section>
            ) : (

              /* TAMPILAN NORMAL (HOME) */
              <>
                {/* SEGMEN 2 PRODUK TERLARIS (KARTU BESAR PREMIUM) */}
                {topProducts.length > 0 && (
                  <section className="bg-white py-[60px] md:py-[80px] border-b border-[#EFEFEF]">
                    <div className="max-w-[1300px] mx-auto px-[5%]">

                      <div className="flex flex-col items-center text-center mb-10 md:mb-12">
                        <span className="text-[#A86431] font-bold tracking-widest uppercase text-[11px] md:text-[12px] mb-2 flex items-center gap-2">
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                          Banyak Diminati
                        </span>
                        <h2 className="text-[26px] md:text-[36px] font-bold text-[#3A2210] m-0">Produk Terlaris Bulan Ini</h2>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        {topProducts.map((product) => (
                          <Link to={`/produk/${product.id}`} key={`top-${product.id}`} className="flex flex-col md:flex-row bg-[#FDF9F5] border border-[#EFEFEF] rounded-[20px] md:rounded-[24px] overflow-hidden hover:shadow-[0_20px_40px_rgba(168,100,49,0.08)] hover:-translate-y-1 transition-all duration-300 no-underline text-inherit group relative">

                            <div className="absolute top-4 left-4 z-10 bg-[#EF4444] text-white text-[10px] md:text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                              <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                              Terlaris
                            </div>

                            <div className="md:w-[45%] h-[200px] md:h-auto overflow-hidden relative">
                              <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>

                            <div className="md:w-[55%] p-5 md:p-8 flex flex-col justify-center bg-white relative z-0">
                              <div className="text-[12px] md:text-[13px] text-[#A86431] font-bold mb-2 md:mb-3 flex items-center gap-1.5">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                {product.petani?.name || 'Petani Lokal Lampung'}
                              </div>

                              <h3 className="text-[18px] md:text-[22px] font-bold text-[#1A1D20] m-0 mb-2 md:mb-3 leading-snug group-hover:text-[#A86431] transition-colors">{product.name}</h3>

                              <p className="text-[13px] md:text-[14px] text-[#6C757D] m-0 mb-4 md:mb-6 line-clamp-2 leading-relaxed">
                                {product.description || `Biji kopi ${product.category.toLowerCase()} pilihan dengan kualitas terbaik.`}
                              </p>

                              <div className="mt-auto flex justify-between items-end">
                                <div>
                                  <div className="text-[12px] md:text-[13px] text-[#6C757D] font-medium mb-1">{product.sold || 0}kg Terjual</div>
                                  <div className="text-[20px] md:text-[24px] font-bold text-[#3A2210]">Rp {product.price.toLocaleString('id-ID')} <span className="text-[12px] md:text-[14px] font-normal text-[#6C757D]">/Kg</span></div>
                                </div>
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#3A2210] text-white flex items-center justify-center group-hover:bg-[#A86431] transition-colors shadow-md">
                                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* SEGMEN SEMUA PRODUK (GRID NORMAL MAKSIMAL 8) */}
                <section className="max-w-[1300px] mx-auto px-[5%] pt-[60px] md:pt-[80px]">

                  <div className="flex flex-row justify-between items-end mb-8 md:mb-10 gap-4 border-b border-[#EFEFEF] pb-4 sm:border-none sm:pb-0">
                    <div>
                      <h2 className="text-[24px] md:text-[32px] font-bold text-[#3A2210] m-0 mb-1 md:mb-2">Kopi Pilihan RobustaHub</h2>
                      <p className="text-[14px] md:text-[16px] text-[#6C757D] m-0">Jelajahi koleksi lengkap biji kopi segar.</p>
                    </div>

                    <Link to="/semua-kopi" className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-white border border-[#EFEFEF] rounded-full text-[#1A1D20] font-bold hover:border-[#A86431] hover:text-[#A86431] transition-all no-underline shadow-sm group whitespace-nowrap">
                      Lihat Semua <span className="hidden md:inline">Kopi</span>
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="group-hover:translate-x-1 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                    {displayProducts.length === 0 ? (
                      <div className="col-span-full text-center py-20 text-[#6C757D] bg-white rounded-2xl border border-[#EFEFEF]">Belum ada katalog kopi tersedia saat ini.</div>
                    ) : (
                      displayProducts.map((item) => <ProductCard key={item.id} product={item} />)
                    )}
                  </div>

                  {/* Tombol Lihat Semua Khusus HP (Full width di bawah grid) */}
                  {products.length > 8 && (
                    <div className="mt-8 text-center sm:hidden">
                      <Link to="/semua-kopi" className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-white border-2 border-[#A86431] text-[#A86431] font-bold rounded-xl no-underline shadow-sm">
                        Jelajahi Semua Katalog <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
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