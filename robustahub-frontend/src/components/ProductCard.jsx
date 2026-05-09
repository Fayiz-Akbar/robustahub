import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, isBestSeller }) => {
  const navigate = useNavigate();
  const backendUrl = "http://localhost:5000";
  let finalImageUrl = "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=500&q=80";

  // Parsing Gambar
  if (product.imageUrl) {
    try {
      const parsedImage = JSON.parse(product.imageUrl);
      if (Array.isArray(parsedImage) && parsedImage.length > 0) {
        finalImageUrl = `${backendUrl}${parsedImage[0]}`;
      } else {
        finalImageUrl = `${backendUrl}${product.imageUrl}`;
      }
    } catch (e) {
      finalImageUrl = `${backendUrl}${product.imageUrl}`;
    }
  }

  // Fungsi navigasi: Saat seluruh kartu diklik, arahkan ke Halaman Detail
  const goToDetail = () => {
    navigate(`/produk/${product.id}`);
  };

  const isOutOfStock = product.stock < (product.minOrder || 5);

  return (
    <div 
      onClick={goToDetail}
      className="bg-white rounded-[16px] overflow-hidden border border-[#EFEFEF] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(168,100,49,0.12)] hover:border-[#A86431] flex flex-col relative group cursor-pointer"
    >
      
      {/* Badge Terlaris */}
      {isBestSeller && (
        <div className="absolute top-4 left-4 bg-[#F59E0B] text-white py-1.5 px-3 rounded-full text-[12px] font-bold flex items-center gap-1 shadow-[0_4px_10px_rgba(245,158,11,0.3)] z-10">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
          Terlaris
        </div>
      )}

      {/* Gambar Kopi */}
      <div className="relative h-[220px] overflow-hidden bg-gray-100">
        <img src={finalImageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>

      <div className="p-5 lg:p-6 flex flex-col flex-1">
        {/* Nama Petani */}
        <div className="text-[12px] text-[#A86431] font-semibold mb-2 flex items-center gap-1.5 truncate">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
          <span className="truncate">{product.petani?.shopName || product.petani?.name || "Petani Kopi"}</span>
        </div>
        
        {/* Nama Produk */}
        <h3 className="text-[16px] lg:text-[18px] font-bold m-0 mb-4 text-[#1A1D20] leading-[1.4] line-clamp-2 group-hover:text-[#A86431] transition-colors">
          {product.name}
        </h3>
        
        {/* Detail Harga dan Stok (Di Bawah) */}
        <div className="mt-auto border-t border-[#EFEFEF] pt-4">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[18px] lg:text-[20px] font-bold text-[#3A2210]">
                Rp {product.price?.toLocaleString('id-ID')}
              </div>
              <div className="text-[12px] text-[#6C757D] font-medium mt-1">
                Min. Order: {product.minOrder || 5}kg
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-[13px] font-bold ${isOutOfStock ? 'text-red-500' : 'text-[#10B981]'}`}>
                {isOutOfStock ? 'Stok Habis' : `Stok: ${product.stock}kg`}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;