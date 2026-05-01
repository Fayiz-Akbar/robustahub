import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

const KatalogKopi = () => {
  // State untuk menyimpan data produk dari database
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect akan berjalan otomatis 1x saat halaman Katalog dimuat
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Memanggil API Backend
        const response = await fetch('http://localhost:5000/api/products');
        
        if (!response.ok) {
          throw new Error('Gagal mengambil data dari server');
        }

        const result = await response.json();
        // Simpan data dari database ke dalam state 'products'
        setProducts(result.data); 
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Karena belum ada fitur rating penjualan, kita simulasikan 4 produk pertama sebagai "Terlaris"
  const topProducts = products.slice(0, 4);

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-[#1A1D20]">
      <Navbar />

      {/* Hero Banner Section */}
      <div 
        className="relative pt-[80px] lg:pt-[100px] px-[5%] pb-[100px] lg:pb-[140px] text-white text-center overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(58, 34, 16, 0.7), rgba(58, 34, 16, 0.8)), url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1600&q=80')" }}
      >
        <h1 className="text-[36px] lg:text-[48px] m-0 mb-5 tracking-tight leading-[1.2] font-bold">Biji Kopi Langsung dari Kebun</h1>
        <p className="text-[18px] text-[#FDF9F5] max-w-[600px] mx-auto mb-8 leading-[1.6]">Platform B2B terpercaya. Temukan biji kopi Robusta & Arabika kualitas terbaik dari petani lokal untuk kebutuhan Coffee Shop Anda dengan harga grosir.</p>
        <button className="inline-block bg-[#A86431] text-white py-[14px] px-[32px] rounded-full font-semibold text-[16px] transition-all hover:bg-white hover:text-[#3A2210] hover:-translate-y-1">
          Jelajahi Katalog
        </button>
      </div>

      <main className="max-w-[1300px] mx-auto px-[5%] pb-[60px]">
        
        {/* State Loading dan Error */}
        {isLoading && (
          <div className="text-center py-20 text-lg font-semibold text-[#A86431]">
            Memuat biji kopi terbaik dari kebun...
          </div>
        )}
        
        {error && (
          <div className="text-center py-20 text-lg font-semibold text-red-500">
            Ups! Terjadi kesalahan: {error} <br/> 
            <span className="text-sm text-gray-500">Pastikan server backend (port 5000) sudah berjalan.</span>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Section 1: Terlaris */}
            {topProducts.length > 0 && (
              <section className="pt-[60px]">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-3">
                  <h2 className="text-[28px] font-bold text-[#3A2210] m-0 flex items-center gap-3">
                    Pilihan Terlaris Bulan Ini
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[30px]">
                  {topProducts.map((item) => (
                    // Kirim isBestSeller={true} untuk memunculkan badge kuning
                    <ProductCard key={item.id} product={item} isBestSeller={true} />
                  ))}
                </div>
              </section>
            )}

            {/* Section 2: Semua Kopi */}
            <section className="pt-[60px]">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-3">
                <h2 className="text-[28px] font-bold text-[#3A2210] m-0 flex items-center gap-3">
                  Jelajahi Semua Produk
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[30px]">
                {products.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-gray-500">
                    Belum ada katalog kopi yang ditambahkan oleh petani.
                  </div>
                ) : (
                  products.map((item) => (
                    <ProductCard key={item.id} product={item} />
                  ))
                )}
              </div>
            </section>
          </>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default KatalogKopi;