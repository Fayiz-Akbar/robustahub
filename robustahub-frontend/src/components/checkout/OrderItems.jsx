import React from 'react';

const OrderItems = ({ items = [] }) => {
  // Fungsi Helper untuk melakukan parsing gambar dari JSON Array database
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

  return (
    <section className="bg-white border border-[#EFEFEF] rounded-[16px] p-[32px]">
      <h2 className="text-[18px] font-bold m-0 mb-6 border-b border-[#EFEFEF] pb-4 text-[#1A1D20]">
        Item Komoditas Kopi
      </h2>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 py-2 border-b border-dashed border-gray-100 last:border-none">
            <img 
              src={getImageUrl(item.imageUrl)} 
              alt={item.name} 
              className="w-16 h-16 object-cover rounded-xl border border-gray-100 shrink-0"
              onError={(e) => e.target.src = "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=400&q=80"}
            />
            <div className="flex-1 min-w-0">
              <h4 className="m-0 text-[14px] font-bold text-[#1A1D20] truncate">{item.name}</h4>
              <p className="m-0 text-[12px] text-gray-500 mt-1">{item.quantity} kg x Rp {item.price?.toLocaleString('id-ID')}</p>
            </div>
            <div className="text-[15px] font-black text-[#3A2210]">
              Rp {(item.price * item.quantity).toLocaleString('id-ID')}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OrderItems;