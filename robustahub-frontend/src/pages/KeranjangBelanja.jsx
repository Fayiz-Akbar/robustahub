import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const KeranjangBelanja = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  // Mengambil data keranjang dari localStorage saat halaman dimuat
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      alert('Silakan login terlebih dahulu untuk melihat keranjang Anda.');
      navigate('/');
      return;
    }

    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(savedCart);
  }, [navigate]);

  // Fungsi untuk menyimpan perubahan ke localStorage dan State
  const updateCart = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    // Trigger event agar badge navbar (jika ada) ikut terupdate
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Logika Tambah Kuantitas
  const handleIncrease = (index) => {
    const newCart = [...cartItems];
    newCart[index].quantity += 1;
    updateCart(newCart);
  };

  // Logika Kurangi Kuantitas
  const handleDecrease = (index) => {
    const newCart = [...cartItems];
    if (newCart[index].quantity > 1) { // Asumsi minimal beli 1kg jika sudah masuk keranjang
      newCart[index].quantity -= 1;
      updateCart(newCart);
    }
  };

  // Logika Hapus Item
  const handleRemoveItem = (index) => {
    if (window.confirm('Yakin ingin menghapus kopi ini dari keranjang?')) {
      const newCart = cartItems.filter((_, i) => i !== index);
      updateCart(newCart);
    }
  };

  // Menghitung Total Harga & Total Berat
  const totalWeight = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans text-[#1A1D20]">
      <Navbar />

      <div className="max-w-[1200px] mx-auto w-full px-[5%] py-8">
        <h1 className="text-[24px] lg:text-[28px] font-bold text-[#1A1D20] mb-8">Keranjang Belanja</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EFEFEF] p-12 text-center shadow-sm flex flex-col items-center justify-center">
            <svg className="w-20 h-20 text-[#EFEFEF] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <h2 className="text-[20px] font-bold text-[#1A1D20] mb-2">Keranjang Anda Masih Kosong</h2>
            <p className="text-[#6C757D] mb-6">Yuk, cari biji kopi Robusta terbaik untuk kedai Anda!</p>
            <Link to="/katalog" className="bg-[#3A2210] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#A86431] transition-colors">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* KIRI: Daftar Item Keranjang */}
            <div className="flex-[2] flex flex-col gap-4">
              {cartItems.map((item, index) => (
                <div key={index} className="bg-white p-5 lg:p-6 rounded-2xl border border-[#EFEFEF] flex flex-col sm:flex-row gap-6 shadow-sm relative">
                  
                  {/* Gambar Produk */}
                  <img 
                    src={item.image || "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=200&q=80"} 
                    alt={item.name} 
                    className="w-full sm:w-[120px] h-[120px] rounded-xl object-cover border border-[#EFEFEF]" 
                  />
                  
                  {/* Detail Produk */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[13px] text-[#A86431] font-semibold mb-1 flex items-center gap-1">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                        {item.farmName}
                      </div>
                      <h3 className="text-[16px] lg:text-[18px] font-bold text-[#1A1D20] m-0 mb-2 leading-tight">
                        {item.name}
                      </h3>
                      <div className="text-[14px] text-[#6C757D] font-medium">
                        Rp {item.price.toLocaleString('id-ID')} <span className="text-[12px]">/ Kg</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 sm:mt-0">
                      {/* Kontrol Kuantitas */}
                      <div className="flex items-center border border-[#EFEFEF] rounded-lg overflow-hidden h-[36px]">
                        <button onClick={() => handleDecrease(index)} className="w-[36px] h-full bg-[#F8F9FA] hover:bg-[#EFEFEF] text-[18px] font-medium transition-colors">-</button>
                        <input type="text" value={item.quantity} readOnly className="w-[50px] h-full text-center border-x border-[#EFEFEF] font-bold text-[14px] outline-none bg-white" />
                        <button onClick={() => handleIncrease(index)} className="w-[36px] h-full bg-[#F8F9FA] hover:bg-[#EFEFEF] text-[18px] font-medium transition-colors">+</button>
                      </div>

                      {/* Tombol Hapus (Mobile ada di bawah, Desktop bisa di kanan) */}
                      <button 
                        onClick={() => handleRemoveItem(index)}
                        className="text-[#EF4444] hover:bg-[#FEF2F2] p-2 rounded-lg transition-colors flex items-center gap-1 text-[13px] font-semibold"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    </div>
                  </div>

                  {/* Subtotal Per Item (Desktop) */}
                  <div className="hidden sm:flex flex-col items-end justify-center border-l border-[#EFEFEF] pl-6 min-w-[120px]">
                    <span className="text-[12px] text-[#6C757D] mb-1">Subtotal</span>
                    <span className="text-[18px] font-bold text-[#3A2210]">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>

                </div>
              ))}
            </div>

            {/* KANAN: Ringkasan Belanja */}
            <div className="flex-1">
              <div className="bg-white p-6 lg:p-8 rounded-2xl border border-[#A86431] shadow-[0_8px_24px_rgba(168,100,49,0.08)] sticky top-[100px]">
                <h3 className="text-[18px] font-bold text-[#1A1D20] border-b border-[#EFEFEF] pb-4 mb-4">
                  Ringkasan Belanja
                </h3>
                
                <div className="flex justify-between items-center text-[14px] text-[#6C757D] mb-3">
                  <span>Total Harga ({cartItems.length} Barang)</span>
                  <span className="text-[#1A1D20] font-semibold">Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
                
                <div className="flex justify-between items-center text-[14px] text-[#6C757D] mb-6 pb-6 border-b border-[#EFEFEF]">
                  <span>Total Berat</span>
                  <span className="text-[#1A1D20] font-semibold">{totalWeight} Kg</span>
                </div>
                
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[16px] font-bold text-[#1A1D20]">Subtotal</span>
                  <span className="text-[24px] font-bold text-[#3A2210]">Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
                
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3.5 bg-[#3A2210] text-white rounded-xl font-bold text-[15px] hover:bg-[#A86431] hover:-translate-y-0.5 hover:shadow-[0_6px_15px_rgba(168,100,49,0.3)] transition-all flex justify-center items-center gap-2"
                >
                  Lanjut ke Checkout
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default KeranjangBelanja;