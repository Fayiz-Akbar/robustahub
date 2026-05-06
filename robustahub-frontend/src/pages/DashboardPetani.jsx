import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarPetani from '../components/SidebarPetani';

const DashboardPetani = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [products, setProducts] = useState([]);
  
  // State disesuaikan dengan skema Prisma (termasuk tastingNotes & processingMethod)
  const [formData, setFormData] = useState({ 
    name: '', price: '', stock: '', 
    description: '', processingMethod: '', elevation: '', tastingNotes: '',
    category: 'ROBUSTA'
  });
  
  const [imageFiles, setImageFiles] = useState([]); 
  
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
    
    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('price', parseInt(formData.price));
    dataToSend.append('stock', parseInt(formData.stock));
    dataToSend.append('minOrder', 5); // Mengikuti default schema Prisma
    dataToSend.append('category', formData.category);
    
    // Field Tambahan (Opsional)
    if (formData.description) dataToSend.append('description', formData.description);
    if (formData.processingMethod) dataToSend.append('processingMethod', formData.processingMethod);
    if (formData.elevation) dataToSend.append('elevation', formData.elevation);
    if (formData.tastingNotes) dataToSend.append('tastingNotes', formData.tastingNotes);
    
    if (imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        dataToSend.append('images', imageFiles[i]); 
      }
    }

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: dataToSend
      });

      if (response.ok) {
        alert('Kopi berhasil ditambahkan ke Etalase!');
        setIsModalOpen(false);
        // Kosongkan seluruh form, kembalikan kategori ke ROBUSTA
        setFormData({ name: '', price: '', stock: '', description: '', processingMethod: '', elevation: '', tastingNotes: '', category: 'ROBUSTA' }); // <-- UPDATE INI
        setImageFiles([]); 
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
        
        {/* ================= HEADER (Hamburger Kanan di Mobile) ================= */}
        <header className="bg-white h-[80px] px-5 lg:px-10 flex justify-between items-center border-b border-[#EFEFEF] sticky top-0 z-50">
          
          <div className="text-[18px] lg:text-[22px] font-bold text-[#1A1D20]">
            Dashboard & Inventaris
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 font-semibold text-[#1A1D20] px-4 py-2 bg-[#F8F9FA] rounded-full cursor-default">
              <span>{user.name}</span>
              <div className="w-9 h-9 bg-[#A86431] text-white rounded-full flex items-center justify-center text-[14px] uppercase">
                {initial}
              </div>
            </div>

            {/* Tombol Hamburger di Kanan */}
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-2 text-[#3A2210] bg-[#F8F9FA] hover:bg-[#EFEFEF] rounded-lg transition-colors focus:outline-none"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
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
                    products.map((item) => {
                      const backendUrl = "http://localhost:5000";
                      let finalImageUrl = "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=500&q=80";

                      if (item.imageUrl) {
                        try {
                          // Coba parse jika formatnya berupa JSON array string seperti '["/uploads/file.jpg"]'
                          const parsedImage = JSON.parse(item.imageUrl);
                          if (Array.isArray(parsedImage) && parsedImage.length > 0) {
                            finalImageUrl = `${backendUrl}${parsedImage[0]}`;
                          } else {
                            finalImageUrl = `${backendUrl}${item.imageUrl}`;
                          }
                        } catch (e) {
                          // Jika error saat diparse, berarti stringnya sudah bersih '/uploads/file.jpg'
                          finalImageUrl = `${backendUrl}${item.imageUrl}`;
                        }
                      }

                      return (
                        <tr key={item.id} className="hover:bg-[#FDF9F5] transition-colors">
                          <td className="py-5 px-8 border-b border-[#EFEFEF] whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#EFEFEF] shrink-0">
                                <img src={finalImageUrl} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-[#3A2210] text-[15px] truncate">{item.name}</div>
                                <div className="text-[12px] text-[#6C757D] mt-1 truncate">
                                  {item.processingMethod || 'Natural Process'} • {item.elevation || '800 mdpl'}
                                </div>
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ================= MODAL TAMBAH KOPI (DIUPDATE) ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white w-full max-w-[600px] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-[#EFEFEF] shrink-0">
              <h3 className="m-0 text-[20px] font-bold text-[#3A2210]">Tambah Produk Kopi</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-none border-none text-[28px] text-[#6C757D] cursor-pointer leading-none hover:text-[#1A1D20]">&times;</button>
            </div>
            
            {/* Area Form Scrollable */}
            <div className="p-6 overflow-y-auto">
              <form id="addProductForm" onSubmit={handleAddProduct}>
                
                {/* Upload Foto */}
                <div className="mb-5">
                  <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">
                    Foto Produk <span className="text-[#6C757D] font-normal">(Opsional, bisa lebih dari 1)</span>
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={(e) => setImageFiles(Array.from(e.target.files))}
                    className="w-full text-sm text-[#6C757D] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FDF9F5] file:text-[#A86431] hover:file:bg-[#F8F9FA] cursor-pointer border border-[#EFEFEF] p-2 rounded-lg" 
                  />
                  {imageFiles.length > 0 && (
                    <p className="text-[13px] text-[#10B981] mt-2 font-medium">✓ {imageFiles.length} file gambar dipilih</p>
                  )}
                </div>


                {/* Kategori Kopi */}
                <div className="mb-5">
                  <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Kategori Kopi <span className="text-red-500">*</span></label>
                  <select 
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431] appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23717171%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px top 50%',
                      backgroundSize: '12px auto'
                    }}
                  >
                    <option value="ROBUSTA">Kopi Robusta</option>
                    <option value="ARABIKA">Kopi Arabika</option>
                    <option value="BLEND">House Blend / Campuran</option>
                  </select>
                </div>
                
                {/* Nama Kopi */}
                <div className="mb-5">
                  <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Nama Kopi <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431]" 
                    placeholder="Cth: Robusta Premium Natar" 
                  />
                </div>

                {/* Harga & Stok */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Harga per Kilogram (Rp) <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431]" 
                      placeholder="Cth: 45000" 
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Stok Tersedia (Kg) <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431]" 
                      placeholder="Cth: 200" 
                    />
                  </div>
                </div>

                {/* Pascapanen & Ketinggian (Opsional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Proses Pascapanen <span className="text-[#6C757D] font-normal">(Opsional)</span></label>
                    <input 
                      type="text" 
                      value={formData.processingMethod}
                      onChange={(e) => setFormData({...formData, processingMethod: e.target.value})}
                      className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431]" 
                      placeholder="Cth: Natural Process" 
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Ketinggian Tanam <span className="text-[#6C757D] font-normal">(Opsional)</span></label>
                    <input 
                      type="text" 
                      value={formData.elevation}
                      onChange={(e) => setFormData({...formData, elevation: e.target.value})}
                      className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431]" 
                      placeholder="Cth: 600 - 800 mdpl" 
                    />
                  </div>
                </div>

                {/* Tasting Notes (Opsional) */}
                <div className="mb-5">
                  <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Tasting Notes <span className="text-[#6C757D] font-normal">(Opsional)</span></label>
                  <input 
                    type="text" 
                    value={formData.tastingNotes}
                    onChange={(e) => setFormData({...formData, tastingNotes: e.target.value})}
                    className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431]" 
                    placeholder="Cth: Dark Choco, Nutty, Earthy" 
                  />
                </div>

                {/* Deskripsi */}
                <div className="mb-2">
                  <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Deskripsi Kopi <span className="text-[#6C757D] font-normal">(Opsional)</span></label>
                  <textarea 
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431] resize-y" 
                    placeholder="Ceritakan tentang biji kopi ini..." 
                  ></textarea>
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-[#EFEFEF] shrink-0 bg-[#F8F9FA] rounded-b-2xl flex gap-3 justify-end">
              <button type="button" onClick={() => setIsModalOpen(false)} className="py-2.5 px-6 bg-white border border-[#EFEFEF] rounded-lg font-semibold cursor-pointer text-[#6C757D] hover:bg-gray-50">Batal</button>
              <button type="submit" form="addProductForm" className="py-2.5 px-6 bg-[#3A2210] text-white border-none rounded-lg font-semibold cursor-pointer flex items-center gap-2 hover:bg-[#A86431] transition-colors shadow-sm">
                Simpan Kopi
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardPetani;