import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const LacakPesanan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  // Jika tidak ada data order yang dikirim, kembalikan ke riwayat
  useEffect(() => {
    if (!order) {
      navigate('/riwayat');
    }
  }, [order, navigate]);

  if (!order) return null;

  // Membuat tanggal dummy yang logis berdasarkan tanggal pembuatan order
  const orderDate = new Date(order.createdAt);
  
  const addHours = (date, hours) => new Date(date.getTime() + hours * 60 * 60 * 1000);
  
  const time1 = orderDate; // Pesanan dibuat
  const time2 = addHours(orderDate, 24); // Diserahkan logistik
  const time3 = addHours(orderDate, 36); // Berangkat dari gudang asal
  const time4 = addHours(orderDate, 48); // Tiba di fasilitas sortir

  // Fungsi untuk mengarahkan ke web kurir asli
  const cekWebResmi = () => {
    const courier = order.shipment?.courierName?.toLowerCase() || '';
    const resi = order.shipment?.waybillNumber || '';
    
    if (courier.includes('dakota')) {
      window.open(`https://www.dakotacargo.co.id/`, '_blank');
    } else if (courier.includes('indah')) {
      window.open(`https://indahonline.com/`, '_blank');
    } else {
      window.open(`https://cekresi.com/?noresi=${resi}`, '_blank');
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-[#1A1D20]">
      <Navbar />

      <main className="max-w-[800px] mx-auto px-[5%] py-10">
        
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-2 text-[#6C757D] font-medium text-[15px] mb-6 hover:text-[#A86431] transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali ke Riwayat Pesanan
        </button>

        {/* HEADER TRACKING */}
        <div className="bg-white rounded-2xl border border-[#EFEFEF] p-6 md:p-8 mb-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div>
            <h1 className="text-[20px] md:text-[24px] font-bold text-[#3A2210] m-0 mb-2">
              No. Resi: <span className="tracking-wider uppercase">{order.shipment?.waybillNumber || 'BELUM TERSEDIA'}</span>
            </h1>
            <p className="text-[#6C757D] text-[14px] md:text-[15px] m-0 flex items-center gap-2">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
              Dikirim via {order.shipment?.courierName || 'Kargo'} • {order.items?.length || 0} Varian Kopi
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className={`px-4 py-2.5 rounded-full font-bold text-[14px] flex items-center gap-2 border 
              ${order.status === 'COMPLETED' ? 'bg-[#E1F8EF] text-[#10B981] border-[#A7F3D0]' : 'bg-[#EFF6FF] text-[#3B82F6] border-[#BFDBFE]'}`}>
              {order.status !== 'COMPLETED' && <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse"></div>}
              {order.status === 'COMPLETED' ? 'Pesanan Telah Diterima' : 'Sedang Dalam Perjalanan'}
            </div>
            
            <button onClick={cekWebResmi} className="text-[#A86431] text-[13px] font-semibold bg-transparent border border-[#A86431] px-3 py-1.5 rounded-lg cursor-pointer hover:bg-[#FDF9F5] transition-colors">
              Lacak di Web Kurir Asli &rarr;
            </button>
          </div>
        </div>

        {/* TIMELINE PENGIRIMAN */}
        <div className="bg-white rounded-2xl border border-[#EFEFEF] p-6 md:p-10 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
          
          <div className="relative pl-8">
            {/* Garis Abu-abu (Background) */}
            <div className="absolute left-[11px] top-2.5 bottom-2.5 w-[2px] bg-[#EFEFEF]"></div>
            {/* Garis Hijau (Progress) - 50% jika belum selesai, 100% jika sudah */}
            <div className={`absolute left-[11px] top-2.5 w-[2px] bg-[#10B981] z-10 transition-all duration-1000 ${order.status === 'COMPLETED' ? 'h-full' : 'h-[50%]'}`}></div>

            {/* ITEM 4 (Tiba di Sortir / Diterima) */}
            <div className="relative mb-8 last:mb-0">
              <div className={`absolute -left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center z-20 ${order.status === 'COMPLETED' ? 'bg-[#10B981] border-2 border-[#10B981] text-white' : 'bg-white border-4 border-[#10B981]'}`}>
                {order.status === 'COMPLETED' && <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>}
              </div>
              <div className="pl-4">
                <h4 className={`font-bold text-[16px] m-0 mb-1.5 ${order.status === 'COMPLETED' ? 'text-[#10B981]' : 'text-[#3B82F6]'}`}>
                  {order.status === 'COMPLETED' ? 'Paket Telah Diterima' : 'Paket Tiba di Fasilitas Sortir Transit'}
                </h4>
                <p className="text-[14px] text-[#6C757D] m-0 mb-2 leading-relaxed">
                  {order.status === 'COMPLETED' 
                    ? 'Pesanan telah diterima oleh pembeli dan transaksi telah diselesaikan.' 
                    : 'Paket sedang dalam proses penyortiran di gudang transit kota tujuan.'}
                </p>
                <div className="text-[13px] text-[#9CA3AF] font-medium flex items-center gap-1.5">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {order.status === 'COMPLETED' ? new Date(order.updatedAt).toLocaleString('id-ID', {day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'}) : time4.toLocaleString('id-ID', {day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})} WIB
                </div>
              </div>
            </div>

            {/* ITEM 3 (Berangkat dari Asal) */}
            <div className="relative mb-8 last:mb-0">
              <div className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-[#10B981] border-2 border-[#10B981] text-white z-20 flex items-center justify-center">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div className="pl-4">
                <h4 className="font-bold text-[16px] text-[#1A1D20] m-0 mb-1.5">Paket Berangkat dari Gudang Asal</h4>
                <p className="text-[14px] text-[#6C757D] m-0 mb-2 leading-relaxed">Paket telah diberangkatkan dari fasilitas logistik penjual (Lampung) menuju kota tujuan.</p>
                <div className="text-[13px] text-[#9CA3AF] font-medium flex items-center gap-1.5">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {time3.toLocaleString('id-ID', {day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})} WIB
                </div>
              </div>
            </div>

            {/* ITEM 2 (Diserahkan ke Kurir) */}
            <div className="relative mb-8 last:mb-0">
              <div className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-[#10B981] border-2 border-[#10B981] text-white z-20 flex items-center justify-center">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div className="pl-4">
                <h4 className="font-bold text-[16px] text-[#1A1D20] m-0 mb-1.5">Paket Diserahkan ke Pihak Logistik</h4>
                <p className="text-[14px] text-[#6C757D] m-0 mb-2 leading-relaxed">Penjual telah menyerahkan paket ke agen {order.shipment?.courierName || 'Kargo'} dan nomor resi telah diinput.</p>
                <div className="text-[13px] text-[#9CA3AF] font-medium flex items-center gap-1.5">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {time2.toLocaleString('id-ID', {day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})} WIB
                </div>
              </div>
            </div>

            {/* ITEM 1 (Pesanan Dibuat) */}
            <div className="relative mb-8 last:mb-0">
              <div className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-[#10B981] border-2 border-[#10B981] text-white z-20 flex items-center justify-center">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div className="pl-4">
                <h4 className="font-bold text-[16px] text-[#1A1D20] m-0 mb-1.5">Pesanan Dibuat & Dibayar</h4>
                <p className="text-[14px] text-[#6C757D] m-0 mb-2 leading-relaxed">Pembayaran telah diverifikasi. Pesanan diteruskan ke penjual untuk dikemas.</p>
                <div className="text-[13px] text-[#9CA3AF] font-medium flex items-center gap-1.5">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {time1.toLocaleString('id-ID', {day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})} WIB
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};

export default LacakPesanan;