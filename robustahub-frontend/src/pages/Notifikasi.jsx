import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Notifikasi = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchNotifs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setNotifications(result.data);
      }
    } catch (error) {
      console.error("Gagal ambil notif:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    fetchNotifs();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifs(); // Refresh data
    } catch (error) { console.error(error); }
  };

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return; // Jika sudah dibaca, jangan nembak API lagi
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifs();
    } catch (error) { console.error(error); }
  };

  const getIconConfig = (type) => {
    if (type === 'delivery') return { bg: 'bg-[#EFF6FF]', color: 'text-[#3B82F6]', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path> };
    if (type === 'success') return { bg: 'bg-[#E1F8EF]', color: 'text-[#10B981]', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path> };
    if (type === 'warning') return { bg: 'bg-[#FEF2F2]', color: 'text-[#EF4444]', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> };
    return { bg: 'bg-[#F8F9FA]', color: 'text-[#1A1D20]', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> };
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-[#1A1D20]">
      <Navbar />

      <main className="max-w-[800px] mx-auto px-[5%] py-10">
        <Link to="/katalog" className="inline-flex items-center gap-2 text-[#6C757D] font-medium text-[15px] mb-6 hover:text-[#A86431] transition-colors no-underline">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali ke Katalog
        </Link>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 sm:gap-0 mb-6">
          <h1 className="text-[24px] font-bold m-0 text-[#3A2210]">Notifikasi</h1>
          {notifications.length > 0 && (
            <button onClick={handleMarkAllAsRead} className="flex items-center gap-2 bg-transparent border-none text-[#A86431] font-semibold text-[14px] cursor-pointer hover:bg-[#FDF9F5] p-2 rounded-lg transition-colors w-fit">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              Tandai semua dibaca
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
          {isLoading ? (
            <div className="p-10 text-center text-[#A86431] font-semibold">Memuat notifikasi...</div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center text-[#6C757D]">Belum ada notifikasi untuk Anda.</div>
          ) : (
            notifications.map((notif) => {
              const config = getIconConfig(notif.type);
              return (
                <Link key={notif.id} to={notif.link || '#'} onClick={() => handleMarkAsRead(notif.id, notif.isRead)} className={`flex gap-4 p-5 md:p-6 border-b border-[#EFEFEF] transition-colors no-underline text-inherit relative hover:bg-[#FAFAFA] last:border-b-0 ${!notif.isRead ? 'bg-[#FDF9F5]' : 'bg-white'}`}>
                  {!notif.isRead && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#A86431] hidden sm:block"></div>}
                  
                  {/* Indikator unread untuk mobile */}
                  {!notif.isRead && <div className="absolute left-3 top-8 w-2 h-2 rounded-full bg-[#A86431] sm:hidden"></div>}

                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 sm:ml-4 ${config.bg} ${config.color}`}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">{config.icon}</svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-bold m-0 mb-1 text-[#1A1D20]">{notif.title}</h3>
                    <p className="text-[14px] text-[#6C757D] leading-relaxed m-0 mb-2">{notif.message}</p>
                    <span className="text-[12px] text-gray-400 font-medium">
                      {new Date(notif.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifikasi;