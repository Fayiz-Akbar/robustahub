const ProductCard = ({ product }) => {
  // Fallback data jika props product belum dikirim dari API
  const {
    name = "Kopi Robusta Super",
    price = 50000,
    processingMethod = "Natural",
    elevation = "800 mdpl",
    imageUrl = "https://via.placeholder.com/300?text=Kopi+Robusta",
    petani = { shopName: "Kelompok Tani Makmur" }
  } = product || {};

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col h-full">
      {/* Gambar Produk */}
      <div className="relative h-48 w-full bg-gray-200">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded">
          {processingMethod}
        </div>
      </div>

      {/* Detail Produk */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
        <p className="text-sm text-gray-500 mb-2">Penyedia: {petani.shopName}</p>
        
        <div className="flex items-center text-xs text-gray-500 mb-4 space-x-2">
          <span className="bg-gray-100 px-2 py-1 rounded">Elevasi: {elevation}</span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-extrabold text-amber-700">
            Rp {price.toLocaleString('id-ID')} <span className="text-sm text-gray-500 font-normal">/kg</span>
          </span>
        </div>

        {/* Tombol Aksi */}
        <button className="mt-4 w-full bg-amber-800 text-white py-2 rounded-lg font-medium hover:bg-amber-900 transition-colors">
          Lihat Detail
        </button>
      </div>
    </div>
  );
};

export default ProductCard;