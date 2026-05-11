import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarPetani from '../components/SidebarPetani';

const PesananPetani = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('SEMUA');
  
  // ==========================================
  // STATE BARU UNTUK PAGINATION
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Batas 5 pesanan per halaman

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initial = user?.name ? user.name.substring(0, 2).toUpperCase() : 'PT';

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders/incoming', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setOrders(result.data.reverse()); 
      }
    } catch (error) {
      console.error("Gagal mengambil data pesanan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token || user.role !== 'PETANI') {
      alert('Akses Ditolak: Halaman ini khusus untuk Petani Kopi.');
      navigate('/');
      return;
    }
    fetchOrders();
  }, []);

  // Jika tab filter berubah, kembalikan ke halaman 1
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleKirimPesanan = async (orderId) => {
    const inputResi = window.prompt("Masukkan Nomor Resi Pengiriman Kargo/Kurir (contoh: DAKOTA-12345):");
    if (!inputResi) return;

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/ship`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ waybillNumber: inputResi }) 
      });

      if (response.ok) {
        alert('Pesanan berhasil dikirim dan nomor resi telah disimpan!');
        fetchOrders(); 
      } else {
        const result = await response.json();
        alert(`Gagal mengirim pesanan: ${result.message}`);
      }
    } catch (error) {
      alert('Terjadi kesalahan pada server.');
    }
  };

  // Filter pesanan berdasarkan Tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'SEMUA') return true;
    return order.status === activeTab;
  });

  // ==========================================
  // LOGIKA MATEMATIKA PAGINATION
  // ==========================================
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  // Potong array data agar cuma 5 yang tampil
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'PENDING': { color: 'text-yellow-600', bg: 'bg-yellow-100', dot: 'bg-yellow-500', text: 'Menunggu Pembayaran' },
      'PAID': { color: 'text-blue-600', bg: 'bg-blue-100', dot: 'bg-blue-500', text: 'Perlu Diproses' },
      'SHIPPED': { color: 'text-indigo-600', bg: 'bg-indigo-100', dot: 'bg-indigo-500', text: 'Sedang Dikirim' },
      'COMPLETED': { color: 'text-emerald-600', bg: 'bg-emerald-100', dot: 'bg-emerald-500', text: 'Selesai' },
      'CANCELLED': { color: 'text-red-600', bg: 'bg-red-100', dot: 'bg-red-500', text: 'Dibatalkan' },
    };
    const config = statusConfig[status] || statusConfig['PENDING'];
    return (
      <span className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-[13px] font-semibold ${config.bg} ${config.color}`}>
        <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
        {config.text}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans text-[#1A1D20]">
      <SidebarPetani isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} activePage="pesanan" />

      <main className="flex-1 flex flex-col relative overflow-y-auto w-full">
        <header className="bg-white h-[80px] px-5 lg:px-10 flex justify-between items-center border-b border-[#EFEFEF] sticky top-0 z-50">
          <div className="text-[18px] lg:text-[22px] font-bold text-[#1A1D20]">Pesanan Masuk</div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 font-semibold text-[#1A1D20] px-4 py-2 bg-[#F8F9FA] rounded-full">
              <span>{user.name}</span>
              <div className="w-9 h-9 bg-[#A86431] text-white rounded-full flex items-center justify-center text-[14px] uppercase">{initial}</div>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-[#3A2210] bg-[#F8F9FA] rounded-lg">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>
        </header>

        <div className="p-5 lg:p-10 max-w-[1000px] mx-auto w-full box-border">
          
          <div className="bg-white p-2 rounded-xl shadow-sm border border-[#EFEFEF] flex overflow-x-auto mb-8 hide-scrollbar">
            {['SEMUA', 'PENDING', 'PAID', 'SHIPPED', 'COMPLETED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-lg font-semibold text-[14px] transition-all cursor-pointer ${
                  activeTab === tab ? 'bg-[#FDF9F5] text-[#A86431]' : 'bg-transparent text-[#6C757D] hover:bg-[#F8F9FA]'
                }`}
              >
                {tab === 'SEMUA' && 'Semua Pesanan'}
                {tab === 'PENDING' && 'Belum Dibayar'}
                {tab === 'PAID' && 'Perlu Diproses'}
                {tab === 'SHIPPED' && 'Sedang Dikirim'}
                {tab === 'COMPLETED' && 'Selesai'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            {isLoading ? (
              <div className="text-center py-10 text-[#A86431] font-semibold">Memuat daftar pesanan...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-[#EFEFEF] text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                <h3 className="text-lg font-bold text-[#1A1D20] mb-2">Belum Ada Pesanan</h3>
                <p className="text-[#6C757D]">Tidak ada pesanan yang sesuai dengan filter saat ini.</p>
              </div>
            ) : (
              <>
                {/* LOOPING HANYA UNTUK currentOrders (Maksimal 5) */}
                {currentOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#EFEFEF] overflow-hidden">
                    {/* Order Header */}
                    <div className="px-6 py-4 border-b border-[#EFEFEF] flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#FAFAFA]">
                      <div>
                        <div className="text-[13px] text-[#6C757D] font-medium mb-1">
                          Order ID: <span className="font-bold text-[#3A2210]">#{order.id.substring(0,8).toUpperCase()}</span>
                        </div>
                        <div className="text-[14px] font-bold text-[#1A1D20]">Pembeli: {order.user?.name || 'Kedai Kopi Senja'}</div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        <div className="text-[13px] text-[#6C757D]">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex gap-4 mb-4 pb-4 border-b border-[#EFEFEF] last:border-0 last:mb-0 last:pb-0">
                          <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            <img 
                              src={item.product?.imageUrl ? `http://localhost:5000${JSON.parse(item.product.imageUrl)[0] || item.product.imageUrl}` : 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=100&q=80'} 
                              alt={item.product?.name} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=100&q=80'}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-[#1A1D20] text-[15px] m-0 mb-1">{item.product?.name || 'Nama Produk'}</h4>
                            <div className="text-[13px] text-[#6C757D] mb-2">{item.quantity} Kg x Rp {(item.priceAtBuy || item.product?.price || 0).toLocaleString('id-ID')}</div>
                          </div>
                          <div className="font-bold text-[#A86431] text-[15px]">Rp {(item.quantity * (item.priceAtBuy || item.product?.price || 0)).toLocaleString('id-ID')}</div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="px-6 py-5 border-t border-[#EFEFEF] flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white">
                      <div>
                        <div className="text-[13px] text-[#6C757D] font-medium mb-1">Total Tagihan (Termasuk Ongkir & Biaya Layanan)</div>
                        <div className="text-[20px] font-bold text-[#1A1D20]">Rp {(order.totalAmount || 0).toLocaleString('id-ID')}</div>
                      </div>
                      
                      <div className="flex gap-3 w-full sm:w-auto">
                        {order.status === 'PAID' && (
                          <button onClick={() => handleKirimPesanan(order.id)} className="w-full sm:w-auto px-6 py-2.5 bg-[#3A2210] hover:bg-[#A86431] text-white rounded-lg font-semibold text-[14px] transition-colors shadow-sm">
                            Kirim Pesanan
                          </button>
                        )}
                        {order.status === 'SHIPPED' && (
                          <button disabled className="w-full sm:w-auto px-6 py-2.5 bg-[#F8F9FA] text-[#6C757D] border border-[#EFEFEF] rounded-lg font-semibold text-[14px] cursor-not-allowed">
                            Menunggu Konfirmasi Pembeli
                          </button>
                        )}
                        {order.status === 'PENDING' && (
                          <button disabled className="w-full sm:w-auto px-6 py-2.5 bg-[#F8F9FA] text-[#6C757D] border border-[#EFEFEF] rounded-lg font-semibold text-[14px] cursor-not-allowed">
                            Menunggu Pembayaran
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* ========================================== */}
                {/* KOMPONEN TOMBOL PAGINATION                 */}
                {/* ========================================== */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-4 bg-white p-4 rounded-xl border border-[#EFEFEF] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <span className="text-[13px] text-[#6C757D] mb-4 sm:mb-0 font-medium">
                      Menampilkan {indexOfFirstOrder + 1} - {Math.min(indexOfLastOrder, filteredOrders.length)} dari {filteredOrders.length} pesanan
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-[#EFEFEF] text-[13px] font-semibold text-[#1A1D20] disabled:opacity-40 hover:bg-[#F8F9FA] transition-colors"
                      >
                        &laquo; Prev
                      </button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg text-[13px] font-bold flex items-center justify-center transition-colors ${
                              currentPage === page 
                                ? 'bg-[#3A2210] text-white' 
                                : 'text-[#6C757D] hover:bg-[#F8F9FA]'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-lg border border-[#EFEFEF] text-[13px] font-semibold text-[#1A1D20] disabled:opacity-40 hover:bg-[#F8F9FA] transition-colors"
                      >
                        Next &raquo;
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PesananPetani;