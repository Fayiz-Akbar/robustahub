import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const DetailProduk = () => {
  const { id } = useParams(); // Mengambil ID produk dari URL
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk interaksi UI
  const [activeImage, setActiveImage] = useState('');
  const [allImages, setAllImages] = useState([]);
  const [quantity, setQuantity] = useState(5); // Default akan ditimpa oleh minOrder

  useEffect(() => {
    // Fungsi untuk mengambil detail produk spesifik dari backend
    const fetchProductDetail = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        const result = await response.json();
        
        if (response.ok) {
          const data = result.data;
          setProduct(data);
          setQuantity(data.minOrder || 5); // Set kuantitas awal sesuai minOrder
          
          // Parsing Gambar
          let parsedImages = [];
          if (data.imageUrl) {
            try {
              const parsed = JSON.parse(data.imageUrl);
              if (Array.isArray(parsed)) {
                parsedImages = parsed.map(img => `http://localhost:5000${img}`);
              } else {
                parsedImages = [`http://localhost:5000${data.imageUrl}`];
              }
            } catch (e) {
              parsedImages = [`http://localhost:5000${data.imageUrl}`];
            }
          }
          
          // Jika tidak ada gambar, pasang gambar default
          if (parsedImages.length === 0) {
            parsedImages = ["https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=800&q=80"];
          }
          
          setAllImages(parsedImages);
          setActiveImage(parsedImages[0]); // Jadikan foto pertama sebagai gambar utama
        } else {
          alert('Produk tidak ditemukan!');
          navigate('/katalog');
        }
      } catch (error) {
        console.error("Gagal mengambil data produk:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetail();
  }, [id, navigate]);

  // Logika Tambah/Kurang Kuantitas
  const handleIncrease = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > (product.minOrder || 5)) {
      setQuantity(prev => prev - 1);
    }
  };

  // Logika Masukkan ke Keranjang (Menyimpan di localStorage untuk sementara)
  const handleAddToCart = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      alert('Silakan masuk ke akun Anda terlebih dahulu!');
      navigate('/');
      return;
    }

    // Ambil keranjang yang ada, atau buat array kosong jika belum ada
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Cek apakah produk ini sudah ada di keranjang
    const itemIndex = existingCart.findIndex(item => item.productId === product.id);
    
    if (itemIndex > -1) {
      // Jika sudah ada, tambahkan kuantitasnya
      existingCart[itemIndex].quantity += quantity;
    } else {
      // Jika belum ada, masukkan sebagai barang baru
      existingCart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: activeImage,
        farmName: product.petani?.shopName || product.petani?.name || "Petani Kopi",
        quantity: quantity
      });
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    alert(`${product.name} berhasil ditambahkan ke keranjang!`);
    
    // Trigger event agar Navbar bisa update jumlah keranjang (opsional)
    window.dispatchEvent(new Event('cartUpdated')); 
  };

  const handleBuyNow = () => {
    // Masukkan ke keranjang lalu langsung arahkan ke halaman checkout
    handleAddToCart();
    navigate('/keranjang'); // Nanti kita buat halaman keranjang
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-[#A86431] font-bold text-xl">
          Memuat Detail Produk...
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans text-[#1A1D20]">
      {/* Kita panggil Navbar Component */}
      <Navbar />

      <div className="max-w-[1200px] mx-auto w-full px-[5%] py-8">
        
        {/* Tombol Kembali */}
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-2 text-[#6C757D] font-medium text-[15px] mb-6 hover:text-[#A86431] transition-colors focus:outline-none"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali ke sebelumnya
        </button>

        {/* Kotak Putih Utama */}
        <div className="bg-white rounded-2xl border border-[#EFEFEF] p-6 lg:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* KIRI: Galeri Foto */}
          <div className="flex flex-col gap-4">
            {/* Foto Utama */}
            <img 
              src={activeImage} 
              alt={product.name} 
              className="w-full h-[350px] lg:h-[450px] rounded-2xl object-cover border border-[#EFEFEF] transition-all duration-300" 
            />
            {/* Thumbnail */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img} 
                    alt={`Thumbnail ${idx}`}
                    onClick={() => setActiveImage(img)}
                    className={`w-full h-[80px] lg:h-[90px] rounded-lg object-cover cursor-pointer transition-all duration-200 border-2 ${activeImage === img ? 'border-[#A86431] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* KANAN: Informasi Produk */}
          <div className="flex flex-col">
            
            <Link to={`/toko/${product.petaniId}`} className="inline-flex items-center gap-1.5 text-[#A86431] font-semibold text-[14px] mb-3 hover:text-[#3A2210] hover:underline transition-colors w-fit">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              {product.petani?.shopName || product.petani?.name || "Kebun Kopi Mitra"}
            </Link>
            
            <h1 className="text-[28px] lg:text-[32px] font-bold text-[#1A1D20] m-0 mb-4 leading-[1.3]">
              {product.name}
            </h1>
            
            <div className="flex items-end gap-2 mb-6 pb-6 border-b border-[#EFEFEF]">
              <span className="text-[32px] lg:text-[36px] font-bold text-[#3A2210] leading-none">
                Rp {product.price.toLocaleString('id-ID')}
              </span>
              <span className="text-[16px] text-[#6C757D] font-medium mb-1">/ Kilogram</span>
            </div>

            {/* Grid Spesifikasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-xl border border-[#EFEFEF]">
                <div className="text-[#A86431]"><svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg></div>
                <div>
                  <p className="m-0 text-[12px] text-[#6C757D]">Kategori</p>
                  <h5 className="m-0 mt-0.5 text-[14px] text-[#1A1D20] font-semibold">{product.category}</h5>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-xl border border-[#EFEFEF]">
                <div className="text-[#A86431]"><svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg></div>
                <div>
                  <p className="m-0 text-[12px] text-[#6C757D]">Ketinggian Tanam</p>
                  <h5 className="m-0 mt-0.5 text-[14px] text-[#1A1D20] font-semibold">{product.elevation || '-'}</h5>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-xl border border-[#EFEFEF]">
                <div className="text-[#A86431]"><svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg></div>
                <div>
                  <p className="m-0 text-[12px] text-[#6C757D]">Tasting Notes</p>
                  <h5 className="m-0 mt-0.5 text-[14px] text-[#1A1D20] font-semibold">{product.tastingNotes || '-'}</h5>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-xl border border-[#EFEFEF]">
                <div className="text-[#A86431]"><svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg></div>
                <div>
                  <p className="m-0 text-[12px] text-[#6C757D]">Proses Pascapanen</p>
                  <h5 className="m-0 mt-0.5 text-[14px] text-[#1A1D20] font-semibold">{product.processingMethod || '-'}</h5>
                </div>
              </div>
            </div>

            <h3 className="text-[18px] font-bold text-[#1A1D20] m-0 mb-3">Deskripsi Kopi</h3>
            <p className="text-[15px] text-[#6C757D] leading-[1.6] mb-8 whitespace-pre-wrap">
              {product.description || 'Tidak ada deskripsi untuk produk ini.'}
            </p>

            {/* Kotak Aksi (Add to Cart & Buy) */}
            <div className="bg-white border border-[#A86431] rounded-2xl p-6 shadow-[0_8px_24px_rgba(168,100,49,0.08)] mt-auto">
              
              <div className="flex justify-between items-center text-[14px] font-medium mb-5">
                <span>Stok Ketersediaan:</span>
                <span className="text-[#10B981] font-bold">Tersedia {product.stock} Kg</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <span className="text-[14px] font-bold text-[#1A1D20]">Jumlah Pembelian:</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-[#EFEFEF] rounded-lg overflow-hidden h-[44px]">
                    <button onClick={handleDecrease} className="w-[44px] h-full bg-[#F8F9FA] hover:bg-[#EFEFEF] text-[20px] font-medium transition-colors focus:outline-none">-</button>
                    <input 
                      type="text" 
                      value={quantity} 
                      readOnly 
                      className="w-[60px] h-full text-center border-x border-[#EFEFEF] font-bold text-[16px] outline-none"
                    />
                    <button onClick={handleIncrease} className="w-[44px] h-full bg-[#F8F9FA] hover:bg-[#EFEFEF] text-[20px] font-medium transition-colors focus:outline-none">+</button>
                  </div>
                  <span className="text-[12px] text-[#F59E0B] font-bold bg-[#FEF3C7] px-2.5 py-1 rounded-md">
                    Min. {product.minOrder || 5} Kg
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock < (product.minOrder || 5)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-[15px] cursor-pointer transition-all flex items-center justify-center gap-2 bg-[#FDF9F5] text-[#A86431] border border-[#A86431] hover:bg-[#F3E8DF] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  Masukkan Keranjang
                </button>
                <button 
                  onClick={handleBuyNow}
                  disabled={product.stock < (product.minOrder || 5)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-[15px] cursor-pointer transition-all flex items-center justify-center gap-2 bg-[#3A2210] text-white border-none hover:bg-[#A86431] hover:-translate-y-0.5 hover:shadow-[0_6px_15px_rgba(168,100,49,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  Beli Sekarang
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default DetailProduk;