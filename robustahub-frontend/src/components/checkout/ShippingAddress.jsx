const ShippingAddress = ({ user }) => {
  return (
    <section className="bg-white border border-[#EFEFEF] rounded-xl p-6 mb-6">
      <h2 className="text-[16px] font-bold m-0 mb-4 flex items-center gap-2 text-[#A86431]">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        Alamat Pengiriman
      </h2>
      <div className="border border-[#F3E8DF] bg-[#FDF9F5] p-4 rounded-lg">
        <p className="font-bold text-[15px] mb-1 text-[#1A1D20]">{user.name} ({user.phone || 'No. HP belum diatur'})</p>
        <p className="text-[14px] text-[#6C757D] leading-[1.5] m-0">
          {user.address || 'Alamat belum lengkap. Silakan lengkapi di profil.'}
        </p>
      </div>
    </section>
  );
};

export default ShippingAddress;