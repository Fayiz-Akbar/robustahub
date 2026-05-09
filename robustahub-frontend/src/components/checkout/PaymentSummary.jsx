const PaymentSummary = ({ 
  totalProductPrice, 
  shippingCost, 
  serviceFee, 
  onPay, 
  isLoading, 
  isAddressComplete 
}) => {
  const grandTotal = totalProductPrice + shippingCost + serviceFee;

  return (
    <div className="bg-white border border-[#EFEFEF] rounded-[16px] p-[32px] sticky top-[100px]">
      <h3 className="text-[20px] font-bold text-[#1A1D20] m-0 mb-6 pb-4 border-b border-[#EFEFEF]">
        Ringkasan Pembayaran
      </h3>
      
      {/* Jarak antar baris diperbaiki sesuai HTML */}
      <div className="flex justify-between items-center mb-4 text-[15px] text-[#6C757D]">
        <span>Total Harga Barang</span>
        <span className="font-semibold text-[#1A1D20]">Rp {totalProductPrice.toLocaleString('id-ID')}</span>
      </div>
      <div className="flex justify-between items-center mb-4 text-[15px] text-[#6C757D]">
        <span>Total Ongkos Kirim (70Kg)</span>
        <span className="font-semibold text-[#1A1D20]">Rp {shippingCost.toLocaleString('id-ID')}</span>
      </div>
      <div className="flex justify-between items-center text-[15px] text-[#6C757D]">
        <span>Biaya Layanan RobustaHub</span>
        <span className="font-semibold text-[#1A1D20]">Rp {serviceFee.toLocaleString('id-ID')}</span>
      </div>

      {/* Garis putus-putus sesuai HTML */}
      <div className="flex justify-between items-center mt-6 pt-6 border-t border-dashed border-[#EFEFEF]">
        <span className="text-[20px] font-bold text-[#1A1D20]">Total Tagihan</span>
        <span className="text-[20px] font-bold text-[#3A2210]">Rp {grandTotal.toLocaleString('id-ID')}</span>
      </div>

      {/* Tombol kembali ke warna Hijau (Success) */}
      <button 
        onClick={onPay}
        disabled={isLoading || !isAddressComplete}
        className="w-full mt-8 p-[18px] bg-[#10B981] text-white rounded-[12px] font-bold text-[16px] cursor-pointer flex justify-center items-center gap-2 border-none transition-all hover:bg-[#059669] hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(16,185,129,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
      >
        {isLoading ? "Memproses..." : (
          <>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Bayar Sekarang
          </>
        )}
      </button>
      
      {/* Teks persetujuan di bawah tombol */}
      <p className="text-center text-[13px] text-[#6C757D] mt-4 leading-[1.5]">
        Dengan menekan tombol di atas, Anda menyetujui <a href="#" className="text-[#A86431] no-underline hover:underline">Syarat & Ketentuan</a> yang berlaku.
      </p>
    </div>
  );
};

export default PaymentSummary;