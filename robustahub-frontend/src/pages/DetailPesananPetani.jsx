import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarPetani from '../components/SidebarPetani';

const DetailPesananPetani = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Ambil data order yang dikirim dari halaman Pesanan Masuk
  const order = location.state?.order;
  
  const [resi, setResi] = useState(order?.shipment?.waybillNumber || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initial = user?.name ? user.name.substring(0, 2).toUpperCase() : 'PT';

  // Jika tidak ada data order (misal user refresh halaman), kembali ke halaman sebelumnya
  useEffect(() => {
    if (!order) navigate(-1);
  }, [order, navigate]);

  if (!order) return null;

  // Hitung Pendapatan Bersih Petani (Total Belanja dikurangi Ongkir)
  const ongkir = order.shipment?.shippingCost || 0;
  const pendapatanBersih = order.totalAmount - ongkir;

  const handleKirimPesanan = async (e) => {
    e.preventDefault();
    if (!resi.trim()) return alert('Mohon masukkan nomor resi!');

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${order.id}/ship`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ waybillNumber: resi }) 
      });

      if (response.ok) {
        alert('Pesanan berhasil diperbarui menjadi Dikirim!');
        navigate(-1); // Kembali ke daftar pesanan otomatis setelah sukses
      } else {
        const result = await response.json();
        alert(`Gagal: ${result.message}`);
      }
    } catch (error) {
      alert('Terjadi kesalahan pada server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans text-[#1A1D20]">
      
      <SidebarPetani isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} activePage="pesanan" />

      <main className="flex-1 flex flex-col relative overflow-y-auto w-full">
        
        <header className="bg-white h-[80px] px-5 lg:px-10 flex justify-between items-center border-b border-[#EFEFEF] sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-[#3A2210] bg-[#F8F9FA] rounded-lg">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <div className="text-[18px] lg:text-[22px] font-bold text-[#1A1D20]">Detail Pesanan</div>
          </div>
          <div className="hidden lg:flex items-center gap-3 font-semibold text-[#1A1D20] px-4 py-2 bg-[#F8F9FA] rounded-full">
            <span>{user.name}</span>
            <div className="w-9 h-9 bg-[#A86431] text-white rounded-full flex items-center justify-center text-[14px] uppercase">{initial}</div>
          </div>
        </header>

        <div className="p-5 lg:p-10 max-w-[1200px] mx-auto w-full box-border">
          
          {/* TOMBOL KEMBALI MENGGUNAKAN NAVIGATE(-1) */}
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-2 text-[#6C757D] font-medium text-[15px] mb-6 hover:text-[#A86431] transition-colors bg-transparent border-none cursor-pointer outline-none p-0"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Kembali ke Daftar Pesanan
          </button>

          {/* Card Header Status */}
          <div className="bg-white rounded-2xl border border-[#EFEFEF] p-6 lg:p-8 mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
            <div>
              <h1 className="text-[24px] font-bold text-[#3A2210] m-0 mb-2">#{order.id.substring(0,8).toUpperCase()}</h1>
              <p className="text-[#6C757D] text-[14px] m-0 flex items-center gap-2">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Dipesan pada: {new Date(order.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
              </p>
            </div>
            <div className={`px-4 py-2.5 rounded-full font-bold text-[14px] flex items-center gap-2 border 
              ${order.status === 'PAID' ? 'bg-[#FEF3C7] text-[#F59E0B] border-[#FCD34D]' : 
                order.status === 'SHIPPED' ? 'bg-[#EFF6FF] text-[#3B82F6] border-[#BFDBFE]' : 
                order.status === 'CANCELLED' ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FCA5A5]' :
                'bg-[#E1F8EF] text-[#10B981] border-[#A7F3D0]'}`}>
              {order.status === 'PAID' && <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>}
              {order.status === 'PAID' ? 'Perlu Diproses / Dikemas' : 
               order.status === 'SHIPPED' ? 'Sedang Dikirim' : 
               order.status === 'CANCELLED' ? 'Pesanan Dibatalkan' : 'Selesai'}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
            
            {/* Kolom Kiri: Detail Pengiriman & Barang */}
            <div className="flex flex-col gap-6">
              
              {/* Info Pengiriman & Pembeli */}
              <div className="bg-white rounded-2xl border border-[#EFEFEF] shadow-[0_4px_15px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="p-5 border-b border-[#EFEFEF] bg-[#FAFAFA] font-bold text-[16px] text-[#3A2210] flex items-center gap-2.5">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="text-[#A86431]"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  Informasi Pengiriman (Pembeli)
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#FDF9F5] text-[#A86431] flex items-center justify-center shrink-0">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                      <h4 className="text-[16px] font-bold text-[#1A1D20] m-0 mb-1">{order.buyer?.name || 'Nama Tidak Diketahui'}</h4>
                      <p className="text-[14px] text-[#6C757D] m-0 mb-2 leading-relaxed">{order.buyer?.address || 'Alamat belum diatur oleh pembeli.'}</p>
                      <p className="text-[14px] font-bold text-[#A86431] m-0">{order.buyer?.phone || 'No. HP tidak tersedia'}</p>
                    </div>
                  </div>
                  
                  <div className="p-3.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-[#1E3A8A] text-[13px] font-semibold flex items-center gap-2">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Pembeli menggunakan kurir: {order.shipment?.courierName || 'Kargo Internal'}
                  </div>
                </div>
              </div>

              {/* Rincian Barang */}
              <div className="bg-white rounded-2xl border border-[#EFEFEF] shadow-[0_4px_15px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="p-5 border-b border-[#EFEFEF] bg-[#FAFAFA] font-bold text-[16px] text-[#3A2210] flex items-center gap-2.5">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="text-[#A86431]"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                  Rincian Barang
                </div>
                <div className="p-6">
                  {order.items?.map((item, idx) => {
                    const backendUrl = "http://localhost:5000";
                    let finalImageUrl = "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=150&q=80";
                    if (item.product?.imageUrl) {
                      try {
                        const parsedImage = JSON.parse(item.product.imageUrl);
                        finalImageUrl = Array.isArray(parsedImage) ? `${backendUrl}${parsedImage[0]}` : `${backendUrl}${item.product.imageUrl}`;
                      } catch (e) { finalImageUrl = `${backendUrl}${item.product.imageUrl}`; }
                    }

                    return (
                      <div key={idx} className="flex gap-4 pb-4 mb-4 border-b border-[#EFEFEF] last:border-0 last:pb-0 last:mb-0">
                        <img src={finalImageUrl} alt="Kopi" className="w-16 h-16 rounded-lg object-cover border border-[#EFEFEF]" />
                        <div className="flex-1">
                          <h5 className="text-[15px] font-bold text-[#1A1D20] m-0 mb-1">{item.product?.name}</h5>
                          <p className="text-[13px] text-[#6C757D] m-0">{item.quantity} Kg x Rp {(item.priceAtBuy || 0).toLocaleString('id-ID')}</p>
                        </div>
                        <div className="text-[15px] font-bold text-[#3A2210]">Rp {(item.quantity * (item.priceAtBuy || 0)).toLocaleString('id-ID')}</div>
                      </div>
                    );
                  })}

                  <div className="mt-6 pt-5 border-t border-dashed border-[#EFEFEF] flex justify-between items-center">
                    <span className="text-[15px] text-[#6C757D] font-medium">Pendapatan Bersih Anda (Dipotong Ongkir)</span>
                    <span className="text-[20px] font-bold text-[#10B981]">Rp {pendapatanBersih.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Kolom Kanan: Form Input Resi */}
            {order.status === 'PAID' && (
              <div className="bg-white p-6 lg:p-8 rounded-2xl border-2 border-[#A86431] shadow-[0_8px_24px_rgba(168,100,49,0.08)] sticky top-[100px]">
                <div className="w-12 h-12 bg-[#FDF9F5] text-[#A86431] rounded-xl flex items-center justify-center mb-4">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                </div>
                <h3 className="text-[18px] font-bold text-[#3A2210] m-0 mb-2">Kirim Pesanan</h3>
                <p className="text-[14px] text-[#6C757D] m-0 mb-6 leading-relaxed">
                  Kemas barang Anda dan serahkan ke pihak ekspedisi. Masukkan nomor resi di bawah ini untuk mengubah status pesanan.
                </p>

                <form onSubmit={handleKirimPesanan}>
                  <div className="mb-4">
                    <label className="block text-[13px] font-bold text-[#1A1D20] mb-2">Jasa Ekspedisi</label>
                    <input 
                      type="text" 
                      value={order.shipment?.courierName || 'Kargo'} 
                      disabled 
                      className="w-full p-3.5 border border-[#EFEFEF] rounded-lg bg-[#F8F9FA] text-[#6C757D] text-[14px] cursor-not-allowed outline-none" 
                    />
                    <small className="text-[11px] text-gray-400 mt-1 block">*Ekspedisi dipilih oleh pembeli.</small>
                  </div>
                  <div className="mb-6">
                    <label className="block text-[13px] font-bold text-[#1A1D20] mb-2">Nomor Resi Pengiriman</label>
                    <input 
                      type="text" 
                      required
                      value={resi}
                      onChange={(e) => setResi(e.target.value)}
                      placeholder="Contoh: DKT-8829103982" 
                      className="w-full p-3.5 border border-[#EFEFEF] rounded-lg text-[14px] outline-none focus:border-[#A86431] focus:shadow-[0_0_0_3px_rgba(168,100,49,0.1)] transition-all" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#3A2210] text-white border-none rounded-lg font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer hover:bg-[#A86431] hover:-translate-y-0.5 transition-all shadow-sm disabled:opacity-50"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    {isSubmitting ? 'Memproses...' : 'Konfirmasi Pengiriman'}
                  </button>
                </form>
              </div>
            )}

            {order.status !== 'PAID' && (
              <div className="bg-[#F8F9FA] p-6 lg:p-8 rounded-2xl border border-[#EFEFEF] text-center">
                <h3 className="text-[16px] font-bold text-[#1A1D20] mb-2">Status: {order.status}</h3>
                <p className="text-[14px] text-[#6C757D]">
                  {order.status === 'SHIPPED' ? `Pesanan telah dikirim dengan resi: ${order.shipment?.waybillNumber}` : 
                   order.status === 'CANCELLED' ? `Dibatalkan dengan alasan: ${order.cancelReason}` :
                   'Pesanan ini tidak dapat diubah lagi.'}
                </p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailPesananPetani;