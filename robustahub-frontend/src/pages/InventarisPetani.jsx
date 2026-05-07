import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarPetani from '../components/SidebarPetani';

const InventarisPetani = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State untuk membedakan apakah Modal sedang "Tambah" atau "Edit"
  const [modalMode, setModalMode] = useState('add'); 
  const [editId, setEditId] = useState(null);

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // State untuk search bar
  
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
        // Urutkan dari yang terbaru (opsional)
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

  // Fungsi Helper untuk Parsing Gambar JSON
  const getImageUrl = (imageUrl) => {
    let finalImageUrl = "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=100&q=80";
    if (imageUrl) {
      try {
        const parsedImage = JSON.parse(imageUrl);
        if (Array.isArray(parsedImage) && parsedImage.length > 0) {
          finalImageUrl = `http://localhost:5000${parsedImage[0]}`;
        } else {
          finalImageUrl = `http://localhost:5000${imageUrl}`;
        }
      } catch (e) {
        finalImageUrl = `http://localhost:5000${imageUrl}`;
      }
    }
    return finalImageUrl;
  };

  // Buka Modal untuk Tambah
  const handleOpenAdd = () => {
    setModalMode('add');
    setEditId(null);
    setFormData({ name: '', price: '', stock: '', description: '', processingMethod: '', elevation: '', tastingNotes: '', category: 'ROBUSTA' });
    setImageFiles([]);
    setIsModalOpen(true);
  };

  // Buka Modal untuk Edit
  const handleOpenEdit = (product) => {
    setModalMode('edit');
    setEditId(product.id);
    setFormData({ 
      name: product.name, 
      price: product.price, 
      stock: product.stock, 
      description: product.description || '', 
      processingMethod: product.processingMethod || '', 
      elevation: product.elevation || '', 
      tastingNotes: product.tastingNotes || '',
      category: product.category || 'ROBUSTA'
    });
    setImageFiles([]); // Kosongkan file input, karena edit foto opsional
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
      for (let i = 0; i < imageFiles.length; i++) {
        dataToSend.append('images', imageFiles[i]); 
      }
    }

    try {
      // Jika mode 'add', lakukan POST. Jika mode 'edit', lakukan PUT/PATCH
      const url = modalMode === 'add' 
        ? 'http://localhost:5000/api/products' 
        : `http://localhost:5000/api/products/${editId}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: dataToSend
      });

      if (response.ok) {
        alert(modalMode === 'add' ? 'Kopi berhasil ditambahkan!' : 'Kopi berhasil diperbarui!');
        setIsModalOpen(false);
        fetchMyProducts(); 
      } else {
        const result = await response.json();
        alert(`Gagal: ${result.message}`);
      }
    } catch (error) {
      alert('Terjadi kesalahan pada server.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kopi ini secara permanen?')) return;
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

  // Fitur Filter Search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans text-[#1A1D20]">
      
      {/* Panggil komponen Sidebar, set activePage ke "inventaris" */}
      <SidebarPetani 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activePage="inventaris" 
      />

      <main className="flex-1 flex flex-col relative overflow-y-auto w-full">
        
        {/* Header Desktop & Mobile */}
        <header className="bg-white h-[80px] px-5 lg:px-10 flex justify-between items-center border-b border-[#EFEFEF] sticky top-0 z-50">
          <div className="text-[18px] lg:text-[22px] font-bold text-[#1A1D20]">
            Kelola Inventaris
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 font-semibold text-[#1A1D20] px-4 py-2 bg-[#F8F9FA] rounded-full cursor-default">
              <span>{user.name}</span>
              <div className="w-9 h-9 bg-[#A86431] text-white rounded-full flex items-center justify-center text-[14px] uppercase">
                {initial}
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-[#3A2210] bg-[#F8F9FA] hover:bg-[#EFEFEF] rounded-lg transition-colors focus:outline-none">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </header>

        <div className="p-5 lg:p-10 max-w-[1200px] mx-auto w-full box-border">
          
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-black/5 overflow-hidden">
            
            {/* Toolbar Atas Tabel: Search & Tombol Tambah */}
            <div className="p-6 md:px-8 border-b border-[#EFEFEF] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              
              {/* Search Bar Khusus Inventaris */}
              <div className="relative w-full md:w-[350px]">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C757D] w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama kopi..." 
                  className="w-full pl-11 pr-4 py-2.5 bg-[#F8F9FA] border border-[#EFEFEF] rounded-lg text-[14px] outline-none focus:border-[#A86431] transition-colors"
                />
              </div>

              <button onClick={handleOpenAdd} className="w-full md:w-auto bg-[#3A2210] text-white border-none py-2.5 px-5 rounded-lg font-semibold text-[14px] cursor-pointer transition-all hover:bg-[#A86431] hover:shadow-[0_6px_15px_rgba(168,100,49,0.3)] flex items-center justify-center gap-2">
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
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-[#6C757D]">
                        {searchTerm ? 'Pencarian tidak ditemukan.' : 'Belum ada produk kopi di inventaris Anda.'}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((item) => (
                      <tr key={item.id} className="hover:bg-[#FDF9F5] transition-colors group">
                        <td className="py-4 px-8 border-b border-[#EFEFEF] whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#EFEFEF] shrink-0 border border-gray-200">
                              <img src={getImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[#3A2210] text-[15px] truncate">{item.name}</div>
                              <div className="text-[12px] text-[#A86431] mt-0.5 truncate font-medium">
                                Kategori: {item.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-8 border-b border-[#EFEFEF] whitespace-nowrap font-bold text-[#A86431]">
                          Rp {item.price.toLocaleString('id-ID')}
                        </td>
                        <td className="py-4 px-8 border-b border-[#EFEFEF] whitespace-nowrap">
                           {item.stock > 0 ? (
                             <span className="inline-flex items-center gap-1.5 bg-[#E1F8EF] text-[#10B981] py-1 px-3 rounded-full text-[13px] font-semibold">
                               <div className="w-2 h-2 bg-[#10B981] rounded-full"></div> 
                               Tersedia ({item.stock}kg)
                             </span>
                           ) : (
                             <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 py-1 px-3 rounded-full text-[13px] font-semibold">
                               <div className="w-2 h-2 bg-red-600 rounded-full"></div> 
                               Habis
                             </span>
                           )}
                        </td>
                        <td className="py-4 px-8 border-b border-[#EFEFEF] whitespace-nowrap">
                          <div className="flex gap-2">
                            {/* Tombol Edit Baru */}
                            <button onClick={() => handleOpenEdit(item)} className="py-1.5 px-3 rounded-md border border-[#EFEFEF] font-semibold cursor-pointer transition-colors text-[#3B82F6] bg-white hover:bg-blue-50 hover:border-blue-200">
                              Edit
                            </button>
                            <button onClick={() => handleDeleteProduct(item.id)} className="py-1.5 px-3 rounded-md border border-[#EFEFEF] font-semibold cursor-pointer transition-colors text-red-500 bg-white hover:bg-red-50 hover:border-red-200">
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

      {/* ================= MODAL TAMBAH & EDIT KOPI ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white w-full max-w-[600px] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-[#EFEFEF] shrink-0">
              <h3 className="m-0 text-[20px] font-bold text-[#3A2210]">
                {modalMode === 'add' ? 'Tambah Produk Kopi' : 'Edit Produk Kopi'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-none border-none text-[28px] text-[#6C757D] cursor-pointer leading-none hover:text-[#1A1D20]">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="productForm" onSubmit={handleSaveProduct}>
                
                <div className="mb-5">
                  <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">
                    Foto Produk <span className="text-[#6C757D] font-normal">(Opsional)</span>
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={(e) => setImageFiles(Array.from(e.target.files))}
                    className="w-full text-sm text-[#6C757D] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FDF9F5] file:text-[#A86431] hover:file:bg-[#F8F9FA] cursor-pointer border border-[#EFEFEF] p-2 rounded-lg" 
                  />
                  {imageFiles.length > 0 && (
                    <p className="text-[13px] text-[#10B981] mt-2 font-medium">✓ {imageFiles.length} file gambar baru dipilih</p>
                  )}
                  {modalMode === 'edit' && imageFiles.length === 0 && (
                     <p className="text-[12px] text-gray-400 mt-2">Biarkan kosong jika tidak ingin mengubah foto.</p>
                  )}
                </div>

                <div className="mb-5">
                  <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Kategori Kopi <span className="text-red-500">*</span></label>
                  <select 
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431] appearance-none cursor-pointer"
                    style={{ backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23717171%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px top 50%', backgroundSize: '12px auto' }}
                  >
                    <option value="ROBUSTA">Kopi Robusta</option>
                    <option value="ARABIKA">Kopi Arabika</option>
                    <option value="BLEND">House Blend / Campuran</option>
                  </select>
                </div>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Harga per Kilogram (Rp) <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431]" 
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
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Proses Pascapanen</label>
                    <input 
                      type="text" 
                      value={formData.processingMethod}
                      onChange={(e) => setFormData({...formData, processingMethod: e.target.value})}
                      className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431]" 
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Ketinggian Tanam</label>
                    <input 
                      type="text" 
                      value={formData.elevation}
                      onChange={(e) => setFormData({...formData, elevation: e.target.value})}
                      className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431]" 
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Tasting Notes</label>
                  <input 
                    type="text" 
                    value={formData.tastingNotes}
                    onChange={(e) => setFormData({...formData, tastingNotes: e.target.value})}
                    className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431]" 
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-[14px] font-semibold mb-2 text-[#1A1D20]">Deskripsi Kopi</label>
                  <textarea 
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full py-3 px-4 border border-[#EFEFEF] rounded-lg font-sans text-[14px] outline-none focus:border-[#A86431] resize-y" 
                  ></textarea>
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-[#EFEFEF] shrink-0 bg-[#F8F9FA] rounded-b-2xl flex gap-3 justify-end">
              <button type="button" onClick={() => setIsModalOpen(false)} className="py-2.5 px-6 bg-white border border-[#EFEFEF] rounded-lg font-semibold cursor-pointer text-[#6C757D] hover:bg-gray-50">Batal</button>
              <button type="submit" form="productForm" className="py-2.5 px-6 bg-[#3A2210] text-white border-none rounded-lg font-semibold cursor-pointer flex items-center gap-2 hover:bg-[#A86431] transition-colors shadow-sm">
                {modalMode === 'add' ? 'Simpan Kopi' : 'Simpan Perubahan'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default InventarisPetani;