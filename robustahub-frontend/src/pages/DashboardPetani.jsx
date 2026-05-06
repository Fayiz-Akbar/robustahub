import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarPetani from '../components/SidebarPetani';

const DashboardPetani = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State untuk Data API
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '' });
  // State khusus untuk menyimpan file gambar
  const [imageFile, setImageFile] = useState(null); 
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initial = user?.name ? user.name.substring(0, 2).toUpperCase() : 'PT';

  const fetchMyProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const result = await response.json();
      
      if (response.ok) {
        const myProducts = result.data.filter(p => p.petaniId === user.id || p.petani?.id === user.id);
        setProducts(myProducts);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  useEffect(() => {
    if (!token || user.role !== 'PETANI') {
      alert('Akses Ditolak: Halaman ini khusus untuk Petani Kopi.');
      navigate('/');
      return;
    }
    fetchMyProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Gunakan FormData untuk mengirim file gambar + teks sekaligus
    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('price', parseInt(formData.price));
    dataToSend.append('stock', parseInt(formData.stock));
    dataToSend.append('minOrder', 1);
    
    // Jika user memilih gambar, masukkan ke FormData
    if (imageFile) {
      // Pastikan backend kamu menerima field bernama 'image' di router mutler-nya
      dataToSend.append('image', imageFile); 
    }

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          // PERHATIAN: JANGAN set 'Content-Type': 'application/json' di sini!
          // Browser akan otomatis mengatur boundary untuk multipart/form-data
          'Authorization': `Bearer ${token}`
        },
        body: dataToSend
      });

      if (response.ok) {
        alert('Kopi berhasil ditambahkan ke Etalase!');
        setIsModalOpen(false);
        setFormData({ name: '', price: '', stock: '' }); 
        setImageFile(null); // Kosongkan file gambar
        fetchMyProducts(); 
      } else {
        const result = await response.json();
        alert(`Gagal: ${result.message}`);
      }
    } catch (error) {
      alert('Terjadi kesalahan pada server saat mengunggah produk.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kopi ini dari etalase?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchMyProducts(); 
      } else {
        alert('Gagal menghapus produk.');
      }
    } catch (error) {
      console.error("Gagal menghapus:", error);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans text-[#1A1D20]">
      
      <SidebarPetani 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activePage="dashboard" 
      />

      <main className="flex-1 flex flex-col relative overflow-y-auto w-full">
        
        <header className="bg-white h-[80px] px-5 lg:px-10 flex justify-between items-center border-b border-[#EFEFEF] sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-[#3A2210] bg-[#F8F9FA] rounded-lg">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <div className="text-[18px] lg:text-[22px] font-bold text-[#1A1D20]">Dashboard & Inventaris</div>
          </div>
          <div className="flex items-center gap-3 font-semibold text-[#1A1D20] px-4 py-2 bg-[#F8F9FA] rounded-full cursor-default">
            <span className="hidden md:block">{user.name}</span>
            <div className="w-9 h-9 bg-[#A86431] text-white rounded-full flex items-center justify-center text-[14px] uppercase">{initial}</div>
          </div>
        </header>

        <div className="p-5 lg:p-10 max-w-[1200px] mx-auto w-full box-border">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.04)] border border-[#EFEFEF] relative overflow-hidden flex flex-col min-h-[160px] transition-transform hover:-translate-y-1">
              <div className="p-6 relative z-10">
                <div className="text-[15px] text-[#6C757D] font-medium mb-3">Jumlah Kopi Tersedia</div>
                <div className="text-[36px] font-bold text-[#1A1D20] mb-3">{products.length}</div>
                <div className="text-[13px] flex items-center gap-1.5 font-medium text-[#F59E0B]">
                  Total varian kopi saat ini <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
              </div>
              <svg className="absolute bottom-0 left-0 w-full translate-y-0.5 z-0" viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="#FFFBEB" stroke="#F59E0B" d="M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,192C672,213,768,235,864,224C960,213,1056,171,1152,144C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
            </div>

            <div className="bg-white rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.04)] border border-[#EFEFEF] relative overflow-hidden flex flex-col min-h-[160px] transition-transform hover:-translate-y-1">
              <div className="p-6 relative z-10">
                <div className="text-[15px] text-[#6C757D] font-medium mb-3">Sedang Diproses</div>
                <div className="text-[36px] font-bold text-[#1A1D20] mb-3">0</div>
                <div className="text-[13px] flex items-center gap-1.5 font-medium text-[#3B82F6]">
                  Pesanan menunggu pengiriman <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
              </div>
              <svg className="absolute bottom-0 left-0 w-full translate-y-0.5 z-0" viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="#EFF6FF" stroke="#3B82F6" d="M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,192C672,213,768,235,864,224C960,213,1056,171,1152,144C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
            </div>

            <div className="bg-white rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.04)] border border-[#EFEFEF] relative overflow-hidden flex flex-col min-h-[160px] transition-transform hover:-translate-y-1">
              <div className="p-6 relative z-10">
                <div className="text-[15px] text-[#6C757D] font-medium mb-3">Selesai / Lunas</div>
                <div className="text-[36px] font-bold text-[#1A1D20] mb-3">Rp 0</div>
                <div className="text-[13px] flex items-center gap-1.5 font-medium text-[#10B981]">
                  Pembayaran telah diverifikasi <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
              </div>
              <svg className="absolute bottom-0 left-0 w-full translate-y-0.5 z-0" viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="#ECFDF5" stroke="#10B981" d="M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,192C672,213,768,235,864,224C960,213,1056,171,1152,144C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-black/5 overflow-hidden">
            <div className="p-6 md:px-8 border-b border-[#EFEFEF] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-[18px] font-bold text-[#1A1D20] m-0">Daftar Kopi Anda</h3>
              <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-[#3A2210] text-white border-none py-3 px-5 rounded-lg font-semibold text-[14px] cursor-pointer transition-all hover:bg-[#A86431] hover:shadow-[0_6px_15px_rgba(168,100,49,0.3)] flex items-center justify-center gap-2">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Tambah Kopi Baru
              </button>
            </div>
            
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-4 px-8 text-[13px] text-[#6C757D] uppercase border-b-2 border-[#F8F9FA] whitespace-nowrap">Detail Produk Kopi</th>
                    <th className="text-left py-4 px-8 text-[13px] text-[#6C757D] uppercase border-b-2 border-[#F8F9FA] whitespace-nowrap">Harga Grosir (Kg)</th>
                    <th className="text-left py-4 px-8 text-[13px] text-[#6C757D] uppercase border-b-2 border-[#F8F9FA] whitespace-nowrap">Status Stok</th>
                    <th className="text-left py-4 px-8 text-[13px] text-[#6C757D] uppercase border-b-2 border-[#F8F9FA] whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-gray-500">Anda belum menambahkan produk kopi apapun.</td>
                    </tr>
                  ) : (
                    products.map((item) => (
                      <tr key={item.id} className="hover:bg-[#FDF9F5] transition-colors">
                        <td className="py-5 px-8 border-b border-[#EFEFEF] whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#EFEFEF]">
                              <img 
                                src={item.imageUrl ? `http://localhost:5000${item.imageUrl}` : "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=100&q=80"} 
                                alt={item.name} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <div>
                              <div className="font-bold text-[#3A2210]">{item.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-8 border-b border-[#EFEFEF] whitespace-nowrap font-bold text-[#A86431]">
                          Rp {item.price.toLocaleString('id-ID')}
                        </td>
                        <td className="py-5 px-8 border-b border-[#EFEFEF] whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 bg-[#E1F8EF] text-[#10B981] py-1.5 px-3 rounded-full text-[13px] font-semibold">
                            <div className="w-2 h-2 bg-[#10B981] rounded-full"></div> 
                            Tersedia ({item.stock}kg)
                          </span>
                        </td>
                        <td className="py-5 px-8 border-b border-[#EFEFEF] whitespace-nowrap">
                          <div className="flex gap-3">
                            <button onClick={() => handleDeleteProduct(item.id)} className="py-2 px-3 rounded-md border-none font-semibold cursor-pointer transition-colors text-red-500 bg-red-50 hover:bg-red-100">
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Tambah Kopi */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200]">
          <div className="bg-white w-[90%] max-w-[500px] rounded-2xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="m-0 text-[20px] font-bold text-[#3A2210]">Tambah Produk Kopi</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-none border-none text-[24px] text-[#6C757D] cursor-pointer">&times;</button>
            </div>
            
            <form onSubmit={handleAddProduct}>
              
              {/* === INPUT FILE GAMBAR BARU === */}
              <div className="mb-4">
                <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Foto Produk</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-[#6C757D] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FDF9F5] file:text-[#A86431] hover:file:bg-[#F8F9FA] cursor-pointer" 
                />
              </div>

              <div className="mb-4">
                <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Nama Kopi</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg font-sans text-[15px] outline-none focus:border-[#A86431]" 
                  placeholder="Cth: Robusta Premium Natar" 
                />
              </div>
              <div className="mb-4">
                <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Harga per Kilogram (Rp)</label>
                <input 
                  type="number" 
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg font-sans text-[15px] outline-none focus:border-[#A86431]" 
                  placeholder="Cth: 50000" 
                />
              </div>
              <div className="mb-4">
                <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Stok Tersedia (Kg)</label>
                <input 
                  type="number" 
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg font-sans text-[15px] outline-none focus:border-[#A86431]" 
                  placeholder="Cth: 100" 
                />
              </div>
              
              <div className="mt-8 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="py-3 px-5 bg-white border border-[#EFEFEF] rounded-lg font-semibold cursor-pointer text-[#6C757D]">Batal</button>
                <button type="submit" className="py-3 px-5 bg-[#3A2210] text-white border-none rounded-lg font-semibold cursor-pointer flex items-center gap-2 hover:bg-[#A86431]">
                  Simpan Kopi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardPetani;