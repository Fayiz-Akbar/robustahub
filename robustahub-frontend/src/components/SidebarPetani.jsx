import { Link, useNavigate } from 'react-router-dom';

const SidebarPetani = ({ isOpen, setIsOpen, activePage }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getMenuClass = (pageName) => {
    const baseClass = "px-5 py-[14px] rounded-[10px] font-medium flex items-center gap-[14px] transition-all duration-300 cursor-pointer no-underline";
    if (activePage === pageName) {
      return `${baseClass} bg-[#A86431] text-white shadow-[0_8px_16px_rgba(168,100,49,0.2)]`;
    }
    return `${baseClass} text-[#6C757D] hover:bg-[#FDF9F5] hover:text-[#A86431] hover:translate-x-1`;
  };

  return (
    <>
      {/* Overlay Mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isOpen ? 'block opacity-100' : 'hidden opacity-0'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 bg-white border-r border-[#EFEFEF] w-[280px] z-[100] shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header Sidebar */}
        <div className="p-6 lg:py-8 lg:px-6 border-b border-[#EFEFEF] flex justify-between items-center">
          <div>
            <div className="text-[22px] font-bold text-[#3A2210] tracking-tight">RobustaHub</div>
            <div className="text-[13px] text-[#6C757D] mt-1">Panel Petani Kopi</div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-[28px] text-[#6C757D] leading-none focus:outline-none">&times;</button>
        </div>
        
        {/* List Menu */}
        <div className="p-4 lg:py-6 lg:px-4 flex flex-col gap-2 flex-1 overflow-y-auto">
          
          <Link to="/dashboard" className={getMenuClass('dashboard')}>
            <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Dashboard Utama
          </Link>

          {/* Analisis Bisnis */}
          <Link to="/analisis-bisnis" className={getMenuClass('analisis-bisnis')}>
            <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
            Analisis Bisnis
          </Link>
          
          <Link to="/inventaris" className={getMenuClass('inventaris')}>
            <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            Inventaris Kopi
          </Link>
          
          <Link to="/pesanan" className={getMenuClass('pesanan')}>
            {/* 📍 FIX: Jalur d SVG ketikan yang corrupt kemarin sudah dibersihkan total */}
            <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            Pesanan Masuk
          </Link>
          
          <Link to="/pengaturan" className={getMenuClass('pengaturan')}>
            <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Pengaturan Toko
          </Link>
          
          <div className="flex-1"></div>
          
          <button onClick={handleLogout} className="mt-auto px-5 py-[14px] rounded-[10px] text-red-500 font-medium flex items-center gap-[14px] hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer w-full text-left border-none bg-transparent">
            <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Keluar Akun
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarPetani;