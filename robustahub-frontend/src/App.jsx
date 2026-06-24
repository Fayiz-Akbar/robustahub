import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import Login from './pages/Login';
import Register from './pages/Register';
import KatalogKopi from './pages/KatalogKopi';
import DashboardPetani from './pages/DashboardPetani';
import InventarisPetani from './pages/InventarisPetani';
import PesananPetani from './pages/PesananPetani';
import PengaturanPetani from './pages/PengaturanPetani';
import DetailProduk from './pages/DetailProduk';
import KeranjangBelanja from './pages/KeranjangBelanja';
import CheckoutPembayaran from './pages/CheckoutPembayaran';
import ProfilPembeli from './pages/ProfilPembeli';
import RiwayatPesanan from './pages/RiwayatPesanan';
import Notifikasi from './pages/Notifikasi';
import DetailPesananPetani from './pages/DetailPesananPetani';
import LacakPesanan from './pages/LacakPesanan';
import SemuaKopi from './pages/SemuaKopi';
import AnalisisBisnis from './pages/AnalisisBisnis';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Routes>
          {/* Rute Autentikasi (Tidak pakai Navbar) */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<DashboardPetani />} />
          <Route path="/inventaris" element={<InventarisPetani />} />
          <Route path="/pesanan" element={<PesananPetani />} />
          <Route path="/pengaturan" element={<PengaturanPetani />} />
          <Route path="/produk/:id" element={<DetailProduk />} />
          <Route path="/keranjang" element={<KeranjangBelanja />} />
          
          {/* 📍 FIX: UBAH PATH DI BAWAH INI AGAR COCOK DENGAN KODE CHECKOUT */}
          <Route path="/checkout-pembayaran" element={<CheckoutPembayaran />} />

          {/* Rute lain */}
          <Route path="/katalog" element={<KatalogKopi />} />
          <Route path="/profil" element={<ProfilPembeli />} />
          <Route path="/riwayat" element={<RiwayatPesanan />} />
          <Route path="/notifikasi" element={<Notifikasi />} />
          <Route path="/detail-pesanan/:id" element={<DetailPesananPetani />} />
          <Route path="/lacak-pesanan" element={<LacakPesanan />} />
          <Route path="/semua-kopi" element={<SemuaKopi />} />
          <Route path="/analisis-bisnis" element={<AnalisisBisnis />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;