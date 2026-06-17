import { useState } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, isBestSeller }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(product?.minOrder || 5);

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

  const handleOpenModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(product?.minOrder || 5);
    setIsModalOpen(true);
  };

  const handleCloseModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(false);
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const min = product?.minOrder || 1;
    if (quantity > min) {
      setQuantity(prev => prev - 1);
    }
  };

  // =======================================================
  // LOGIKA UTAMA: MEMASUKKAN DATA KE LOCALSTORAGE
  // =======================================================
  const handleConfirmAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const min = product?.minOrder || 1;
    if (quantity < min) {
      alert(`Minimal pembelian untuk produk ini adalah ${min} kg!`);
      return;
    }
    if (quantity > product.stock) {
      alert(`Stok tidak mencukupi! Maksimal pembelian adalah ${product.stock} kg.`);
      return;
    }

    // 1. Ambil data keranjang yang sudah ada di localStorage (jika kosong, buat array kosong)
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');

    // 2. Cek apakah produk ini sudah ada di keranjang belanja
    const existingProductIndex = existingCart.findIndex(item => item.id === product.id);

    if (existingProductIndex > -1) {
      // Jika kopi sudah ada di keranjang, akumulasikan jumlahnya
      const totalKuantitasBaru = existingCart[existingProductIndex].quantity + quantity;
      
      // Validasi agar total belanjaan tidak melebihi stok gudang petani
      if (totalKuantitasBaru > product.stock) {
        alert(`Gagal! Total kuantitas di keranjang (${totalKuantitasBaru}kg) melebihi stok yang tersedia (${product.stock}kg).`);
        return;
      }
      
      existingCart[existingProductIndex].quantity = totalKuantitasBaru;
    } else {
      // Jika produk baru pertama kali dimasukkan, push objek data lengkapnya
      existingCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        imageUrl: product.imageUrl,
        category: product.category,
        minOrder: product.minOrder,
        stock: product.stock,
        petaniId: product.petaniId,
        petani: product.petani
      });
    }

    // 3. Simpan kembali array keranjang yang terbaru ke localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));

    // 4. 🔥 TRICK PENTING: Pemicu event custom agar Navbar langsung mendeteksi perubahan angka badge
    window.dispatchEvent(new Event('cartUpdate'));

    alert(`Berhasil menambahkan ${quantity} kg ${product.name} ke keranjang!`);
    setIsModalOpen(false);
  };

  return (
    <>
      <Link to={`/produk/${product.id}`} className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(58,34,16,0.08)] transition-all duration-500 flex flex-col no-underline text-inherit group relative">
        {isBestSeller && (
          <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-[#EF4444] to-[#F59E0B] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1.5 backdrop-blur-sm border border-white/20">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
            Top
          </div>
        )}

        <div className="h-[200px] sm:h-[240px] overflow-hidden relative m-2 rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=400&q=80'} />
          <div className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-md text-[#3A2210] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase shadow-sm border border-white/50">
            {product.category}
          </div>
        </div>
        
        <div className="p-4 sm:p-6 flex flex-col flex-1">
          <div className="text-[12px] text-[#A86431] font-bold mb-2 flex items-center gap-1.5 opacity-90">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
            {product.petani?.name || 'Petani Lokal'}
          </div>
          
          <h3 className="text-[16px] sm:text-[18px] font-extrabold text-[#1A1D20] m-0 mb-3 leading-snug line-clamp-2 group-hover:text-[#A86431] transition-colors">{product.name}</h3>
          
          <div className="flex items-center gap-2 mb-4 sm:mb-5 text-[12px] sm:text-[13px] text-[#6C757D] font-medium bg-[#F8F9FA] w-fit px-2.5 py-1.5 rounded-lg border border-[#EFEFEF]">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="text-[#A86431]"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{product.sold || 0}Peaberry kg Terjual</span>
          </div>

          <div className="mt-auto pt-4 border-t border-dashed border-[#EFEFEF] flex justify-between items-center">
            <div>
              <div className="text-[11px] sm:text-[12px] text-[#6C757D] font-medium mb-0.5">Harga Grosir</div>
              <div className="text-[16px] sm:text-[20px] font-black text-[#3A2210]">Rp {product.price.toLocaleString('id-ID')}</div>
            </div>
            
            <button onClick={handleOpenModal} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#A86431]/10 text-[#A86431] border border-[#A86431]/20 flex items-center justify-center cursor-pointer group-hover:bg-[#A86431] group-hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>
        </div>
      </Link>

      {/* MODAL POPUP JUMLAH KUANTITAS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={handleCloseModal}>
          <div className="bg-white w-full max-w-[380px] rounded-3xl p-6 shadow-2xl border border-[#EFEFEF] flex flex-col gap-5 text-left relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h4 className="m-0 text-[18px] font-bold text-[#3A2210]">Atur Jumlah Pesanan</h4>
              <button onClick={handleCloseModal} className="bg-none border-none text-[24px] text-gray-400 hover:text-gray-700 cursor-pointer">&times;</button>
            </div>

            <div className="flex gap-3 bg-[#F8F9FA] p-3 rounded-xl border border-[#EFEFEF]">
              <img src={getImageUrl(product.imageUrl)} alt="Mini" className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-[14px] text-[#1A1D20] truncate">{product.name}</div>
                <div className="text-[12px] text-gray-500 mt-1">Stok Tersedia: <span className="font-bold text-[#1A1D20]">{product.stock} kg</span></div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 py-2">
              <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                <button onClick={handleDecrement} disabled={quantity <= (product?.minOrder || 1)} className="w-12 h-12 bg-gray-50 border-none font-bold text-[18px] text-gray-600 hover:bg-gray-100 active:bg-gray-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors">&minus;</button>
                <span className="w-16 text-center font-extrabold text-[16px] text-[#3A2210] select-none">
                  {quantity} <span className="text-[12px] font-normal text-gray-400 block -mt-1">kg</span>
                </span>
                <button onClick={handleIncrement} disabled={quantity >= product.stock} className="w-12 h-12 bg-gray-50 border-none font-bold text-[18px] text-gray-600 hover:bg-gray-100 active:bg-gray-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors">&#43;</button>
              </div>
              <small className="text-[11px] text-[#A86431] font-semibold mt-1">*Minimal pembelian produk ini: {product?.minOrder || 5} kg</small>
            </div>

            <div className="flex gap-3 border-t border-dashed border-[#EFEFEF] pt-4">
              <button onClick={handleCloseModal} className="flex-1 py-3 bg-white border border-gray-200 text-gray-500 font-bold text-[14px] rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">Batal</button>
              <button onClick={handleConfirmAddToCart} className="flex-1 py-3 bg-[#3A2210] text-white border-none font-bold text-[14px] rounded-xl hover:bg-[#A86431] transition-all cursor-pointer shadow-md">Masukkan Keranjang</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;