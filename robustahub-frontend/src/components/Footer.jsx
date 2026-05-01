const Footer = () => {
  return (
    <footer className="bg-[#3A2210] text-white pt-[60px] pb-[30px] px-[5%] mt-[60px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] gap-10 max-w-[1300px] mx-auto border-b border-white/10 pb-10">
        <div>
          <div className="text-[24px] font-bold flex items-center gap-2 mb-4 text-white">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            RobustaHub
          </div>
          <p className="text-[#D1D5DB] text-[14px] leading-[1.6] mb-6">Platform B2B E-Commerce yang menghubungkan petani kopi lokal Lampung secara langsung dengan pemilik Coffee Shop di seluruh Indonesia.</p>
        </div>
        
        <div>
          <h4 className="text-[16px] font-bold mb-6 text-[#A86431]">Perusahaan</h4>
          <ul className="space-y-3 text-[14px] text-[#D1D5DB]">
            <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[16px] font-bold mb-6 text-[#A86431]">Bantuan</h4>
          <ul className="space-y-3 text-[14px] text-[#D1D5DB]">
            <li><a href="#" className="hover:text-white transition-colors">Cara Belanja</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Lacak Pengiriman</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[16px] font-bold mb-6 text-[#A86431]">Hubungi Kami</h4>
          <ul className="space-y-3 text-[14px] text-[#D1D5DB]">
            <li className="flex gap-2 items-start">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              Universitas Lampung, Indonesia
            </li>
            <li className="flex gap-2 items-center">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              halo@robustahub.com
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center pt-[30px] text-[14px] text-[#9CA3AF]">
        &copy; 2026 RobustaHub Indonesia. Hak Cipta Dilindungi.
      </div>
    </footer>
  );
};

export default Footer;