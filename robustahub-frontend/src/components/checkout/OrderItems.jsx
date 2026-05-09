const OrderItems = ({ items }) => {
  return (
    <section className="bg-white border border-[#EFEFEF] rounded-xl p-6">
      <h2 className="text-[16px] font-bold m-0 mb-4 flex items-center gap-2 text-[#1A1D20]">
        Rincian Produk
      </h2>
      <div className="flex flex-col gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-4 pb-4 border-b border-[#EFEFEF] last:border-0 last:pb-0">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-16 h-16 rounded-lg object-cover border border-[#EFEFEF]" 
            />
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="font-bold text-[15px] text-[#1A1D20] m-0 mb-1">{item.name}</h4>
              <p className="text-[13px] text-[#6C757D] m-0">{item.quantity} Kg x Rp {item.price.toLocaleString('id-ID')}</p>
            </div>
            <div className="font-bold text-[#3A2210] flex items-center text-[15px]">
              Rp {(item.price * item.quantity).toLocaleString('id-ID')}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OrderItems;