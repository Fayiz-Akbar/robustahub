import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-white px-[5%] py-4 flex justify-between items-center shadow-[0_4px_20px_rgba(0,0,0,0.02)] sticky top-0 z-[100]">
        <Link to="/katalog" className="text-[24px] font-bold text-[#3A2210] flex items-center gap-2">
          <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" color="#A86431"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
          RobustaHub
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="hidden lg:block flex-1 max-w-[500px] mx-10 relative">
          <svg className="absolute left-[18px] top-1/2 -translate-y-1/2 text-[#6C757D] w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input type="text" className="w-full py-3 pr-5 pl-12 border border-[#EFEFEF] rounded-full bg-[#F8F9FA] outline-none text-[14px] transition-all focus:border-[#A86431] focus:bg-white focus:shadow-[0_4px_15px_rgba(168,100,49,0.1)]" placeholder="Cari kopi robusta lampung, arabika gayo..." />
        </div>

        {/* Nav Actions (Desktop) */}
        <div className="hidden lg:flex items-center gap-5">
          <button className="text-[#1A1D20] w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] hover:text-[#A86431] transition-colors">
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          </button>
          <button className="relative text-[#1A1D20] w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] hover:text-[#A86431] transition-colors">
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <span className="absolute top-0 right-0 bg-[#A86431] text-white text-[10px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white">2</span>
          </button>
          <div className="flex items-center gap-[10px] font-semibold text-[14px] cursor-pointer py-1.5 pr-4 pl-1.5 rounded-full border border-transparent hover:bg-[#F8F9FA] hover:border-[#EFEFEF] transition-all">
            <span>Kedai Kopi Senja</span>
            <div className="w-8 h-8 bg-[#3A2210] text-white rounded-full flex items-center justify-center text-[12px]">KS</div>
          </div>
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
        <div className="relative mb-[30px]">
          <svg className="absolute left-[18px] top-1/2 -translate-y-1/2 text-[#6C757D] w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input type="text" className="w-full py-3 pr-5 pl-12 border-2 border-[#A86431] rounded-full bg-white outline-none text-[14px]" placeholder="Cari kopi..." />
        </div>
        <div className="flex flex-col gap-4 text-[18px] font-semibold text-[#1A1D20]">
          <Link to="/keranjang" className="flex items-center gap-3 p-3 rounded-lg bg-[#F8F9FA]"><svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg> Keranjang Belanja (2)</Link>
          <Link to="/riwayat" className="flex items-center gap-3 p-3"><svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg> Riwayat Transaksi</Link>
          <Link to="/profil" className="flex items-center gap-3 p-3"><svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> Profil Toko Saya</Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;