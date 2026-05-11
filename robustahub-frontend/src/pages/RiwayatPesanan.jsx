import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const RiwayatPesanan = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('SEMUA');
  
  // State untuk Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State Dropdown Resi
  const [expandedResi, setExpandedResi] = useState(null);

  // ==========================================
  // STATE BARU: Custom Pop-up & Toast Notification
  // ==========================================
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null });
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  const token = localStorage.getItem('token');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setOrders(result.data); 
      }
    } catch (error) {
      console.error("Gagal mengambil riwayat pesanan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setExpandedResi(null); 
  }, [activeTab]);

  // Fungsi untuk memunculkan Toast Notifikasi
  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
    setTimeout(() => setToast({ isOpen: false, message: '', type: 'success' }), 3500); // Hilang dalam 3.5 detik
  };

  // Fungsi Pemicu Pop-up Konfirmasi
  const triggerPesananDiterima = (orderId) => {
    setConfirmModal({ isOpen: true, orderId });
  };

  // Fungsi EKSEKUSI saat menekan "Ya, Selesaikan" di Pop-up
  // Fungsi EKSEKUSI saat menekan "Ya, Selesaikan" di Pop-up
  const executePesananDiterima = async () => {
    const orderId = confirmModal.orderId;
    setConfirmModal({ isOpen: false, orderId: null }); // Tutup pop-up
    
    try {
      // Kita ganti method menjadi PUT dan pastikan Content-Type terkirim
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/complete`, {
        method: 'PUT', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (response.ok) {
        showToast('Terima kasih! Pesanan telah diselesaikan.', 'success');
        fetchOrders(); 
      } else {
        // Logika aman untuk membaca pesan error
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          showToast(`Gagal: ${errorData.message}`, 'error');
        } catch (e) {
          showToast(`Error 500: Server gagal memproses permintaan.`, 'error');
        }
      }
    } catch (error) {
      console.error("Network Error:", error);
      showToast(`Error Jaringan: ${error.message}`, 'error');
    }
  };

  const toggleResi = (orderId) => {
    if (expandedResi === orderId) setExpandedResi(null);
    else setExpandedResi(orderId);
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'SEMUA') return true;
    return order.status === activeTab;
  });

  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const StatusBadge = ({ status }) => {
    const config = {
      'PENDING': { bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]', label: 'Belum Dibayar', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      'PAID': { bg: 'bg-[#EFF6FF]', text: 'text-[#3B82F6]', label: 'Sedang Diproses', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      'SHIPPED': { bg: 'bg-[#E0F2FE]', text: 'text-[#2563EB]', label: 'Sedang Dikirim', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
      'COMPLETED': { bg: 'bg-[#E1F8EF]', text: 'text-[#10B981]', label: 'Selesai', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      'CANCELLED': { bg: 'bg-[#FEF2F2]', text: 'text-[#EF4444]', label: 'Dibatalkan', icon: 'M6 18L18 6M6 6l12 12' }
    };
    const style = config[status] || config['PENDING'];

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold ${style.bg} ${style.text}`}>
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={style.icon}></path></svg>
        {style.label}
      </span>
    );
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-[#1A1D20]">
      <Navbar />

      <main className="max-w-[900px] mx-auto px-[5%] py-10">
        
        <div className="mb-8">
          <Link to="/katalog" className="inline-flex items-center gap-2 text-[#6C757D] font-medium text-[15px] mb-6 hover:text-[#A86431] transition-colors no-underline">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Kembali ke Katalog
          </Link>
          <h1 className="text-[28px] font-bold m-0 mb-2 text-[#3A2210]">Riwayat Pesanan</h1>
          <p className="text-[#6C757D] m-0">Pantau status transaksi dan pengiriman biji kopi Anda di sini.</p>
        </div>

        <div className="flex gap-4 mb-6 overflow-x-auto pb-2 border-b border-[#EFEFEF] hide-scrollbar">
          {['SEMUA', 'PENDING', 'PAID', 'SHIPPED', 'COMPLETED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-semibold text-[15px] whitespace-nowrap border-b-[3px] transition-colors cursor-pointer bg-transparent ${
                activeTab === tab 
                  ? 'text-[#A86431] border-[#A86431]' 
                  : 'text-[#6C757D] border-transparent hover:text-[#1A1D20]'
              }`}
            >
              {tab === 'SEMUA' && 'Semua Pesanan'}
              {tab === 'PENDING' && 'Menunggu Pembayaran'}
              {tab === 'PAID' && 'Diproses'}
              {tab === 'SHIPPED' && 'Dikirim'}
              {tab === 'COMPLETED' && 'Selesai'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          {isLoading ? (
            <div className="text-center py-10 text-[#A86431] font-semibold">Memuat riwayat pesanan...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-[#EFEFEF] text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              <h3 className="text-lg font-bold text-[#1A1D20] mb-2">Belum Ada Pesanan</h3>
              <p className="text-[#6C757D]">Mulai berbelanja biji kopi untuk melihat riwayat Anda.</p>
            </div>
          ) : (
            currentOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-[16px] border border-[#EFEFEF] overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.02)] transition-all">
                
                <div className="p-4 md:px-6 flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-[#EFEFEF] bg-[#FAFAFA]">
                  <div className="flex items-center gap-2 font-semibold text-[#1A1D20] text-[14px]">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="text-[#A86431]"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                    Pesanan #{order.id.substring(0,8).toUpperCase()}
                    <span className="text-[#6C757D] font-normal text-[13px] ml-2 hidden md:inline">
                      • {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="p-6 flex flex-col gap-4 border-b border-dashed border-[#EFEFEF]">
                  {order.items?.map((item, idx) => {
                    const backendUrl = "http://localhost:5000";
                    let finalImageUrl = "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=150&q=80";

                    if (item.product?.imageUrl) {
                      try {
                        const parsedImage = JSON.parse(item.product.imageUrl);
                        if (Array.isArray(parsedImage) && parsedImage.length > 0) {
                          finalImageUrl = `${backendUrl}${parsedImage[0]}`;
                        } else {
                          finalImageUrl = `${backendUrl}${item.product.imageUrl}`;
                        }
                      } catch (e) {
                        finalImageUrl = `${backendUrl}${item.product.imageUrl}`;
                      }
                    }

                    return (
                      <div key={idx} className="flex gap-5 items-start">
                        <div className="w-[80px] h-[80px] rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          <img src={finalImageUrl} alt={item.product?.name} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=150&q=80'}/>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[16px] text-[#1A1D20] m-0 mb-1">{item.product?.name || 'Produk Kopi'}</h4>
                          <p className="text-[14px] text-[#6C757D] m-0 mb-2">{item.quantity} Kg x Rp {(item.priceAtBuy || 0).toLocaleString('id-ID')}</p>
                          <p className="font-semibold text-[#3A2210] m-0">Rp {(item.quantity * (item.priceAtBuy || 0)).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-5 md:px-6 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white">
                  <div className="flex flex-col">
                    <span className="text-[13px] text-[#6C757D] mb-1">Total Belanja (Termasuk Ongkir)</span>
                    <span className="text-[18px] font-bold text-[#A86431]">Rp {order.totalAmount?.toLocaleString('id-ID')}</span>
                  </div>
                  
                  <div className="flex gap-3 w-full md:w-auto">
                    {order.status === 'PENDING' && order.payment[0]?.paymentUrl && (
                      <button onClick={() => window.location.href = order.payment[0].paymentUrl} className="w-full md:w-auto px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg font-bold text-[14px] transition-colors cursor-pointer border-none shadow-sm">
                        Bayar Sekarang
                      </button>
                    )}

                    {order.status === 'SHIPPED' && (
                      <>
                        <button onClick={() => toggleResi(order.id)} className="w-full md:w-auto px-5 py-2.5 bg-white border border-[#EFEFEF] text-[#1A1D20] hover:bg-gray-50 rounded-lg font-semibold text-[14px] transition-colors cursor-pointer shadow-sm">
                          {expandedResi === order.id ? 'Tutup Resi' : 'Cek Resi'}
                        </button>
                        <button onClick={() => triggerPesananDiterima(order.id)} className="w-full md:w-auto px-5 py-2.5 bg-[#3A2210] hover:bg-[#A86431] text-white rounded-lg font-bold text-[14px] transition-colors cursor-pointer border-none shadow-sm">
                          Pesanan Diterima
                        </button>
                      </>
                    )}

                    {order.status === 'COMPLETED' && (
                      <Link to="/katalog" className="w-full md:w-auto px-5 py-2.5 bg-[#3A2210] text-white rounded-lg font-bold text-[14px] hover:bg-[#A86431] transition-colors text-center no-underline border-none shadow-sm">
                        Beli Lagi
                      </Link>
                    )}
                  </div>
                </div>

                {/* Dropdown Resi Pengiriman */}
                {expandedResi === order.id && (
                  <div className="bg-[#FFFBEB] p-5 md:px-6 border-t border-[#F59E0B]/20 transition-all duration-300">
                    <p className="text-[13px] font-semibold text-[#A86431] m-0 mb-3 flex items-center gap-2">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
                      Informasi Pengiriman
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 bg-white p-4 rounded-xl border border-[#EFEFEF]">
                      <div>
                        <span className="text-[12px] text-[#6C757D] block mb-1">Kurir / Kargo</span>
                        <span className="text-[15px] font-bold text-[#1A1D20]">{order.shipment?.courierName || 'Kargo Internal'}</span>
                      </div>
                      <div className="hidden sm:block w-[1px] h-8 bg-[#EFEFEF]"></div>
                      <div>
                        <span className="text-[12px] text-[#6C757D] block mb-1">Nomor Resi</span>
                        <span className="text-[15px] font-bold text-[#1A1D20] tracking-wider bg-[#F8F9FA] px-2 py-1 rounded border border-[#EFEFEF]">
                          {order.shipment?.waybillNumber || 'Menunggu Update'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 bg-white p-4 rounded-xl border border-[#EFEFEF]">
            <span className="text-[13px] text-[#6C757D] mb-4 sm:mb-0 font-medium">
              Menampilkan {indexOfFirstOrder + 1} - {Math.min(indexOfLastOrder, filteredOrders.length)} dari {filteredOrders.length}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border border-[#EFEFEF] text-[13px] font-semibold text-[#1A1D20] disabled:opacity-40 hover:bg-[#F8F9FA] transition-colors cursor-pointer">
                &laquo; Prev
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-[13px] font-bold flex items-center justify-center transition-colors cursor-pointer ${currentPage === page ? 'bg-[#3A2210] text-white' : 'text-[#6C757D] hover:bg-[#F8F9FA]'}`}>
                    {page}
                  </button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border border-[#EFEFEF] text-[13px] font-semibold text-[#1A1D20] disabled:opacity-40 hover:bg-[#F8F9FA] transition-colors cursor-pointer">
                Next &raquo;
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* MODAL CUSTOM KONFIRMASI PESANAN DITERIMA */}
      {/* ========================================================= */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex flex-col items-center text-center">
            
            <div className="w-16 h-16 bg-[#E1F8EF] text-[#10B981] rounded-full flex items-center justify-center mb-4">
              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            
            <h3 className="text-[20px] font-bold text-[#1A1D20] m-0 mb-2">Konfirmasi Penerimaan</h3>
            <p className="text-[14px] text-[#6C757D] m-0 mb-6 leading-relaxed">
              Apakah Anda yakin biji kopi telah sampai dan diterima dengan baik? Jika dilanjutkan, dana akan diteruskan ke Petani dan status menjadi Selesai.
            </p>
            
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setConfirmModal({ isOpen: false, orderId: null })}
                className="flex-1 py-3 bg-white border border-[#EFEFEF] rounded-xl font-bold text-[14px] text-[#6C757D] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={executePesananDiterima}
                className="flex-1 py-3 bg-[#10B981] border-none rounded-xl font-bold text-[14px] text-white hover:bg-[#059669] transition-colors cursor-pointer shadow-sm"
              >
                Ya, Selesaikan
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TOAST NOTIFICATION */}
      {/* ========================================================= */}
      {toast.isOpen && (
        <div className="fixed bottom-6 right-6 z-[300] animate-fade-in-up">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-l-4 bg-white ${toast.type === 'success' ? 'border-[#10B981]' : 'border-[#EF4444]'}`}>
            {toast.type === 'success' ? (
              <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            ) : (
              <svg className="w-6 h-6 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            )}
            <p className="m-0 text-[14px] font-semibold text-[#1A1D20]">{toast.message}</p>
            <button onClick={() => setToast({ isOpen: false, message: '', type: 'success' })} className="ml-2 bg-none border-none text-gray-400 hover:text-gray-700 cursor-pointer p-1">
              &times;
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default RiwayatPesanan;