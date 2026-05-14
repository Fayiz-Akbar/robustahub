import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom'; // TAMBAHKAN Link DISINI
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

const KatalogKopi = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Ambil parameter '?search=' dari URL
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) throw new Error('Gagal mengambil data dari server');
        
        const result = await response.json();
        setProducts(result.data); 
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter logika: Cari kopi yang namanya mirip dengan searchQuery
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topProducts = products.slice(0, 4);
  
  // Batasi kopi yang tampil di beranda maksimal 8 item saja
  const displayProducts = products.slice(0, 8); 

  // Jika sedang mencari sesuatu, sembunyikan Hero Banner
  const isSearching = searchQuery.length > 0;

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-[#1A1D20]">
      <Navbar />

      {/* Sembunyikan Banner Hero Jika Sedang Mencari */}
      {!isSearching && (
        <div 
          className="relative pt-[80px] lg:pt-[100px] px-[5%] pb-[100px] lg:pb-[140px] text-white text-center overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "linear-gradient(rgba(58, 34, 16, 0.7), rgba(58, 34, 16, 0.8)), url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1600&q=80')" }}
        >
          <h1 className="text-[36px] lg:text-[48px] m-0 mb-5 tracking-tight leading-[1.2] font-bold">Biji Kopi Langsung dari Kebun</h1>
          <p className="text-[18px] text-[#FDF9F5] max-w-[600px] mx-auto mb-8 leading-[1.6]">Platform B2B terpercaya. Temukan biji kopi Robusta & Arabika kualitas terbaik dari petani lokal untuk kebutuhan Coffee Shop Anda dengan harga grosir.</p>
        </div>
      )}

      <main className="max-w-[1300px] mx-auto px-[5%] pb-[60px] pt-[40px]">
        
        {isLoading && <div className="text-center py-20 text-lg font-semibold text-[#A86431]">Memuat biji kopi terbaik...</div>}
        {error && <div className="text-center py-20 text-red-500">Ups! Terjadi kesalahan: {error}</div>}

        {!isLoading && !error && (
          <>
            {/* Tampilan Jika SEDANG MENCARI */}
            {isSearching ? (
              <section>
                <div className="mb-8 flex justify-between items-center">
                  <div>
                    <h2 className="text-[28px] font-bold text-[#3A2210] m-0">
                      Hasil Pencarian untuk: "{searchQuery}"
                    </h2>
                    <p className="text-gray-500 mt-2">Ditemukan {filteredProducts.length} produk</p>
                  </div>
                  
                  {/* Tombol Lihat Semua di halaman pencarian */}
                  <Link to={`/semua-kopi?search=${searchQuery}`} className="hidden sm:inline-flex items-center gap-2 text-[#A86431] font-semibold hover:text-[#3A2210] transition-colors no-underline">
                    Lihat Lebih Banyak <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[30px]">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-gray-500 text-lg border-2 border-dashed border-gray-300 rounded-xl">
                      Waduh, kopi "{searchQuery}" tidak ditemukan di kebun mana pun.
                    </div>
                  ) : (
                    filteredProducts.slice(0,8).map((item) => <ProductCard key={item.id} product={item} />)
                  )}
                </div>
              </section>
            ) : (
              /* Tampilan NORMAL (Tanpa Pencarian) */
              <>
                {topProducts.length > 0 && (
                  <section className="mb-[60px]">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-3">
                      <h2 className="text-[28px] font-bold text-[#3A2210] m-0">Pilihan Terlaris Bulan Ini</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[30px]">
                      {topProducts.map((item) => <ProductCard key={item.id} product={item} isBestSeller={true} />)}
                    </div>
                  </section>
                )}

                <section>
                  {/* UBAH BAGIAN HEADER INI AGAR ADA TOMBOL "LIHAT SEMUA" */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-3">
                    <div>
                      <h2 className="text-[28px] font-bold text-[#3A2210] m-0 mb-2">Kopi Pilihan RobustaHub</h2>
                      <p className="text-[15px] text-[#6C757D] m-0">Koleksi biji kopi segar langsung dari tangan petani.</p>
                    </div>
                    
                    <Link to="/semua-kopi" className="inline-flex items-center gap-2 text-[#A86431] font-semibold hover:text-[#3A2210] transition-colors no-underline">
                      Lihat Semua Kopi <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[30px]">
                    {displayProducts.length === 0 ? (
                      <div className="col-span-full text-center py-10 text-gray-500">Belum ada katalog.</div>
                    ) : (
                      // HANYA MAP "displayProducts" (maksimal 8 kopi)
                      displayProducts.map((item) => <ProductCard key={item.id} product={item} />)
                    )}
                  </div>
                  
                  {/* Tombol Lihat Semua versi Mobile (Muncul di bawah jika di HP) */}
                  {products.length > 8 && (
                    <div className="mt-8 text-center sm:hidden">
                      <Link to="/semua-kopi" className="inline-block w-full py-3 bg-[#FDF9F5] text-[#A86431] font-semibold border border-[#A86431] rounded-lg no-underline">
                        Jelajahi Semua Katalog
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