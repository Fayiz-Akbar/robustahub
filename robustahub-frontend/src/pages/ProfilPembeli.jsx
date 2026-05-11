import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ProfilPembeli = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Untuk mendeteksi menu aktif di sidebar
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initial = user?.name ? user.name.substring(0, 2).toUpperCase() : 'US';

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    shopName: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (!token) {
      alert('Silakan login terlebih dahulu.');
      navigate('/');
      return;
    }
    
    // Isi form dengan data yang ada di localStorage
    setFormData({
      name: user.name || '',
      shopName: user.shopName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || ''
    });
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Kita panggil endpoint PUT yang sudah kamu buat sebelumnya
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          shopName: formData.shopName,
          phone: formData.phone,
          address: formData.address
          // Email biasanya tidak diubah sembarangan, jadi kita skip update email
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert('Profil berhasil diperbarui!');
        // Update data di localStorage agar nama di Navbar ikut berubah
        localStorage.setItem('user', JSON.stringify({ ...user, ...result.data }));
        window.location.reload(); 
      } else {
        alert(result.message || 'Gagal menyimpan profil');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Terjadi kesalahan pada server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-[#1A1D20]">
      <Navbar />

      <div className="max-w-[1100px] mx-auto px-[5%] py-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">
        
        {/* SIDEBAR NAVIGASI PROFIL */}
        <aside className="bg-white rounded-[16px] border border-[#EFEFEF] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] sticky top-[100px]">
          <div className="text-center mb-8 pb-6 border-b border-[#EFEFEF]">
            <div className="w-[80px] h-[80px] bg-[#3A2210] text-white rounded-full mx-auto mb-4 flex items-center justify-center text-[28px] font-bold border-4 border-[#FDF9F5]">
              {initial}
            </div>
            <h3 className="m-0 text-[18px] text-[#1A1D20] font-bold">{formData.shopName || formData.name}</h3>
            <p className="m-0 mt-1 text-[13px] text-[#6C757D]">Pembeli B2B • Member RobustaHub</p>
          </div>
          
          <nav className="flex flex-col m-0 p-0">
            <Link to="/profil" className={`flex items-center gap-3 p-3 rounded-[10px] font-semibold text-[14px] mb-1 transition-all no-underline ${location.pathname === '/profil' ? 'bg-[#FDF9F5] text-[#A86431]' : 'text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#A86431]'}`}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Informasi Akun
            </Link>
            <Link to="/riwayat" className={`flex items-center gap-3 p-3 rounded-[10px] font-semibold text-[14px] mb-1 transition-all no-underline ${location.pathname === '/riwayat' ? 'bg-[#FDF9F5] text-[#A86431]' : 'text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#A86431]'}`}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              Riwayat Pesanan
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-[10px] font-semibold text-[14px] mt-6 pt-4 border-t border-[#EFEFEF] text-red-500 hover:bg-red-50 transition-colors w-full text-left cursor-pointer bg-transparent">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Keluar Akun
            </button>
          </nav>
        </aside>

        {/* AREA KONTEN KANAN */}
        <div className="flex flex-col">
          <Link to="/katalog" className="inline-flex items-center gap-2 text-[#6C757D] font-medium text-[15px] mb-6 hover:text-[#A86431] transition-colors no-underline w-fit">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Kembali ke Katalog
          </Link>

          <div className="bg-white rounded-[16px] border border-[#EFEFEF] p-8 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
            <h2 className="text-[20px] font-bold text-[#3A2210] m-0 mb-2">Informasi Akun</h2>
            <p className="text-[#6C757D] text-[14px] m-0 mb-8">Kelola nama bisnis dan detail kontak Anda untuk mempermudah transaksi.</p>
            
            <form onSubmit={handleSaveProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex flex-col">
                  <label className="text-[14px] font-semibold mb-2 text-[#1A1D20]">Nama Lengkap Pemilik</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-[14px] border border-[#EFEFEF] rounded-[8px] font-sans text-[15px] outline-none transition-all focus:border-[#A86431] focus:shadow-[0_0_0_3px_rgba(168,100,49,0.1)] bg-white" 
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[14px] font-semibold mb-2 text-[#1A1D20]">Nama Bisnis / Coffee Shop</label>
                  <input 
                    type="text" 
                    value={formData.shopName}
                    onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                    className="w-full p-[14px] border border-[#EFEFEF] rounded-[8px] font-sans text-[15px] outline-none transition-all focus:border-[#A86431] focus:shadow-[0_0_0_3px_rgba(168,100,49,0.1)] bg-white" 
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[14px] font-semibold mb-2 text-[#1A1D20]">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    disabled
                    className="w-full p-[14px] border border-[#EFEFEF] rounded-[8px] font-sans text-[15px] outline-none bg-gray-100 text-gray-500 cursor-not-allowed" 
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[14px] font-semibold mb-2 text-[#1A1D20]">Nomor WhatsApp Aktif</label>
                  <input 
                    type="text" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-[14px] border border-[#EFEFEF] rounded-[8px] font-sans text-[15px] outline-none transition-all focus:border-[#A86431] focus:shadow-[0_0_0_3px_rgba(168,100,49,0.1)] bg-white" 
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2 flex flex-col mt-2">
                  <label className="text-[14px] font-semibold mb-2 text-[#1A1D20] flex justify-between">
                    Alamat Utama Pengiriman
                  </label>
                  <textarea 
                    rows="3"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Masukkan alamat lengkap pengiriman kedai kopi Anda..."
                    className="w-full p-[14px] border border-[#EFEFEF] rounded-[8px] font-sans text-[15px] outline-none transition-all focus:border-[#A86431] focus:shadow-[0_0_0_3px_rgba(168,100,49,0.1)] bg-white resize-y" 
                  ></textarea>
                  
                  {formData.address && (
                    <div className="p-4 border border-[#A86431] bg-[#FFFBEB] rounded-[10px] mt-4 flex justify-between items-start">
                      <div className="text-[14px] leading-[1.6] text-[#1A1D20]">
                        <strong className="block mb-1">Preview Alamat Pengiriman</strong>
                        {formData.address}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#3A2210] text-white border-none py-[14px] px-[28px] rounded-[8px] font-semibold text-[15px] cursor-pointer transition-all mt-8 flex items-center gap-2 hover:bg-[#A86431] hover:-translate-y-[2px] hover:shadow-[0_6px_15px_rgba(168,100,49,0.25)] disabled:opacity-50"
              >
                {isLoading ? 'Menyimpan...' : (
                  <>
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    Simpan Perubahan
                  </>
                )}
              </button>
            </form>
            
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfilPembeli;