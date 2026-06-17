import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';

const KeranjangBelanja = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  // Ambil data keranjang dari memori browser
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  }, []);

  // Helper pengubah format gambar JSON Array
  const getImageUrl = (imageUrl) => {
    let finalImageUrl = "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=400&q=80";
    if (imageUrl) {
      try {
        const parsedImage = JSON.parse(imageUrl);
        finalImageUrl = Array.isArray(parsedImage) ? `http://localhost:5000${parsedImage[0]}` : `http://localhost:5000${imageUrl}`;
      } catch (e) { finalImageUrl = `http://localhost:5000${imageUrl}`; }
    }
    return finalImageUrl;
  };

  // Modifikasi kuantitas pesanan grosir (Plus / Minus)
  const updateQuantity = (id, newQty) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        const min = item.minOrder || 5;
        if (newQty < min) {
          alert(`Minimal pembelian untuk ${item.name} adalah ${min} kg!`);
          return item;
        }
        if (newQty > item.stock) {
          alert(`Stok tidak mencukupi! Maksimal tersedia adalah ${item.stock} kg.`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    });

    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdate')); // Update angka badge navbar secara live
  };

  // Hapus item kopi dari daftar belanjaan
  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdate')); // Update angka badge navbar secara live
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalEstimasi = subtotal;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout-pembayaran');
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-[#1A1D20]">
      <Navbar />

      <main className="max-w-[1300px] mx-auto px-[5%] py-10">
        <h1 className="text-[28px] font-black text-[#3A2210] mb-8">Keranjang Belanja</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-[#E5E7EB] shadow-sm max-w-[600px] mx-auto">
            <div className="w-16 h-16 mx-auto text-gray-300 mb-6">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </div>
            <h3 className="text-[18px] font-bold text-[#1A1D20] mb-2">Keranjang Anda Masih Kosong</h3>
            <p className="text-gray-500 text-[14px] mb-8 max-w-[360px] mx-auto">Silakan jelajahi katalog pilihan kopi kami dan temukan biji kopi berkualitas langsung dari petani lokal Lampung.</p>
            <Link to="/katalog" className="inline-block bg-[#A86431] text-white px-8 py-3.5 rounded-full font-bold text-[14px] no-underline hover:bg-[#3A2210] transition-colors shadow-sm">
              Jelajahi Katalog Kopi
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            
            {/* DAFTAR PRODUK KOPI (SISI KIRI) */}
            <div className="flex flex-col gap-4">
              {cartItems.map((item) => (
                /* 📍 DI SINI PERBAIKANNYA: Menambahkan pr-10 dan sm:pr-14 agar memberi ruang aman untuk tombol X */
                <div key={item.id} className="bg-white rounded-2xl p-4 pr-10 sm:p-5 sm:pr-14 border border-[#E5E7EB] shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center relative group">
                  
                  {/* Foto Kopi */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                    <img 
                      src={getImageUrl(item.imageUrl)} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=400&q=80"}
                    />
                  </div>

                  {/* Keterangan Teks Nama Produk */}
                  <div className="min-w-0 flex-1">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#A86431] bg-[#FDF9F5] px-2 py-0.5 rounded border border-[#A86431]/20 mb-1">
                      {item.category}
                    </span>
                    <h3 className="text-[16px] sm:text-[18px] font-bold text-[#1A1D20] m-0 mb-1 truncate">{item.name}</h3>
                    <div className="text-[12px] text-gray-500 flex items-center gap-1">
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                      {item.petani?.name || 'Petani Lokal'}
                    </div>
                    {/* Tampilan harga khusus HP (Mobile) */}
                    <div className="text-[15px] font-black text-[#A86431] mt-2 sm:hidden">
                      Rp {item.price.toLocaleString('id-ID')} <span className="text-[11px] font-normal text-gray-400">/Kg</span>
                    </div>
                  </div>

                  {/* Alat Pengontrol Kiloan Pesanan */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 w-full sm:w-auto shrink-0 justify-between sm:justify-start border-t border-dashed border-gray-100 sm:border-none pt-3 sm:pt-0">
                    <div className="hidden sm:block text-[16px] font-black text-[#3A2210]">
                      Rp {item.price.toLocaleString('id-ID')} <span className="text-[12px] font-normal text-gray-400">/Kg</span>
                    </div>

                    <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm h-9">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-9 h-full bg-gray-50 border-none font-bold text-[16px] text-gray-600 hover:bg-gray-100 active:bg-gray-200 cursor-pointer transition-colors"
                      >
                        &minus;
                      </button>
                      <span className="w-12 text-center font-extrabold text-[14px] text-[#3A2210]">
                        {item.quantity} <span className="text-[10px] font-normal text-gray-400 block -mt-1">kg</span>
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-full bg-gray-50 border-none font-bold text-[16px] text-gray-600 hover:bg-gray-100 active:bg-gray-200 cursor-pointer transition-colors"
                      >
                        &#43;
                  </button>
                    </div>
                  </div>

                  {/* Tombol Silang Hapus Akun/Item */}
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-3 right-3 sm:top-5 sm:right-4 bg-transparent border-none text-gray-400 hover:text-red-500 cursor-pointer text-[20px] p-1 transition-colors"
                    title="Hapus Kopi"
                  >
                    &times;
                  </button>

                </div>
              ))}
            </div>

            {/* RINGKASAN SUB TOTAL (SISI KANAN) */}
            <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-sm lg:sticky lg:top-24">
              <h3 className="m-0 text-[18px] font-bold text-[#3A2210] border-b border-[#EFEFEF] pb-4 mb-4">Ringkasan Belanja</h3>
              
              <div className="flex justify-between items-center text-[14px] text-gray-500 mb-3">
                <span>Total Muatan ({cartItems.length} varian)</span>
                <span className="font-semibold text-[#1A1D20]">{cartItems.reduce((acc, item) => acc + item.quantity, 0)} kg</span>
              </div>
              
              <div className="flex justify-between items-center text-[14px] text-gray-500 mb-4 pb-4 border-b border-dashed border-[#EFEFEF]">
                <span>Subtotal Produk</span>
                <span className="font-semibold text-[#1A1D20]">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between items-end mb-6">
                <div>
                  <div className="text-[14px] font-bold text-[#3A2210]">Total Tagihan</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">*Belum termasuk ongkos kirim kargo</div>
                </div>
                <div className="text-[22px] font-black text-[#A86431]">
                  Rp {totalEstimasi.toLocaleString('id-ID')}
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full py-3.5 bg-[#3A2210] text-white border-none font-bold text-[15px] rounded-xl hover:bg-[#A86431] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                Lanjut ke Pembayaran
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>

              <Link to="/katalog" className="block text-center text-[13px] text-[#A86431] font-bold mt-4 hover:text-[#3A2210] no-underline">
                &larr; Tambah Biji Kopi Lain
              </Link>
            </div>

          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default KeranjangBelanja;