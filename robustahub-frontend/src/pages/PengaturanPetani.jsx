import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarPetani from '../components/SidebarPetani';

const PengaturanPetani = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // Referensi untuk input file tersembunyi
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initial = user?.name ? user.name.substring(0, 2).toUpperCase() : 'PT';

  // State Form Data disesuaikan dengan skema Prisma
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    bankName: '',
    bankAccountNumber: '', // <-- Diperbaiki
    bankAccountName: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (!token || user.role !== 'PETANI') {
      alert('Akses Ditolak: Halaman ini khusus untuk Petani Kopi.');
      navigate('/');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      description: user.description || '',
      bankName: user.bankName || '',
      bankAccountNumber: user.bankAccountNumber || '',
      bankAccountName: user.bankAccountName || ''
    }));

    // Set gambar awal jika sudah ada di database
    if (user.shopImage) {
      setImagePreview(`http://localhost:5000${user.shopImage}`);
    } else {
      setImagePreview('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1200&q=80');
    }
  }, []);

  // Fungsi saat user memilih gambar baru
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Buat URL lokal untuk preview langsung
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // KARENA KITA MENGIRIM FOTO, KITA PAKAI FORMDATA
    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('phone', formData.phone);
    dataToSend.append('address', formData.address);
    dataToSend.append('description', formData.description);
    dataToSend.append('bankName', formData.bankName);
    dataToSend.append('bankAccountNumber', formData.bankAccountNumber);
    dataToSend.append('bankAccountName', formData.bankAccountName);

    if (imageFile) {
      dataToSend.append('shopImage', imageFile); // 'shopImage' harus sama dengan upload.single('shopImage') di backend
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Jangan tambahkan 'Content-Type': 'application/json' karena kita kirim FormData
        },
        body: dataToSend
      });

      if (response.ok) {
        const result = await response.json();
        alert('Pengaturan toko berhasil disimpan!');
        
        // Simpan data terbaru ke localStorage
        localStorage.setItem('user', JSON.stringify(result.data));
        window.location.reload(); // Refresh halaman agar efeknya langsung terasa
        
      } else {
        const result = await response.json();
        alert(`Gagal menyimpan pengaturan: ${result.message}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Terjadi kesalahan pada server saat menyimpan profil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans text-[#1A1D20]">
      
      <SidebarPetani isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} activePage="pengaturan" />

      <main className="flex-1 flex flex-col relative overflow-y-auto w-full">
        
        <header className="bg-white h-[80px] px-5 lg:px-10 flex justify-between items-center border-b border-[#EFEFEF] sticky top-0 z-50 shrink-0">
          <div className="text-[18px] lg:text-[22px] font-bold text-[#1A1D20]">Pengaturan Toko</div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 font-semibold text-[#1A1D20] px-4 py-2 bg-[#F8F9FA] rounded-full cursor-default">
              <span>{formData.name}</span>
              <div className="w-9 h-9 bg-[#A86431] text-white rounded-full flex items-center justify-center text-[14px] uppercase">
                {initial}
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-[#3A2210] bg-[#F8F9FA] rounded-lg">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>
        </header>

        <div className="p-5 lg:p-10 max-w-[1000px] mx-auto w-full box-border">
          
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#EFEFEF] overflow-hidden mb-8">
            <div 
              className="h-[150px] sm:h-[200px] bg-cover bg-center relative transition-all"
              style={{ backgroundImage: `url('${imagePreview}')` }}
            >
              <div className="absolute inset-0 bg-black/30"></div>
              
              {/* Input file tersembunyi */}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              
              {/* Tombol yang akan memicu input file */}
              <button 
                onClick={() => fileInputRef.current.click()}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/40 py-2 px-4 rounded-lg font-semibold text-[13px] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                Ubah Sampul Toko
              </button>
            </div>
            
            <div className="px-6 sm:px-8 pb-8 pt-0 flex flex-col sm:flex-row gap-6 items-center sm:items-end -mt-12 sm:-mt-16 relative z-10 text-center sm:text-left">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-[#A86431] text-white flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-md shrink-0 relative group">
                {initial}
              </div>
              
              <div className="flex-1">
                <h2 className="text-[24px] font-bold text-[#1A1D20] m-0 mb-1">{formData.name || 'Nama Toko Belum Diatur'}</h2>
                <p className="text-[#6C757D] text-[14px] m-0 flex items-center justify-center sm:justify-start gap-1.5">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  {formData.email}
                </p>
              </div>
            </div>
          </div>

          <form id="settingsForm" onSubmit={handleSaveSettings}>
            
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#EFEFEF] overflow-hidden mb-8">
              <div className="px-6 sm:px-8 py-5 border-b border-[#EFEFEF] bg-[#FAFAFA]">
                <h3 className="text-[18px] font-bold text-[#1A1D20] m-0 flex items-center gap-2">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-[#A86431]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Informasi Dasar Toko
                </h3>
              </div>
              
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Nama Toko / Kebun <span className="text-red-500">*</span></label>
                    <input 
                      type="text" required value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg text-[14px] outline-none focus:border-[#A86431]" 
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Email Kontak</label>
                    <input type="email" value={formData.email} disabled className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg text-[14px] outline-none bg-gray-100 text-gray-500 cursor-not-allowed" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Nomor WhatsApp</label>
                    <input 
                      type="tel" value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg text-[14px] outline-none focus:border-[#A86431]" 
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Alamat Lengkap Kebun</label>
                    <input 
                      type="text" value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg text-[14px] outline-none focus:border-[#A86431]" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Deskripsi Singkat Toko</label>
                  <textarea 
                    rows="3" value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg text-[14px] outline-none focus:border-[#A86431] resize-y" 
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#EFEFEF] overflow-hidden mb-8">
              <div className="px-6 sm:px-8 py-5 border-b border-[#EFEFEF] bg-[#FAFAFA]">
                <h3 className="text-[18px] font-bold text-[#1A1D20] m-0 flex items-center gap-2">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-[#A86431]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  Rekening Pembayaran (Pencairan Dana)
                </h3>
              </div>
              
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Nama Bank</label>
                    <select 
                      value={formData.bankName}
                      onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                      className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg text-[14px] outline-none focus:border-[#A86431] cursor-pointer"
                    >
                      <option value="" disabled>Pilih Bank</option>
                      <option value="BCA">Bank BCA</option>
                      <option value="Mandiri">Bank Mandiri</option>
                      <option value="BNI">Bank BNI</option>
                      <option value="BRI">Bank BRI</option>
                      <option value="BSI">Bank BSI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Nomor Rekening</label>
                    <input 
                      type="text" value={formData.bankAccountNumber}
                      onChange={(e) => setFormData({...formData, bankAccountNumber: e.target.value})}
                      className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg text-[14px] outline-none focus:border-[#A86431]" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Nama Pemilik Rekening</label>
                  <input 
                    type="text" value={formData.bankAccountName}
                    onChange={(e) => setFormData({...formData, bankAccountName: e.target.value})}
                    className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg text-[14px] outline-none focus:border-[#A86431]" 
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button type="submit" disabled={isLoading} className="py-3 px-6 bg-[#3A2210] text-white rounded-lg font-semibold cursor-pointer flex items-center justify-center gap-2 hover:bg-[#A86431] shadow-sm">
                {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
};

export default PengaturanPetani;