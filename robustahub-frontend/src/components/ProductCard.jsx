import { Link } from 'react-router-dom';

const ProductCard = ({ product, isBestSeller }) => {
  // Parsing Gambar dari JSON (Array)
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

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    alert(`Fitur tambah ke keranjang untuk ${product.name} akan segera hadir!`);
  };

  return (
    <Link to={`/produk/${product.id}`} className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col no-underline text-inherit group relative">
      
      {/* Label Terlaris Jika Diprop isBestSeller */}
      {isBestSeller && (
        <div className="absolute top-3 left-3 z-10 bg-[#EF4444] text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
          <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          Top
        </div>
      )}

      <div className="h-[180px] sm:h-[200px] overflow-hidden relative">
        <img 
          src={getImageUrl(product.imageUrl)} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=400&q=80'}
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-[#3A2210] text-[10px] font-bold px-2 py-1 rounded-md uppercase">
          {product.category}
        </div>
      </div>
      
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="text-[11px] sm:text-[12px] text-[#A86431] font-bold mb-1.5 flex items-center gap-1">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
          {product.petani?.name || 'Petani Lokal'}
        </div>
        
        <h3 className="text-[14px] sm:text-[16px] font-bold text-[#1A1D20] m-0 mb-3 leading-snug line-clamp-2">{product.name}</h3>
        
        {/* Rating & Terjual Bintang (Dummy rating, Real Terjual) */}
        <div className="flex items-center gap-2 mb-4 text-[12px] text-[#6C757D]">
          <span className="flex items-center text-[#F59E0B] font-bold">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" className="mr-1"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            5.0
          </span>
          <span className="w-1 h-1 rounded-full bg-[#EFEFEF]"></span>
          <span>{product.sold || 0}kg Terjual</span>
        </div>

        <div className="mt-auto pt-3 sm:pt-4 border-t border-[#EFEFEF] flex justify-between items-center">
          <div>
            <div className="text-[16px] sm:text-[18px] font-bold text-[#3A2210]">Rp {product.price.toLocaleString('id-ID')}</div>
          </div>
          <button onClick={handleAddToCart} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FDF9F5] text-[#A86431] border-none flex items-center justify-center cursor-pointer group-hover:bg-[#A86431] group-hover:text-white transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;