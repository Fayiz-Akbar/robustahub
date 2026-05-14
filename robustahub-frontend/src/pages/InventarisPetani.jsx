import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarPetani from '../components/SidebarPetani';

const InventarisPetani = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [modalMode, setModalMode] = useState('add'); 
  const [editId, setEditId] = useState(null);

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [activeCategory, setActiveCategory] = useState('SEMUA'); // Filter Kategori Baru
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

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
        setProducts(myProducts.reverse());
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory]);

  const getImageUrl = (imageUrl) => {
    let finalImageUrl = "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=100&q=80";
    if (imageUrl) {
      try {
        const parsedImage = JSON.parse(imageUrl);
        if (Array.isArray(parsedImage) && parsedImage.length > 0) finalImageUrl = `http://localhost:5000${parsedImage[0]}`;
        else finalImageUrl = `http://localhost:5000${imageUrl}`;
      } catch (e) { finalImageUrl = `http://localhost:5000${imageUrl}`; }
    }
    return finalImageUrl;
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setEditId(null);
    setFormData({ name: '', price: '', stock: '', description: '', processingMethod: '', elevation: '', tastingNotes: '', category: 'ROBUSTA' });
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setModalMode('edit');
    setEditId(product.id);
    setFormData({ 
      name: product.name, price: product.price, stock: product.stock, 
      description: product.description || '', processingMethod: product.processingMethod || '', 
      elevation: product.elevation || '', tastingNotes: product.tastingNotes || '', category: product.category || 'ROBUSTA'
    });
    setImageFiles([]); 
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('price', parseInt(formData.price));
    dataToSend.append('stock', parseInt(formData.stock));
    dataToSend.append('minOrder', 5); 
    dataToSend.append('category', formData.category);
    
    if (formData.description) dataToSend.append('description', formData.description);
    if (formData.processingMethod) dataToSend.append('processingMethod', formData.processingMethod);
    if (formData.elevation) dataToSend.append('elevation', formData.elevation);
    if (formData.tastingNotes) dataToSend.append('tastingNotes', formData.tastingNotes);
    
    if (imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) dataToSend.append('images', imageFiles[i]); 
    }

    try {
      const url = modalMode === 'add' ? 'http://localhost:5000/api/products' : `http://localhost:5000/api/products/${editId}`;
      const response = await fetch(url, { method: modalMode === 'add' ? 'POST' : 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: dataToSend });

      if (response.ok) {
        alert(modalMode === 'add' ? 'Kopi berhasil ditambahkan!' : 'Kopi berhasil diperbarui!');
        setIsModalOpen(false);
        fetchMyProducts(); 
        if (modalMode === 'add') setCurrentPage(1);
      } else {
        const result = await response.json();
        alert(`Gagal: ${result.message}`);
      }
    } catch (error) { alert('Terjadi kesalahan pada server.'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kopi ini secara permanen?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) fetchMyProducts(); 
      else alert('Gagal menghapus produk.');
    } catch (error) { console.error("Gagal menghapus:", error); }
  };

  // Filter Ganda: Pencarian & Kategori
  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = activeCategory === 'SEMUA' || product.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // ==========================================
  // KALKULASI STATISTIK OTOMATIS
  // ==========================================
  const totalVarian = products.length;
  const stokTipis = products.filter(p => p.stock > 0 && p.stock <= 20).length; // Stok di bawah 20kg dianggap tipis
  const asetNilai = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans text-[#1A1D20]">
      
      <SidebarPetani isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} activePage="inventaris" />

      <main className="flex-1 flex flex-col relative overflow-y-auto w-full">
        
        <header className="bg-white h-[80px] px-5 lg:px-10 flex justify-between items-center border-b border-[#EFEFEF] sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-[#3A2210] bg-[#F8F9FA] hover:bg-[#EFEFEF] rounded-lg transition-colors focus:outline-none">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <div className="text-[18px] lg:text-[22px] font-bold text-[#1A1D20]">Manajemen Inventaris</div>
          </div>
          <div className="hidden lg:flex items-center gap-3 font-semibold text-[#1A1D20] px-4 py-2 bg-[#F8F9FA] rounded-full cursor-default">
            <span>{user.name}</span>
            <div className="w-9 h-9 bg-[#A86431] text-white rounded-full flex items-center justify-center text-[14px] uppercase">{initial}</div>
          </div>
        </header>

        <div className="p-5 lg:p-10 max-w-[1200px] mx-auto w-full box-border">
          
          {/* ================= WIDGET STATISTIK BARU ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-[#EFEFEF] shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex items-center gap-5 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)] transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center shrink-0">
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <div>
                <h4 className="m-0 mb-2 text-[14px] text-[#6C757D] font-medium">Total Varian Kopi</h4>
                <p className="m-0 text-[28px] font-bold text-[#1A1D20]">{totalVarian} <span className="text-[14px] font-medium text-[#6C757D]">SKU</span></p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#EFEFEF] shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex items-center gap-5 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)] transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center shrink-0">
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <div>
                <h4 className="m-0 mb-2 text-[14px] text-[#6C757D] font-medium">Peringatan Stok Tipis</h4>
                <p className="m-0 text-[28px] font-bold text-[#1A1D20]">{stokTipis} <span className="text-[14px] font-medium text-[#EF4444]">Butuh restock</span></p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#EFEFEF] shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex items-center gap-5 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)] transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center shrink-0">
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <div>
                <h4 className="m-0 mb-2 text-[14px] text-[#6C757D] font-medium">Estimasi Nilai Aset</h4>
                <p className="m-0 text-[22px] md:text-[24px] font-bold text-[#1A1D20]">Rp {(asetNilai / 1000000).toFixed(1)} Jt</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#EFEFEF] overflow-hidden">
            
            {/* ================= TOOLBAR ATAS TABEL ================= */}
            <div className="p-6 md:px-8 border-b border-[#EFEFEF] bg-[#FAFAFA] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto hide-scrollbar">
                  {['SEMUA', 'ROBUSTA', 'ARABIKA', 'BLEND'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-full border text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer 
                        ${activeCategory === cat ? 'bg-[#1A1D20] text-white border-[#1A1D20]' : 'bg-white text-[#6C757D] border-[#EFEFEF] hover:bg-[#F8F9FA]'}`}
                    >
                      {cat === 'SEMUA' ? 'Semua' : cat === 'HOUSE_BLEND' ? 'Blend' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
                
                <div className="relative w-full sm:w-[250px]">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6C757D] w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari nama kopi..." className="w-full pl-10 pr-4 py-2 bg-white border border-[#EFEFEF] rounded-full text-[13px] outline-none focus:border-[#A86431] transition-colors" />
                </div>
              </div>

              <button onClick={handleOpenAdd} className="w-full md:w-auto bg-[#A86431] text-white border-none py-2.5 px-5 rounded-lg font-semibold text-[14px] cursor-pointer transition-all hover:bg-[#3A2210] flex items-center justify-center gap-2 shadow-sm">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Tambah Kopi Baru
              </button>
            </div>
            
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-4 px-8 text-[13px] text-[#6C757D] uppercase border-b-2 border-[#F8F9FA] whitespace-nowrap font-semibold">Produk Kopi</th>
                    <th className="text-left py-4 px-8 text-[13px] text-[#6C757D] uppercase border-b-2 border-[#F8F9FA] whitespace-nowrap font-semibold">Harga (Kg)</th>
                    <th className="text-left py-4 px-8 text-[13px] text-[#6C757D] uppercase border-b-2 border-[#F8F9FA] whitespace-nowrap font-semibold">Ketersediaan Stok</th>
                    <th className="text-left py-4 px-8 text-[13px] text-[#6C757D] uppercase border-b-2 border-[#F8F9FA] whitespace-nowrap font-semibold">Status Etalase</th>
                    <th className="text-left py-4 px-8 text-[13px] text-[#6C757D] uppercase border-b-2 border-[#F8F9FA] whitespace-nowrap font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-[#6C757D]">Pencarian tidak ditemukan atau inventaris kosong.</td>
                    </tr>
                  ) : (
                    currentProducts.map((item) => {
                      // Logika Bar Stok Visual
                      let stockStatus = 'Aman';
                      let stockColorText = 'text-[#10B981]';
                      let stockColorBg = 'bg-[#10B981]';
                      let stockPercent = Math.min((item.stock / 100) * 100, 100);

                      if (item.stock <= 0) {
                        stockStatus = 'Habis'; stockColorText = 'text-[#EF4444]'; stockColorBg = 'bg-[#EF4444]'; stockPercent = 0;
                      } else if (item.stock <= 20) {
                        stockStatus = 'Tipis'; stockColorText = 'text-[#EF4444]'; stockColorBg = 'bg-[#EF4444]';
                      } else if (item.stock <= 50) {
                        stockStatus = 'Sedang'; stockColorText = 'text-[#F59E0B]'; stockColorBg = 'bg-[#F59E0B]';
                      }

                      return (
                        <tr key={item.id} className="hover:bg-[#FCFCFC] transition-colors border-b border-[#EFEFEF] group">
                          <td className="py-5 px-8 whitespace-nowrap align-middle">
                            <div className="flex items-center gap-4">
                              <div className="w-[50px] h-[50px] rounded-xl overflow-hidden bg-[#EFEFEF] shrink-0">
                                <img src={getImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-[#1A1D20] text-[15px] mb-1 truncate">{item.name}</div>
                                <span className="text-[12px] text-[#6C757D] font-mono bg-[#F8F9FA] px-1.5 py-0.5 rounded">SKU: RBS-{item.id.substring(0,4).toUpperCase()}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-8 whitespace-nowrap font-bold text-[#1A1D20] align-middle">
                            Rp {item.price.toLocaleString('id-ID')}
                          </td>
                          <td className="py-5 px-8 whitespace-nowrap align-middle">
                            {/* Visual Stock Bar */}
                            <div className="w-[120px]">
                              <div className="flex justify-between text-[12px] font-bold mb-1.5">
                                <span>{item.stock} Kg</span>
                                <span className={stockColorText}>{stockStatus}</span>
                              </div>
                              <div className="w-full h-1.5 bg-[#EFEFEF] rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500 ${stockColorBg}`} style={{ width: `${stockPercent}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-8 whitespace-nowrap align-middle">
                            <span className="inline-flex items-center gap-1.5 text-[#10B981] font-bold text-[13px]">
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg> Aktif
                            </span>
                          </td>
                          <td className="py-5 px-8 whitespace-nowrap align-middle">
                            <div className="flex gap-2">
                              {/* SVG Edit Btn */}
                              <button onClick={() => handleOpenEdit(item)} className="w-9 h-9 rounded-lg border border-[#EFEFEF] bg-white text-[#6C757D] flex items-center justify-center cursor-pointer transition-colors hover:border-[#A86431] hover:text-[#A86431] hover:bg-[#FDF9F5]">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                              </button>
                              {/* SVG Delete Btn */}
                              <button onClick={() => handleDeleteProduct(item.id)} className="w-9 h-9 rounded-lg border border-[#EFEFEF] bg-white text-[#6C757D] flex items-center justify-center cursor-pointer transition-colors hover:border-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEF2F2]">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-[#EFEFEF] bg-[#FAFAFA] flex flex-col sm:flex-row justify-between items-center">
                <span className="text-[13px] text-[#6C757D] font-medium mb-4 sm:mb-0">
                  Menampilkan {indexOfFirstProduct + 1} - {Math.min(indexOfLastProduct, filteredProducts.length)} dari {filteredProducts.length} kopi
                </span>
                
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border border-[#EFEFEF] bg-white text-[13px] font-semibold text-[#1A1D20] disabled:opacity-40 hover:bg-[#F8F9FA] transition-colors cursor-pointer">&laquo; Prev</button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-[13px] font-bold flex items-center justify-center transition-colors cursor-pointer ${currentPage === page ? 'bg-[#1A1D20] text-white border-[#1A1D20]' : 'bg-white text-[#6C757D] hover:bg-[#F8F9FA] border border-[#EFEFEF]'}`}>{page}</button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border border-[#EFEFEF] bg-white text-[13px] font-semibold text-[#1A1D20] disabled:opacity-40 hover:bg-[#F8F9FA] transition-colors cursor-pointer">Next &raquo;</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ================= MODAL TAMBAH & EDIT KOPI ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4 transition-opacity">
          <div className="bg-white w-full max-w-[600px] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh] animate-fade-in-up">
            
            <div className="flex justify-between items-center p-6 border-b border-[#EFEFEF] shrink-0">
              <h3 className="m-0 text-[20px] font-bold text-[#3A2210]">
                {modalMode === 'add' ? 'Tambah Inventaris Kopi' : 'Edit Inventaris Kopi'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-none border-none text-[28px] text-[#6C757D] cursor-pointer leading-none hover:text-[#1A1D20]">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="productForm" onSubmit={handleSaveProduct}>
                
                <div className="mb-5">
                  <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Nama Kopi <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431]" placeholder="Cth: Robusta Premium Natar" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Harga Jual (Rp/Kg) <span className="text-red-500">*</span></label>
                    <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full p-3 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431]" />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Stok Awal (Kg) <span className="text-red-500">*</span></label>
                    <input type="number" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full p-3 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431]" />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Kategori Kopi <span className="text-red-500">*</span></label>
                  <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-3 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431] appearance-none cursor-pointer" style={{ backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23717171%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px top 50%', backgroundSize: '12px auto' }}>
                    <option value="ROBUSTA">Kopi Robusta</option>
                    <option value="ARABIKA">Kopi Arabika</option>
                    <option value="BLEND">House Blend / Campuran</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Proses Pascapanen</label>
                    <input type="text" value={formData.processingMethod} onChange={(e) => setFormData({...formData, processingMethod: e.target.value})} className="w-full p-3 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431]" />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Ketinggian Tanam</label>
                    <input type="text" value={formData.elevation} onChange={(e) => setFormData({...formData, elevation: e.target.value})} className="w-full p-3 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431]" />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Tasting Notes</label>
                  <input type="text" value={formData.tastingNotes} onChange={(e) => setFormData({...formData, tastingNotes: e.target.value})} className="w-full p-3 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431]" />
                </div>

                <div className="mb-5">
                  <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Deskripsi Kopi</label>
                  <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-3 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431] resize-y"></textarea>
                </div>

                <div className="mb-2">
                  <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Foto Produk <span className="text-[#6C757D] font-normal">(Opsional)</span></label>
                  <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files))} className="w-full text-sm text-[#6C757D] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FDF9F5] file:text-[#A86431] hover:file:bg-[#F8F9FA] cursor-pointer border border-[#EFEFEF] p-2 rounded-lg" />
                  {imageFiles.length > 0 && <p className="text-[13px] text-[#10B981] mt-2 font-medium">✓ {imageFiles.length} file gambar baru dipilih</p>}
                  {modalMode === 'edit' && imageFiles.length === 0 && <p className="text-[12px] text-gray-400 mt-2">Biarkan kosong jika tidak ingin mengubah foto.</p>}
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-[#EFEFEF] shrink-0 bg-[#F8F9FA] rounded-b-2xl flex gap-3 justify-end">
              <button type="button" onClick={() => setIsModalOpen(false)} className="py-3 px-6 bg-white border border-[#EFEFEF] rounded-lg font-semibold cursor-pointer text-[#6C757D] hover:bg-gray-50 transition-colors">Batal</button>
              <button type="submit" form="productForm" className="py-3 px-6 bg-[#A86431] text-white border-none rounded-lg font-semibold cursor-pointer flex items-center gap-2 hover:bg-[#3A2210] transition-colors shadow-sm">
                {modalMode === 'add' ? 'Simpan Produk' : 'Simpan Perubahan'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default InventarisPetani;