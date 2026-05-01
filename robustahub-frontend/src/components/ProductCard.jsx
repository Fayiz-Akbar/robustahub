const ProductCard = ({ product, isBestSeller }) => {
  // Karena URL gambar dari backend biasanya hanya "/uploads/namafile.jpg", 
  // kita harus gabungkan dengan alamat server backend kita
  const backendUrl = "http://localhost:5000";
  const imageUrl = product.imageUrl 
    ? `${backendUrl}${product.imageUrl}` 
    : "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=500&q=80"; // Gambar default jika petani belum upload foto

  return (
    <div className="bg-white rounded-[16px] overflow-hidden border border-[#EFEFEF] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:border-transparent flex flex-col relative group">
      
      {/* Label Terlaris */}
      {isBestSeller && (
        <div className="absolute top-4 left-4 bg-[#F59E0B] text-white py-1.5 px-3 rounded-full text-[12px] font-bold flex items-center gap-1 shadow-[0_4px_10px_rgba(245,158,11,0.3)] z-10">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
          Terlaris
        </div>
      )}

      {/* Gambar */}
      <div className="relative h-[220px] overflow-hidden bg-gray-100">
        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-1">
        <div className="text-[13px] text-[#A86431] font-semibold mb-2 flex items-center gap-1.5">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
          {/* Menampilkan shopName, jika kosong tampilkan name */}
          {product.petani?.shopName || product.petani?.name || "Petani Kopi"}
        </div>
        <h3 className="text-[18px] font-bold m-0 mb-3 text-[#1A1D20] leading-[1.4]">
          {product.name}
        </h3>
        
        {/* Footer Card */}
        <div className="mt-auto border-t border-[#EFEFEF] pt-5 flex justify-between items-center">
          <div>
            <div className="text-[20px] font-bold text-[#3A2210]">Rp {product.price?.toLocaleString('id-ID')}</div>
            <div className="text-[13px] text-[#6C757D] font-normal">Min. Order: {product.minOrder}kg • Stok: {product.stock}kg</div>
          </div>
          <button className="w-10 h-10 rounded-full bg-[#FDF9F5] text-[#A86431] border-none cursor-pointer flex items-center justify-center transition-all duration-300 group-hover:bg-[#A86431] group-hover:text-white" title="Tambah ke Keranjang">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;