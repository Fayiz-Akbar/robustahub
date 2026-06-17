import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [isProfileOpen, setIsProfileOpen] = useState(false); 
  
  // ==========================================
  // STATE DINAMIS UNTUK NOTIFIKASI & KERANJANG
  // ==========================================
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0); // State untuk Jumlah Item Keranjang

  const navigate = useNavigate();

  // Mengambil data user
  const token = localStorage.getItem('token');
  const userDataString = localStorage.getItem('user');
  const user = userDataString ? JSON.parse(userDataString) : null;

  const isLoggedIn = user !== null;
  const userRole = user ? user.role : null; 

  const displayName = user ? user.name : '';
  const displayEmail = user ? user.email : '';
  const displayInitials = user ? user.name.substring(0, 2).toUpperCase() : '';

  // ==========================================
  // FUNGSI MENGHITUNG ISI KERANJANG
  // ==========================================
  const updateCartBadge = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    // Menghitung jumlah jenis varian kopi unik di dalam keranjang
    setCartCount(cart.length);
  };

  // ==========================================
  // EFFECT UNTUK EVENT LISTENERS & NOTIFIKASI
  // ==========================================
  useEffect(() => {
    // 1. Hitung pertama kali saat komponen dimuat
    updateCartBadge();

    // 2. Dengarkan pemicu 'cartUpdate' dari ProductCard secara global
    window.addEventListener('cartUpdate', updateCartBadge);

    // 3. Ambil jumlah notifikasi unread dari server
    if (isLoggedIn && token) {
      const fetchUnreadNotifs = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const result = await response.json();
            const unread = result.data.filter(notif => !notif.isRead).length;
            setUnreadCount(unread);
          }
        } catch (error) {
          console.error("Gagal mengambil jumlah notifikasi:", error);
        }
      };

      fetchUnreadNotifs();
    }

    // Bersihkan listener saat komponen dibongkar
    return () => {
      window.removeEventListener('cartUpdate', updateCartBadge);
    };
  }, [isLoggedIn, token]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      navigate(`/katalog?search=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <>
      <nav className="bg-white px-[5%] py-4 flex justify-between items-center shadow-[0_4px_20px_rgba(0,0,0,0.02)] sticky top-0 z-[100]">
        {/* LOGO DIKEMBALIKAN KE VERSI ORIGINAL BAWAAN AWAL */}
        <Link to="/katalog" className="text-[24px] font-bold text-[#3A2210] flex items-center gap-2 no-underline">
          <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" color="#A86431"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
          RobustaHub
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="hidden lg:block flex-1 max-w-[500px] mx-10 relative">
          <svg className="absolute left-[18px] top-1/2 -translate-y-1/2 text-[#6C757D] w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch} 
            className="w-full py-3 pr-5 pl-12 border border-[#EFEFEF] rounded-full bg-[#F8F9FA] outline-none text-[14px] transition-all focus:border-[#A86431] focus:bg-white focus:shadow-[0_4px_15px_rgba(168,100,49,0.1)]" 
            placeholder="Cari kopi robusta lampung..." 
          />
        </div>

        {/* Nav Actions (Desktop) */}
        <div className="hidden lg:flex items-center gap-5">
          {isLoggedIn ? (
            <>
              {/* Keranjang HANYA untuk ROLE PEMBELI (COFFEE_SHOP) */}
              {userRole === 'COFFEE_SHOP' && (
                <Link to="/keranjang" className="relative text-[#1A1D20] w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] hover:text-[#A86431] transition-colors">
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  {/* Lencana Angka Keranjang Belanja Aktif */}
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-[#3A2210] text-white text-[10px] font-bold min-w-[18px] px-1 h-[18px] flex items-center justify-center rounded-full border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}
              
              {/* NOTIFIKASI UNTUK SEMUA */}
              <Link to="/notifikasi" className="relative text-[#1A1D20] w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] hover:text-[#A86431] transition-colors">
                <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-[#A86431] text-white text-[10px] font-bold min-w-[18px] px-1 h-[18px] flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-[10px] font-semibold text-[14px] cursor-pointer py-1.5 pr-4 pl-1.5 rounded-full border border-transparent hover:bg-[#F8F9FA] hover:border-[#EFEFEF] transition-all focus:outline-none"
                >
                  <span>{displayName}</span>
                  <div className="w-8 h-8 bg-[#3A2210] text-white rounded-full flex items-center justify-center text-[12px] font-bold uppercase">
                    {displayInitials}
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#EFEFEF] py-2 z-[150]">
                    <div className="px-4 py-2 border-b border-[#EFEFEF] mb-1">
                      <p className="text-[12px] text-[#6C757D] font-normal">Masuk sebagai</p>
                      <p className="text-[14px] font-bold text-[#1A1D20] truncate" title={displayEmail}>{displayEmail}</p>
                    </div>

                    {userRole === 'PETANI' ? (
                      <Link to="/dashboard" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-[14px] text-[#1A1D20] hover:bg-[#F8F9FA] hover:text-[#A86431] transition-colors">Dashboard Saya</Link>
                    ) : (
                      <Link to="/riwayat" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-[14px] text-[#1A1D20] hover:bg-[#F8F9FA] hover:text-[#A86431] transition-colors">Riwayat Pesanan</Link>
                    )}
                    
                    <Link to="/profil" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-[14px] text-[#1A1D20] hover:bg-[#F8F9FA] hover:text-[#A86431] transition-colors">Profil Pengguna</Link>
                    
                    <div className="border-t border-[#EFEFEF] my-1"></div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-[14px] font-semibold text-red-600 hover:bg-red-50 transition-colors">Keluar</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/" className="text-[#3A2210] font-semibold text-[15px] hover:text-[#A86431] transition-colors px-2">Masuk</Link>
              <Link to="/register" className="bg-[#A86431] text-white px-6 py-2.5 rounded-full font-semibold text-[14px] hover:bg-[#3A2210] transition-colors shadow-sm">Daftar Sekarang</Link>
            </>
          )}
        </div>

        {/* Hamburger Mobile */}
        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-[#3A2210] p-2">
          <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-white z-[200] flex flex-col p-5 transition-transform duration-400 ease-in-out ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex justify-between items-center border-b border-[#EFEFEF] pb-4 mb-6">
          <div className="font-bold text-[24px] text-[#3A2210]">RobustaHub</div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-[32px] text-[#1A1D20]">&times;</button>
        </div>
        
        {/* Search Bar (Mobile) */}
        <div className="relative mb-[30px]">
          <svg className="absolute left-[18px] top-1/2 -translate-y-1/2 text-[#6C757D] w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full py-3 pr-5 pl-12 border-2 border-[#A86431] rounded-full bg-white outline-none text-[14px]" 
            placeholder="Cari kopi... (Lalu Enter)" 
          />
        </div>

        <div className="flex flex-col gap-4 text-[18px] font-semibold text-[#1A1D20] flex-1">
          {isLoggedIn ? (
            <>
              {userRole === 'COFFEE_SHOP' && (
                <>
                  <Link to="/keranjang" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 rounded-lg bg-[#F8F9FA]">
                    <span className="flex items-center gap-3">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg> 
                      Keranjang Belanja
                    </span>
                    {/* Badge Keranjang Mobile */}
                    {cartCount > 0 && (
                      <span className="bg-[#3A2210] text-white text-[12px] font-bold px-2.5 py-0.5 rounded-full">{cartCount}</span>
                    )}
                  </Link>
                  <Link to="/riwayat" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3"><svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg> Riwayat Pesanan</Link>
                </>
              )}

              {userRole === 'PETANI' && (
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3"><svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> Dashboard Saya</Link>
              )}
              
              <Link to="/notifikasi" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3">
                <span className="flex items-center gap-3">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg> 
                  Notifikasi
                </span>
                {unreadCount > 0 && (
                  <span className="bg-[#A86431] text-white text-[12px] font-bold px-2.5 py-0.5 rounded-full">{unreadCount > 99 ? '99+' : unreadCount} Baru</span>
                )}
              </Link>

              <Link to="/profil" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3"><svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> Profil Pengguna</Link>
            </>
          ) : (
            <>
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-3 p-4 bg-[#F8F9FA] rounded-xl text-[#3A2210] transition-colors border border-[#EFEFEF]">Masuk ke Akun</Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-3 p-4 bg-[#A86431] text-white rounded-xl transition-colors">Daftar Akun Baru</Link>
            </>
          )}
        </div>

        {isLoggedIn && (
          <div className="mt-auto border-t border-[#EFEFEF] pt-4">
            <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-[18px] font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Keluar
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;